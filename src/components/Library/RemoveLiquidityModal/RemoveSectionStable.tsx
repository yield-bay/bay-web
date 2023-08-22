import { FC, useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import {
  // evmPosLoadingAtom,
  lpUpdatedAtom,
  removeLiqModalOpenAtom,
  slippageModalOpenAtom,
} from "@store/commonAtoms";
import { formatTokenSymbols, getLpTokenSymbol } from "@utils/farmListMethods";
import {
  useAccount,
  useBalance,
  // useContractRead,
  useContractWrite,
  useNetwork,
  usePublicClient,
  useWaitForTransaction,
} from "wagmi";
import MButton from "../MButton";
import {
  // farmsAtom,
  lpTokenPricesAtom,
  positionsAtom,
  selectedFarmAtom,
  slippageAtom,
  tokenPricesAtom,
} from "@store/atoms";
import { Address, formatUnits, parseAbi, parseUnits } from "viem";
import {
  fixedAmtNum,
  getRemoveLiqStableFunctionName,
  getRouterAbi,
} from "@utils/abis/contract-helper-methods";
import { FarmType, UnderlyingAssets } from "@utils/types/common";
import { Method } from "@utils/types/enums";
import useLPBalance from "@hooks/useLPBalance";
import LiquidityModalWrapper from "../LiquidityModalWrapper";
import Image from "next/image";
import Spinner from "../Spinner";
import { useApproveToken, useIsApprovedToken } from "@hooks/useApprovalHooks";
import Link from "next/link";
import { CogIcon } from "@heroicons/react/solid";
import useCalcMinAmount from "@utils/useCalcMinAmount";
import toUnits from "@utils/toUnits";
import WrongNetworkModal from "../WrongNetworkModal";
import useGasEstimation from "@hooks/useGasEstimation";
import { getNativeTokenAddress } from "@utils/network";
import BigNumber from "bignumber.js";
import ChosenMethod from "./ChosenMethod";
import { handleRemoveLiquidityEvent } from "@utils/tracking";
import getTimestamp from "@utils/getTimestamp";
import { updateEvmPositions } from "@utils/position-utils/evmPositions";
import Countdown from "../Countdown";
import { createNumRegex } from "@utils/createRegex";
import SlippageBox from "../SlippageBox";

enum RemoveMethod {
  ALL = 0,
  INDIVIDUAL = 1,
}

const RemoveSectionStable: FC = () => {
  const [isOpen, setIsOpen] = useAtom(removeLiqModalOpenAtom);
  const [farm] = useAtom(selectedFarmAtom);
  const [isSlippageModalOpen, setIsSlippageModalOpen] = useAtom(
    slippageModalOpenAtom
  );
  const [lpUpdated, setLpUpdated] = useAtom(lpUpdatedAtom);
  const [SLIPPAGE] = useAtom(slippageAtom);

  const { chain } = useNetwork();
  const { address, connector } = useAccount();
  const publicClient = usePublicClient();

  const [txnHash, setTxnHash] = useState<string>("");

  // const [farms] = useAtom(farmsAtom);
  const [positions, setPositions] = useAtom(positionsAtom);
  const [lpTokenPricesMap, setLpTokenPricesMap] = useAtom(lpTokenPricesAtom);
  const [tokenPricesMap] = useAtom(tokenPricesAtom);
  const [isSlippageStep, setIsSlippageStep] = useState(false);
  // const [, setIsEvmPosLoading] = useAtom(evmPosLoadingAtom);

  // useEffect(() => console.log("farm @removeliq", farm), [farm]);

  // Balance of LP Token
  const { lpBalanceObj, lpBalance, lpBalanceLoading } = useLPBalance(
    farm?.asset.address!
  );

  const [percentage, setPercentage] = useState("");
  const [lpTokens, setLpTokens] = useState("");
  const [methodId, setMethodId] = useState<Method>(Method.PERCENTAGE);
  const [removeMethodId, setRemoveMethodId] = useState<RemoveMethod>(
    RemoveMethod.INDIVIDUAL
  );
  const [indiTokenId, setIndiTokenId] = useState<number>(0);

  const tokenNames = formatTokenSymbols(farm?.asset.symbol ?? "");

  const tokensArr = farm?.asset.underlyingAssets ?? [];
  const tokens = useMemo(() => {
    if (!tokensArr) return new Array<UnderlyingAssets>();
    return tokensArr;
  }, [tokensArr]);

  // Transaction Process Steps
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [isProcessStep, setIsProcessStep] = useState(false);

  // When InputType.Percentage
  const handlePercChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = parseFloat(event.target.value);
    if (
      /^(?:[1-9][0-9]{0,1}|0|100)$/.test(event.target.value) ||
      event.target.value === ""
    ) {
      if ((value >= 0 && value <= 100) || event.target.value == "") {
        setPercentage(event.target.value);
      } else {
        alert("Percentage must be between 0 & 100!");
      }
    }
  };

  // When InputType.Token
  const handleLpTokensChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = event.target.value;
    const regex = createNumRegex(18);
    if (regex.test(value) || value === "") {
      setLpTokens(event.target.value);
    }
  };

  const { data: nativeBal, isLoading: isLoadingNativeBal } = useBalance({
    address,
    chainId: chain?.id,
    enabled: !!address,
  });

  const [nativePrice, setNativePrice] = useState<number>(0);
  useEffect(() => {
    const { tokenSymbol, tokenAddress } = getNativeTokenAddress(farm?.chain!);
    const tokenPrice =
      tokenPricesMap[
        `${farm?.chain!}-${farm?.protocol!}-${tokenSymbol}-${tokenAddress}`
      ];
    // console.log(
    //   "tokenkey",
    //   `${farm?.chain!}-${farm?.protocol!}-${tokenSymbol}-${tokenAddress}`
    // );
    // console.log("token", tokenPrice);
    if (!!tokenPrice && typeof tokenPrice == "number") {
      // console.log("...setting tokenprice", tokenPrice);
      setNativePrice(tokenPrice);
    }
  }, [farm, tokenPricesMap]);

  const { minAmount, isLoadingMinAmount } = useCalcMinAmount(
    tokens,
    methodId == Method.PERCENTAGE
      ? parseFloat(
          percentage !== "" ? (parseFloat(percentage) / 100).toString() : "0"
        ) * parseFloat(lpBalance ?? "0")
      : parseFloat(lpTokens !== "" ? lpTokens : "0"),
    farm!,
    removeMethodId,
    indiTokenId
  );

  useEffect(() => {
    if (!isLoadingMinAmount) {
      // console.log("minamoutdata removeliq stable", minAmount);
    }
  }, [isLoadingMinAmount]);

  const getArgs = (
    removalId: number,
    protocol: string,
    tokenIndex: number,
    timestamp: number
  ) => {
    // console.log(
    //   "ingalpb",
    //   minAmount,
    //   lpBalance,
    //   parseFloat(lpBalance!),
    //   lpTokens,
    //   parseFloat(lpTokens)
    // );

    let mm = BigNumber(lpBalance!, 10)
      .multipliedBy(parseFloat(percentage == "" ? "0" : percentage) / 100)
      .multipliedBy(BigNumber(10).pow(18))
      .decimalPlaces(0, 1);
    // console.log("MMis", mm.toString(), mm);
    const tokenAmount =
      methodId == Method.PERCENTAGE
        ? mm.toString()
        : BigNumber(lpTokens)
            .multipliedBy(BigNumber(10).pow(18))
            .decimalPlaces(0, 1)
            .toString();
    if (removalId === 1) {
      const parsedMinAmount = parseUnits(
        `${minAmount as number}`,
        tokens[tokenIndex]?.decimals
      );
      if (protocol.toLowerCase() == "curve") {
        return [tokenAmount, tokenIndex, parsedMinAmount];
      } else {
        return [tokenAmount, tokenIndex, parsedMinAmount, timestamp];
      }
    } else {
      const parsedMinAmountList = (minAmount as number[]).map((amount) => {
        return parseUnits(`${amount}`, tokens[tokenIndex]?.decimals);
      });
      return [tokenAmount, parsedMinAmountList, timestamp];
    }
  };

  // Check if already approved
  const {
    data: isLpApprovedData,
    isLoading: isLpApprovedLoading,
    isSuccess: isLpApprovedSuccess,
  } = useIsApprovedToken(
    farm?.asset.address!,
    farm?.router!,
    lpBalanceObj,
    methodId == Method.PERCENTAGE
      ? (fixedAmtNum(lpBalance) * fixedAmtNum(percentage)) / 100
      : fixedAmtNum(lpTokens)
  );

  // Approve LP token
  const {
    isLoadingApproveCall: approveLpLoading,
    isLoadingApproveTxn: approveLpLoadingTxn,
    isSuccessApproveTxn: approveLpSuccessTxn,
    writeAsync: approveLpToken,
  } = useApproveToken(
    farm?.asset.address!,
    farm?.router!,
    getLpTokenSymbol(tokenNames),
    lpBalanceObj
  );

  // Remove Liquidity Call
  const {
    data: removeLiqData,
    isLoading: isLoadingRemoveLiqCall,
    isError: isErrorRemoveLiqCall,
    writeAsync: removeLiquidity,
  } = useContractWrite({
    address: farm?.router,
    abi: parseAbi(
      getRouterAbi(
        farm?.protocol!,
        farm?.farmType == "StandardAmm" ? false : true
      )
    ),
    functionName: getRemoveLiqStableFunctionName(
      removeMethodId,
      farm?.protocol!
    ) as any,
    chainId: chain?.id,
  });

  // Wait removeLiquidity Txn
  const {
    data: removeLiqTxnData,
    isLoading: isLoadingRemoveLiqTxn,
    isError: isErrorRemoveLiqTxn,
    isSuccess: isSuccessRemoveLiqTxn,
  } = useWaitForTransaction({
    hash: removeLiqData?.hash,
  });

  useEffect(() => {
    if (isLoadingRemoveLiqCall) {
      // console.log("removeliq method loading... sign the txn");
    } else if (isLoadingRemoveLiqTxn) {
      // console.log("removeliq txn loading...", isLoadingRemoveLiqTxn);
    }
  }, [isLoadingRemoveLiqCall, isLoadingRemoveLiqTxn]);

  useEffect(() => {
    if (isSuccessRemoveLiqTxn) {
      // console.log("liquidity removed successfully", removeLiqTxnData);

      handleRemoveLiquidityEvent({
        userAddress: address!,
        walletType: "EVM",
        walletProvider: connector?.name!,
        timestamp: getTimestamp(),
        farm: {
          id: farm?.id!,
          chef: farm?.chef!,
          chain: farm?.chain!,
          protocol: farm?.protocol!,
          assetSymbol: farm?.asset.symbol!,
        },
        underlyingAmounts:
          removeMethodId == RemoveMethod.ALL
            ? tokens?.map((token, index) => {
                return {
                  amount: (minAmount as number[])[index],
                  asset: token.symbol,
                  valueUSD:
                    tokenPricesMap[
                      `${farm?.chain!}-${farm?.protocol!}-${token.symbol}-${
                        token.address
                      }`
                    ],
                };
              })
            : [
                // RemoveMethod.INDIVIDUAL
                {
                  amount: minAmount as number,
                  asset: tokens[indiTokenId]?.symbol,
                  valueUSD:
                    tokenPricesMap[
                      `${farm?.chain!}-${farm?.protocol!}-${
                        tokens[indiTokenId]?.symbol
                      }-${tokens[indiTokenId]?.address}`
                    ],
                },
              ],
        lpAmount: {
          amount:
            methodId == Method.PERCENTAGE
              ? (fixedAmtNum(lpBalance) * fixedAmtNum(percentage)) / 100
              : fixedAmtNum(lpTokens),
          asset: farm?.asset.symbol!,
          valueUSD:
            lpTokenPricesMap[
              `${farm?.chain}-${farm?.protocol}-${farm?.asset.symbol}-${farm?.asset.address}`
            ],
        },
      });
      (async () => {
        // console.log("beforeuepos", farm?.chain!, farm?.protocol!);

        const a = await updateEvmPositions({
          farm: {
            id: farm?.id!,
            chef: farm?.chef!,
            chain: farm?.chain!,
            protocol: farm?.protocol!,
            asset: {
              symbol: farm?.asset.symbol!,
              address: farm?.asset.address!,
            },
          },
          positions,
          address,
          tokenPricesMap,
          lpTokenPricesMap,
        });
        // console.log("npos", a?.name, a?.position);
        const tempPositions = { ...positions };
        tempPositions[a?.name!] = a?.position;
        setPositions((prevState: any) => ({
          ...prevState,
          ...tempPositions,
        }));
      })();
    }
  }, [isSuccessRemoveLiqTxn]);

  const handleRemoveLiquidity = async () => {
    try {
      // Fetch latest block's timestamp
      const block = await publicClient.getBlock();
      const blocktimestamp =
        Number(block.timestamp.toString() + "000") + 60000 * 30; // Adding 30 minutes
      // console.log("timestamp fetched //", blocktimestamp);

      // console.log("calling removeliquidity method...");

      const args_to_pass = getArgs(
        removeMethodId,
        farm?.protocol!,
        indiTokenId,
        blocktimestamp
      );
      // console.log("removal_args_to_pass", args_to_pass);

      const txnRes = await removeLiquidity?.({
        args: args_to_pass,
      });
      if (!!txnRes) {
        setTxnHash(txnRes.hash);
      }
      // console.log("called removeliquidity method.", txnRes);
    } catch (error) {
      console.error(error);
    }
  };

  const InputStep = () => {
    return (
      <div className="w-full flex mt-8 flex-col gap-y-8">
        <div className="flex flex-col gap-y-3">
          <ChosenMethod
            farm={farm!}
            percentage={percentage.toString()}
            setPercentage={setPercentage}
            handlePercChange={handlePercChange}
            lpBal={lpBalance!}
            lpBalLoading={lpBalanceLoading}
            lpTokens={lpTokens.toString()}
            setLpTokens={setLpTokens}
            handleLpTokensChange={handleLpTokensChange}
            methodId={methodId}
          />
          <div
            className={clsx(
              "text-left text-base leading-6 font-bold -mt-[2px]",
              fixedAmtNum(lpBalance) < fixedAmtNum(lpTokens) &&
                methodId == Method.LP
                ? "text-[#FF9999]"
                : "hidden"
            )}
          >
            Insufficient Balance
          </div>
          <div className="inline-flex items-center justify-between text-sm font-bold leading-5">
            <div className="inline-flex gap-2 items-center">
              {["Percentage", "LP Tokens"].map((method, index) => (
                <button
                  key={index}
                  className={clsx(
                    "text-sm font-bold leading-5",
                    methodId !== index && "opacity-40"
                  )}
                  onClick={() => setMethodId(index)}
                >
                  {method}
                </button>
              ))}
            </div>
            <p className="text-[#344054] opacity-60">
              {methodId == Method.PERCENTAGE ? (
                <span>
                  {parseFloat(percentage) > 0
                    ? (
                        (fixedAmtNum(percentage) * fixedAmtNum(lpBalance)) /
                        100
                      ).toLocaleString("en-US")
                    : "0"}{" "}
                  Tokens
                </span>
              ) : (
                <span>
                  {fixedAmtNum(lpBalance) > 0
                    ? (
                        (fixedAmtNum(lpTokens) * 100) /
                        fixedAmtNum(lpBalance)
                      ).toFixed(2)
                    : 0}
                  %
                </span>
              )}
            </p>
          </div>
        </div>
        {/* Tokens to receive */}
        <div className="text-[#344054] text-left">
          <p className="text-base font-medium leading-5">You receive:</p>
          <div className="flex flex-col space-y-3 mt-3">
            {tokens.map((token, index) => (
              <button
                key={index}
                className={clsx(
                  "inline-flex items-center space-x-3 hover:-translate-y-[2px] active:translate-y-0 hover:shadow-sm transition-all duration-200 rounded-xl px-6 py-3",
                  removeMethodId == RemoveMethod.INDIVIDUAL &&
                    indiTokenId == index
                    ? "border border-[#8F8FFC] bg-[#ECECFF]"
                    : "bg-[#FAFAFA]"
                )}
                onClick={() => {
                  setRemoveMethodId(RemoveMethod.INDIVIDUAL);
                  setIndiTokenId(index);
                }}
              >
                <Image
                  src={farm!.asset.logos[index]}
                  alt={token?.address}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="inline-flex text-lg font-medium leading-5 gap-x-2">
                  {removeMethodId == RemoveMethod.INDIVIDUAL &&
                  indiTokenId == index
                    ? // ? toUnits(
                      //     Array.isArray(minAmount) ? minAmount[index] : minAmount,
                      //     3
                      //   )
                      Array.isArray(minAmount)
                      ? minAmount[index] < 0.01
                        ? "<0.01"
                        : toUnits(minAmount[index], 2)
                      : minAmount < 0.01
                      ? "<0.01"
                      : toUnits(minAmount, 2)
                    : ""}{" "}
                  {token?.symbol}
                </span>
              </button>
            ))}
            {farm?.protocol !== "curve" ? (
              <button
                className={clsx(
                  "mt-3 inline-flex items-center space-x-3 hover:-translate-y-[2px] active:translate-y-0 hover:shadow-sm transition-all duration-200 rounded-xl px-6 py-3",
                  removeMethodId == RemoveMethod.ALL
                    ? "border border-[#8F8FFC] bg-[#ECECFF]"
                    : "bg-[#FAFAFA]"
                )}
                disabled={farm?.protocol.toLowerCase() == "curve"}
                onClick={() => setRemoveMethodId(RemoveMethod.ALL)}
              >
                {tokens.map((token, index) => (
                  <p key={index} className="inline-flex items-center space-x-3">
                    <Image
                      src={farm!.asset.logos[index]}
                      alt={token?.address}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="inline-flex text-lg font-medium leading-5 gap-x-2">
                      {removeMethodId === RemoveMethod.ALL
                        ? (minAmount as number[])[index] < 0.01
                          ? "<0.01"
                          : toUnits((minAmount as number[])[index], 2)
                        : ""}{" "}
                      {token?.symbol}
                    </span>
                    {index !== tokens.length - 1 && (
                      <span className="text-lg font-medium leading-5">+</span>
                    )}
                  </p>
                ))}
              </button>
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="flex flex-row mt-6 gap-2">
          {!isLpApprovedSuccess && !approveLpSuccessTxn && (
            <MButton
              type="secondary"
              isLoading={approveLpLoading || approveLpLoadingTxn}
              text={
                approveLpLoadingTxn
                  ? "Waiting for Approval"
                  : approveLpLoading
                  ? "Sign the Txn in Wallet"
                  : `Approve ${getLpTokenSymbol(tokenNames)}`
              }
              disabled={
                approveLpSuccessTxn ||
                approveLpLoading ||
                approveLpLoadingTxn ||
                typeof approveLpToken == "undefined"
                // parseFloat(nativeBal?.formatted ?? "0") <= gasEstimate
              }
              onClick={async () => {
                const txn = await approveLpToken?.();
                // console.log("Approve0 Result", txn);
              }}
            />
          )}
          <MButton
            type="primary"
            isLoading={false}
            disabled={
              (methodId == Method.PERCENTAGE
                ? percentage == "" || percentage == "0"
                : lpTokens == "" || lpTokens == "0") ||
              (!isLpApprovedSuccess && !approveLpSuccessTxn) ||
              (methodId == Method.LP &&
                fixedAmtNum(lpTokens) > fixedAmtNum(lpBalance))
              // parseFloat(nativeBal?.formatted ?? "0") <= gasEstimate
            }
            text="Confirm Removing Liquidity"
            onClick={() => {
              setIsConfirmStep(true);
            }}
          />
        </div>
      </div>
    );
  };

  const ConfirmStep = () => {
    // console.log(
    //   "removeMethodIdconfirm",
    //   removeMethodId,
    //   indiTokenId,
    //   getRemoveLiqStableFunctionName(
    //     removeMethodId,
    //     farm?.protocol as string
    //   ) as any
    // );
    // Gas estimate
    const { gasEstimate, isError } = useGasEstimation(
      farm!.router,
      1,
      1,
      getRemoveLiqStableFunctionName(
        removeMethodId,
        farm?.protocol as string
      ) as any,
      farm!,
      address!,
      getArgs(removeMethodId, farm?.protocol!, indiTokenId, 1784096161000)
    );
    return (
      <div className="flex flex-col gap-y-8 text-left">
        <button
          className="max-w-fit hover:translate-x-2 active:-translate-x-0 transition-all duration-200 ease-in-out"
          onClick={() => setIsConfirmStep(false)}
        >
          <Image
            src="/icons/ArrowLeft.svg"
            alt="Go back"
            height={24}
            width={24}
          />
        </button>
        <h3 className="font-semibold text-base leading-5 text-[#1d2838]">
          You will receive
        </h3>
        <div className="p-6 border border-[#BEBEBE] rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            {removeMethodId == RemoveMethod.ALL ? (
              <>
                {tokens.map((token, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center space-x-3 rounded-xl bg-[#F1F1F1] px-6 py-[14px]"
                  >
                    <Image
                      src={farm!.asset.logos[index]}
                      alt={token?.address}
                      width={24}
                      height={24}
                    />
                    <span className="inline-flex text-lg font-medium leading-5 gap-x-2">
                      {(minAmount as number[])[index] < 0.01
                        ? "<0.01"
                        : toUnits((minAmount as number[])[index], 2)}{" "}
                      {token.symbol}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <div className="inline-flex items-center space-x-3 rounded-xl bg-[#F1F1F1] px-6 py-[14px]">
                <Image
                  src={farm!.asset.logos[indiTokenId]}
                  alt={tokens[indiTokenId]?.address}
                  width={24}
                  height={24}
                />
                <span className="inline-flex text-lg font-medium leading-5 gap-x-2">
                  {(minAmount as number) < 0.01
                    ? "<0.01"
                    : toUnits(minAmount as number, 2)}{" "}
                  {tokens[indiTokenId]?.symbol}
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Gas Fees // Slippage // Suff. Wallet balance */}
        <div
          className={clsx(
            "rounded-xl",
            parseFloat(nativeBal?.formatted ?? "0") > gasEstimate
              ? "bg-[#C0F9C9]"
              : "bg-[#FFB7B7]"
          )}
        >
          <div
            className={clsx(
              "flex flex-col gap-y-3 rounded-xl px-6 py-3 bg-[#ECFFEF]",
              parseFloat(nativeBal?.formatted ?? "0") > gasEstimate
                ? "bg-[#ECFFEF]"
                : "bg-[#FFE8E8]"
            )}
          >
            <div className="inline-flex justify-between text-[#4E4C4C] font-bold leading-5 text-base">
              <span>Estimated Gas Fees:</span>
              {gasEstimate === 0 && !isError ? (
                <p>estimating gas...</p>
              ) : (
                <p>
                  <span className="opacity-40 mr-2 font-semibold">
                    {gasEstimate.toFixed(3) ?? 0} {nativeBal?.symbol}
                  </span>
                  <span>${(gasEstimate * nativePrice).toFixed(5)}</span>
                </p>
              )}
            </div>
            <div className="inline-flex items-center font-medium text-[14px] leading-5 text-[#344054]">
              <span>Slippage Tolerance: {SLIPPAGE}%</span>
              <button
                onClick={() => {
                  setIsSlippageStep(true);
                  setIsConfirmStep(false);
                }}
              >
                <CogIcon className="w-4 h-4 text-[#344054] ml-2 transform origin-center hover:rotate-[30deg] transition-all duration-200" />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-y-2 items-center rounded-b-xl pt-[14px] pb-2 text-center">
            <h3 className="text-[#4E4C4C] text-base font-bold">
              {parseFloat(nativeBal?.formatted ?? "0") > gasEstimate
                ? "Sufficient"
                : "Insufficient"}{" "}
              Wallet Balance
            </h3>
            <span className="text-[#344054] opacity-50 text-sm font-medium leading-5">
              {parseFloat(nativeBal?.formatted!).toLocaleString("en-US")}{" "}
              {nativeBal?.symbol}
            </span>
          </div>
        </div>
        <MButton
          type="primary"
          isLoading={false}
          text="Confirm Withdrawal"
          onClick={() => {
            handleRemoveLiquidity();
            setIsProcessStep(true);
          }}
        />
      </div>
    );
  };

  const ProcessStep = () => {
    return (
      <div className="flex flex-col items-center gap-y-8 text-left font-semibold leading-5">
        {isSuccessRemoveLiqTxn ? (
          <>
            <Image
              src="/icons/ArrowCircleUp.svg"
              alt="Transaciton Submitted"
              width={32}
              height={32}
              className="select-none"
            />
            <h1 className="text-[#1D2939] text-xl leading-5 font-semibold">
              Transaction Submitted
            </h1>
            <hr className="border-t border-[#E3E3E3] min-w-full" />
            <div className="inline-flex gap-x-8 text-base font-semibold leading-5">
              <Link
                href={
                  farm?.chain == "moonbeam"
                    ? `https://moonscan.io/tx/${txnHash}`
                    : farm?.chain == "moonriver"
                    ? `https://moonriver.moonscan.io/tx/${txnHash}`
                    : `https://blockscout.com/astar/tx/${txnHash}`
                }
                className="text-[#9999FF] underline underline-offset-4"
                target="_blank"
                rel="noreferrer"
              >
                View on Explorer
              </Link>
              <button
                className="text-[#A3A3A3]"
                onClick={() => setIsOpen(false)}
              >
                Go Back
              </button>
            </div>
          </>
        ) : !isErrorRemoveLiqTxn && !isErrorRemoveLiqCall ? (
          <>
            <h3 className="text-base">Waiting For Confirmation</h3>
            <h2 className="text-xl">
              Withdrawing{" "}
              {methodId == Method.PERCENTAGE
                ? parseFloat(
                    percentage !== ""
                      ? (parseFloat(percentage) / 100).toString()
                      : "0"
                  ) *
                    parseFloat(lpBalance ?? "0") <
                  0.01
                  ? "<0.01"
                  : toUnits(
                      parseFloat(
                        percentage !== ""
                          ? (parseFloat(percentage) / 100).toString()
                          : "0"
                      ) * parseFloat(lpBalance ?? "0"),
                      2
                    )
                : parseFloat(lpTokens !== "" ? lpTokens : "0") < 0.01
                ? "<0.01"
                : toUnits(parseFloat(lpTokens !== "" ? lpTokens : "0"), 2)}{" "}
              {farm?.asset.symbol} Tokens
            </h2>
            <hr className="border-t border-[#E3E3E3] min-w-full" />
            <p className="text-base leading-5 font-semibold text-[##AAABAD]">
              {isLoadingRemoveLiqTxn
                ? "Waiting for transaction to complete"
                : isLoadingRemoveLiqCall
                ? "Confirm Transaction in your Wallet"
                : ""}
            </p>
            <Spinner />
          </>
        ) : (
          <>
            <h3 className="text-base">Something is Wrong</h3>
            <h2 className="text-xl">Transaction Failed!</h2>
            <hr className="border-t border-[#E3E3E3] min-w-full" />
            <Countdown
              seconds={3}
              onComplete={() => {
                setIsOpen(false);
              }}
            />
          </>
        )}
      </div>
    );
  };

  const isOpenModalCondition =
    approveLpLoading ||
    approveLpLoadingTxn ||
    isLoadingRemoveLiqCall ||
    isLoadingRemoveLiqTxn ||
    isSlippageModalOpen;

  if (farm?.chain.toLowerCase() !== chain?.name.toLowerCase()) {
    return (
      <WrongNetworkModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        farmChain={farm?.chain.toLowerCase()!}
      />
    );
  }

  return (
    !!farm && (
      <LiquidityModalWrapper
        open={isOpen || !isOpenModalCondition}
        setOpen={isOpenModalCondition ? () => {} : setIsOpen}
        title="Remove Liquidity"
      >
        {isSlippageStep ? (
          <SlippageBox
            setPrevStep={setIsConfirmStep}
            setCurrentStep={setIsSlippageStep}
          />
        ) : isProcessStep ? (
          <ProcessStep />
        ) : isConfirmStep ? (
          <ConfirmStep />
        ) : (
          <InputStep />
        )}
      </LiquidityModalWrapper>
    )
  );
};

export default RemoveSectionStable;

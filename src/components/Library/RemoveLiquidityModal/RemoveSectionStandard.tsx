import { useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import {
  // evmPosLoadingAtom,
  // lpUpdatedAtom,
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
import { parseAbi, parseUnits } from "viem";
import {
  fixedAmtNum,
  getRemoveLiquidFunctionName,
  getRouterAbi,
} from "@utils/abis/contract-helper-methods";
import { UnderlyingAssets } from "@utils/types/common";
import { Method } from "@utils/types/enums";
import useMinimumUnderlyingTokens from "./useMinUnderlyingTokens";
import useLPBalance from "@hooks/useLPBalance";
import LiquidityModalWrapper from "../LiquidityModalWrapper";
import Image from "next/image";
import { ProcessSpinner, Spinner } from "../Spinners";
import { useApproveToken, useIsApprovedToken } from "@hooks/useApprovalHooks";
import Link from "next/link";
import { CogIcon } from "@heroicons/react/solid";
import toUnits from "@utils/toUnits";
import WrongNetworkModal from "../WrongNetworkModal";
import useGasEstimation from "@hooks/useGasEstimation";
import { getNativeTokenAddress } from "@utils/network";
import ChosenMethod from "./ChosenMethod";
import {
  // fetchEvmPositions,
  updateEvmPositions,
} from "@utils/position-utils/evmPositions";
import { handleRemoveLiquidityEvent } from "@utils/tracking";
import getTimestamp from "@utils/getTimestamp";
import BigNumber from "bignumber.js";
import Countdown from "../Countdown";
import { createNumRegex } from "@utils/createRegex";
import SlippageBox from "../SlippageBox";

const THIRTY_MINUTES_IN_MS = 60000 * 30;

const RemoveSectionStandard = () => {
  const { address, connector } = useAccount();
  const publicClient = usePublicClient();

  const [isSlippageStep, setIsSlippageStep] = useState(false);
  const [isSlippageModalOpen, setIsSlippageModalOpen] = useAtom(
    slippageModalOpenAtom
  );
  const [SLIPPAGE] = useAtom(slippageAtom);
  const [isOpen, setIsOpen] = useAtom(removeLiqModalOpenAtom);
  const [farm] = useAtom(selectedFarmAtom);
  const [txnHash, setTxnHash] = useState<string>("");
  const [positions, setPositions] = useAtom(positionsAtom);
  const [lpTokenPricesMap, setLpTokenPricesMap] = useAtom(lpTokenPricesAtom);
  const [tokenPricesMap] = useAtom(tokenPricesAtom);

  const [percentage, setPercentage] = useState("");
  const [lpTokens, setLpTokens] = useState("");
  const [methodId, setMethodId] = useState<Method>(Method.PERCENTAGE);

  const { chain } = useNetwork();

  const isCorrectChain = farm?.chain.toLowerCase() == chain?.name.toLowerCase();

  // Balance of LP Token
  const { lpBalanceObj, lpBalance, lpBalanceLoading } = useLPBalance(
    farm?.asset.address!,
    isCorrectChain
  );

  const tokenNames = formatTokenSymbols(farm?.asset.symbol ?? "");
  const [farmAsset0, farmAsset1] =
    farm?.asset.underlyingAssets ?? new Array<UnderlyingAssets>();

  // The minimum amoun of tokens that will be returned when removing liquidity from a liquidity pool
  const minUnderlyingAssets = useMinimumUnderlyingTokens(
    farm?.asset.address!,
    farm?.protocol!,
    methodId == Method.PERCENTAGE
      ? (parseFloat(lpBalance!) *
          parseFloat(percentage == "" ? "0" : percentage)) /
          100
      : parseFloat(lpTokens),
    SLIPPAGE,
    farm?.asset.underlyingAssets[0].decimals!,
    farm?.asset.underlyingAssets[1].decimals!,
    isCorrectChain
  );

  // Transaction Process Steps
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [isProcessStep, setIsProcessStep] = useState(false);

  // When Method.Percentage
  const handlePercChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = parseFloat(event.target.value); // Removes any non-number items and converts to Number
    // if ((value >= 0 && value <= 100) || event.target.value == "") {
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

  // When Method.Token
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
    enabled: !!address && isCorrectChain,
  });

  const [nativePrice, setNativePrice] = useState<number>(0);
  useEffect(() => {
    const { tokenSymbol, tokenAddress } = getNativeTokenAddress(farm?.chain!);
    const tokenPrice =
      tokenPricesMap[
        `${farm?.chain!}-${farm?.protocol!}-${tokenSymbol}-${tokenAddress}`
      ];
    if (!!tokenPrice && typeof tokenPrice == "number") {
      setNativePrice(tokenPrice);
    }
  }, [farm, tokenPricesMap]);

  const removeAmount = useMemo(() => {
    return methodId == Method.PERCENTAGE
      ? (parseFloat(lpBalance!) *
          parseFloat(percentage == "" ? "0" : percentage)) /
          100
      : parseFloat(lpTokens == "" ? "0" : lpTokens);
  }, [methodId, percentage, lpTokens]);

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
      : fixedAmtNum(lpTokens),
    isCorrectChain
  );

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

  // Remove Liquidity
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
    functionName: getRemoveLiquidFunctionName(farm?.protocol!) as any,
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

  // useEffect(() => {
  // if (isLoadingRemoveLiqTxn) {
  // console.log("removeliq method loading... sign the txn");
  // } else if (isLoadingRemoveLiqTxn) {
  // console.log("removeliq txn loading...", isLoadingRemoveLiqTxn);
  // }
  // }, [isLoadingRemoveLiqTxn, isLoadingRemoveLiqTxn]);

  useEffect(() => {
    if (isSuccessRemoveLiqTxn) {
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
        underlyingAmounts: farm?.asset.underlyingAssets.map((asset, index) => {
          return {
            amount: minUnderlyingAssets[index],
            asset: asset.symbol,
            valueUSD:
              tokenPricesMap[
                `${farm?.chain!}-${farm?.protocol!}-${asset.symbol}-${
                  asset.address
                }`
              ],
          };
        })!,
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
        Number(block.timestamp.toString() + "000") + THIRTY_MINUTES_IN_MS; // Adding 30 minutes

      const removeArgs = [
        farmAsset0?.address, // tokenA Address
        farmAsset1?.address, // tokenB Address
        methodId == Method.PERCENTAGE // Amount to remove
          ? BigNumber(lpBalance!, 10)
              .multipliedBy(
                parseFloat(percentage == "" ? "0" : percentage) / 100
              )
              .multipliedBy(BigNumber(10).pow(18))
              .decimalPlaces(0, 1)
              .toString()
          : BigNumber(lpTokens)
              .multipliedBy(BigNumber(10).pow(18))
              .decimalPlaces(0, 1)
              .toString(),
        BigNumber(minUnderlyingAssets[0].toString()) // amountAMin
          .multipliedBy(BigNumber(10).pow(farmAsset0?.decimals))
          .decimalPlaces(0, 1)
          .toString(),
        BigNumber(minUnderlyingAssets[1].toString()) // amountBMin
          .multipliedBy(BigNumber(10).pow(farmAsset1?.decimals))
          .decimalPlaces(0, 1)
          .toString(),
        address, // to
        blocktimestamp, // deadline (uint256)
      ];

      const txnRes = await removeLiquidity?.({
        args: removeArgs,
      });
      if (!!txnRes) {
        setTxnHash(txnRes?.hash);
      }
    } catch (error) {
      console.error("Error in Removing liquidity", error);
    }
  };

  const InputStep = () => {
    const isProcessing = approveLpLoading || approveLpLoadingTxn;

    return (
      <div className="w-full flex mt-8 flex-col gap-y-8">
        <div
          className={clsx(
            isProcessing && "opacity-20 select-none",
            "relative flex flex-col gap-y-3"
          )}
        >
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
            disableInput={isProcessing}
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
                  className={clsx(methodId !== index && "opacity-40")}
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
        {/* Process Spinner */}
        {isProcessing && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <ProcessSpinner />
          </div>
        )}
        {/* Tokens to receive */}
        <div
          className={clsx(
            isProcessing && "opacity-20 select-none",
            "text-[#344054] text-left"
          )}
        >
          <p className="text-base font-medium leading-5">You receive:</p>
          <div className="inline-flex gap-x-4 mt-3">
            {farm?.asset.underlyingAssets.map((token, index) => (
              <div
                key={index}
                className="inline-flex items-center space-x-3 rounded-xl bg-[#F1F1F1] px-6 py-3"
              >
                <Image
                  src={farm.asset.logos[index]}
                  alt={token?.address}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="inline-flex text-lg font-medium leading-5 gap-x-2">
                  {minUnderlyingAssets[index] < 0.01
                    ? "<0.01"
                    : toUnits(minUnderlyingAssets[index], 2)}{" "}
                  {token?.symbol}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-row mt-6 gap-2">
          {isLpApprovedLoading ? (
            <MButton
              type="primary"
              isLoading={false}
              disabled={true}
              text="Checking if tokens are approved..."
            />
          ) : (
            !isLpApprovedSuccess &&
            !approveLpSuccessTxn && (
              <MButton
                type="secondary"
                isLoading={approveLpLoading || approveLpLoadingTxn}
                text={
                  (
                    methodId == Method.PERCENTAGE
                      ? fixedAmtNum(percentage) <= 0
                      : fixedAmtNum(lpTokens) <= 0
                  )
                    ? "Please enter amount"
                    : approveLpLoadingTxn
                    ? "Waiting for Approval"
                    : approveLpLoading
                    ? "Sign the Txn in Wallet"
                    : `Approve ${getLpTokenSymbol(tokenNames)}`
                }
                disabled={
                  approveLpSuccessTxn ||
                  isLpApprovedLoading ||
                  approveLpLoadingTxn ||
                  typeof approveLpToken == "undefined" ||
                  (methodId == Method.PERCENTAGE
                    ? fixedAmtNum(percentage) <= 0
                    : fixedAmtNum(lpTokens) <= 0) ||
                  (methodId == Method.LP &&
                    fixedAmtNum(lpTokens) > fixedAmtNum(lpBalance))
                }
                onClick={async () => {
                  try {
                    const txn = await approveLpToken?.();
                    // console.log("Approve0 Result", txn);
                  } catch (error) {
                    console.error(
                      `error while approving ${farm?.asset.symbol}`,
                      error
                    );
                  }
                }}
              />
            )
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
    // Gas estimate
    const { gasEstimate, isError } = useGasEstimation(
      farm!.router,
      1,
      1,
      getRemoveLiquidFunctionName(farm?.protocol as string) as any,
      farm!,
      address!,
      [
        farmAsset0?.address, // tokenA Address
        farmAsset1?.address, // tokenB Address
        methodId == Method.PERCENTAGE // Lp Amount to be removed
          ? BigNumber(lpBalance!, 10)
              .multipliedBy(
                parseFloat(percentage == "" ? "0" : percentage) / 100
              )
              .multipliedBy(BigNumber(10).pow(18))
              .decimalPlaces(0, 1)
              .toString()
          : BigNumber(lpTokens)
              .multipliedBy(BigNumber(10).pow(18))
              .decimalPlaces(0, 1)
              .toString(),
        BigNumber(minUnderlyingAssets[0].toString()) // amountAMin
          .multipliedBy(BigNumber(10).pow(farmAsset0?.decimals))
          .decimalPlaces(0, 1)
          .toString(),
        BigNumber(minUnderlyingAssets[1].toString()) // amountBMin
          .multipliedBy(BigNumber(10).pow(farmAsset1?.decimals))
          .decimalPlaces(0, 1)
          .toString(),
        address, // to
        1784096161000, // deadline (uint256)
      ]
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
          <div className="inline-flex gap-x-4">
            {farm?.asset.underlyingAssets.map((token, index) => (
              <div
                key={index}
                className="inline-flex items-center space-x-3 rounded-xl bg-[#F1F1F1] px-6 py-[14px]"
              >
                <Image
                  src={farm.asset.logos[index]}
                  alt={token?.address}
                  width={24}
                  height={24}
                />
                <span className="inline-flex text-lg font-medium leading-5 gap-x-2">
                  {minUnderlyingAssets[index] < 0.01
                    ? "<0.01"
                    : toUnits(minUnderlyingAssets[index], 2)}{" "}
                  {token?.symbol}
                </span>
              </div>
            ))}
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
              {isError ? (
                <p className="text-red-400">Error estimating gas</p>
              ) : gasEstimate === 0 ? (
                <p>estimating gas...</p>
              ) : (
                <p>
                  <span className="opacity-40 mr-2 font-semibold">
                    {gasEstimate < 0.001 ? "<0.001" : gasEstimate.toFixed(3)}{" "}
                    {nativeBal?.symbol}
                  </span>
                  {gasEstimate * nativePrice < 0.00001 ? (
                    "<$0.00001"
                  ) : (
                    <span>${(gasEstimate * nativePrice).toFixed(5)}</span>
                  )}
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
          disabled={isError}
          text="Confirm Withdrawal"
          onClick={async () => {
            await handleRemoveLiquidity();
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
              {removeAmount < 0.01 ? "<0.01" : toUnits(removeAmount, 2)}{" "}
              {farmAsset0?.symbol}/{farmAsset1?.symbol} LP Tokens
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

  if (!isCorrectChain) {
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
        open={isOpen || isOpenModalCondition}
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

export default RemoveSectionStandard;

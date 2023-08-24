import { FC, useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import {
  lpUpdatedAtom,
  slippageModalOpenAtom,
  stakingModalOpenAtom,
} from "@store/commonAtoms";
import { formatTokenSymbols, getLpTokenSymbol } from "@utils/farmListMethods";
import {
  useAccount,
  useBalance,
  useContractWrite,
  useNetwork,
  useWaitForTransaction,
} from "wagmi";
import MButton from "../MButton";
import {
  lpTokenPricesAtom,
  positionsAtom,
  selectedFarmAtom,
  slippageAtom,
  tokenPricesAtom,
} from "@store/atoms";
// import { stellaswapV1ChefAbi } from "@components/Common/Layout/evmUtils";
import { Address, parseAbi, parseUnits } from "viem";
import { useApproveToken, useIsApprovedToken } from "@hooks/useApprovalHooks";
import LiquidityModalWrapper from "../LiquidityModalWrapper";
import { CogIcon } from "@heroicons/react/solid";
import Image from "next/image";
import { FarmType } from "@utils/types/common";
import Spinner from "../Spinner";
import Link from "next/link";
import { fixedAmtNum, getChefAbi } from "@utils/abis/contract-helper-methods";
import WrongNetworkModal from "../WrongNetworkModal";
import useGasEstimation from "@hooks/useGasEstimation";
import { getNativeTokenAddress } from "@utils/network";
import { handleStakeEvent } from "@utils/tracking";
import getTimestamp from "@utils/getTimestamp";
import toUnits from "@utils/toUnits";
import BigNumber from "bignumber.js";
import { updateEvmPositions } from "@utils/position-utils/evmPositions";
import Countdown from "../Countdown";
import { createNumRegex } from "@utils/createRegex";
import SlippageBox from "../SlippageBox";

interface ChosenMethodProps {
  farm: FarmType;
  percentage: string;
  setPercentage: (value: string) => void;
  handlePercChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  lpBal: string;
  lpBalLoading: boolean;
  lpTokens: string;
  setLpTokens: (value: string) => void;
  handleLpTokensChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  methodId: number;
}

const StakingModal = () => {
  const { address, connector } = useAccount();
  const { chain } = useNetwork();

  const [lpUpdated, setLpUpdated] = useAtom(lpUpdatedAtom);
  const [lpTokenPricesMap] = useAtom(lpTokenPricesAtom);

  const [isSlippageModalOpen, setIsSlippageModalOpen] = useAtom(
    slippageModalOpenAtom
  );
  const [SLIPPAGE] = useAtom(slippageAtom);
  const [isOpen, setIsOpen] = useAtom(stakingModalOpenAtom);
  const [farm] = useAtom(selectedFarmAtom);
  const [positions, setPositions] = useAtom(positionsAtom);

  const [percentage, setPercentage] = useState("");
  const [lpTokens, setLpTokens] = useState("");
  const [methodId, setMethodId] = useState<number>(0);
  const [txnHash, setTxnHash] = useState<string>("");

  // Transaction Process Steps
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [isProcessStep, setIsProcessStep] = useState(false);
  const [isSlippageStep, setIsSlippageStep] = useState(false);

  const tokenNames = formatTokenSymbols(farm?.asset.symbol ?? "");

  useEffect(() => {
    // console.log("selectedFarm", farm);
  }, [farm]);

  // When InputType.Percentage
  const handlePercChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = parseFloat(event.target.value); // Removes any non-number items and converts to Number
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
      setLpTokens(value);
    }
  };

  useEffect(() => {
    setPercentage("");
    setLpTokens("");
    setIsConfirmStep(false);
    setIsProcessStep(false);
  }, [isOpen]);

  const { data: nativeBal, isLoading: isLoadingNativeBal } = useBalance({
    address,
    chainId: chain?.id,
    enabled: !!address,
  });

  const getArgs = () => {
    const pamt = BigNumber(lpBalance?.formatted!, 10)
      .multipliedBy(parseFloat(percentage == "" ? "0" : percentage) / 100)
      .multipliedBy(BigNumber(10).pow(18))
      .decimalPlaces(0, 1)
      .toString();
    // console.log("stakinggaargs", lpBalanceNum, pamt);

    const amt =
      methodId == 0
        ? // ? parseUnits(
          //     `${
          //       (lpBalanceNum * parseFloat(percentage == "" ? "0" : percentage)) /
          //       100
          //     }`,
          //     18
          //   )
          pamt
        : BigNumber(lpTokens == "" ? "0" : lpTokens)
            .multipliedBy(BigNumber(10).pow(18))
            .decimalPlaces(0, 1)
            .toString();
    // console.log(
    //   "samt",
    //   amt,
    //   lpBalanceNum,
    //   lpTokens,
    //   lpBalance,
    //   lpBalance?.formatted
    // );
    // : parseUnits(`${parseFloat(lpTokens == "" ? "0" : lpTokens)}`, 18); // amount
    if (farm?.protocol.toLowerCase() == "curve") {
      return [amt];
    } else if (farm?.protocol.toLowerCase() == "sirius") {
      return [amt, farm?.asset.address, 1];
    } else if (farm?.protocol.toLowerCase() == "zenlink") {
      return [farm?.id, farm?.asset.address, amt];
    } else if (
      farm?.protocol.toLowerCase() == "sushiswap" ||
      farm?.protocol.toLowerCase() == "arthswap"
    ) {
      return [farm?.id, amt, address];
    } else {
      return [farm?.id, amt];
    }
  };

  const [tokenPricesMap] = useAtom(tokenPricesAtom);

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

  // // Gas estimate
  // const { gasEstimate } = useGasEstimation(
  //   farm!.chef,
  //   0,
  //   2,
  //   farm?.protocol == "zenlink" ? ("stake" as any) : ("deposit" as any),
  //   farm!,
  //   address!,
  //   getArgs()
  // );

  // Balance of LP Tokens
  const { data: lpBalance, isLoading: lpBalanceLoading } = useBalance({
    address,
    chainId: chain?.id,
    token: farm?.asset.address,
    enabled: !!farm,
  });
  const lpBalanceNum: number = !!lpBalance
    ? parseFloat(lpBalance.formatted)
    : 0;

  const {
    // data: isApprovedData,
    // isLoading: isApprovedLoading,
    isSuccess: isApprovedSuccess,
  } = useIsApprovedToken(
    farm?.asset.address!,
    farm?.chef as Address,
    lpBalance,
    methodId == 0
      ? (lpBalanceNum * fixedAmtNum(percentage)) / 100
      : fixedAmtNum(lpTokens)
  );

  const {
    isLoadingApproveCall,
    isLoadingApproveTxn,
    isSuccessApproveTxn,
    writeAsync: approveLpToken,
  } = useApproveToken(
    farm?.asset.address!,
    farm?.chef as Address,
    getLpTokenSymbol(tokenNames),
    lpBalance
  );

  // Stake LP Tokens
  const {
    data: stakingData,
    isLoading: isLoadingStakingCall,
    isError: isErrorStakingCall,
    isSuccess: isSuccessStakingCall,
    writeAsync: staking,
  } = useContractWrite({
    address: farm?.chef as Address,
    abi: parseAbi(getChefAbi(farm?.protocol!, farm?.chef as Address)),
    functionName:
      farm?.protocol == "zenlink" ? ("stake" as any) : ("deposit" as any),
    chainId: chain?.id,
  });

  // Wait staking Txn
  const {
    isLoading: isLoadingStakingTxn,
    isError: isErrorStakingTxn,
    isSuccess: isSuccessStakingTxn,
  } = useWaitForTransaction({
    hash: stakingData?.hash,
  });

  const handleStaking = async () => {
    try {
      const args = getArgs();
      // console.log("stake args", args);
      const txnRes = await staking?.({
        args: args,
      });
      if (!!txnRes) {
        // console.log("txnResult", txnRes);
        setTxnHash(txnRes.hash);
      }
    } catch (error) {
      console.error("Staking Error", error);
    }
  };

  useEffect(() => {
    if (isSuccessStakingTxn) {
      // console.log("staking txn success!");
      // Tracking
      handleStakeEvent({
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
        lpAmount: {
          amount:
            methodId == 0
              ? (lpBalanceNum * fixedAmtNum(percentage)) / 100
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
  }, [isSuccessStakingTxn]);

  const stakeAmount = useMemo(() => {
    return methodId == 0
      ? (lpBalanceNum * parseFloat(percentage == "" ? "0" : percentage)) / 100
      : parseFloat(lpTokens == "" ? "0" : lpTokens);
  }, [methodId, percentage, lpTokens]);

  const isOpenModalCondition =
    isLoadingApproveCall ||
    isLoadingApproveTxn ||
    isLoadingStakingCall ||
    isLoadingStakingTxn ||
    isSlippageModalOpen;

  const InputStep = () => {
    return (
      <div className="w-full flex mt-8 flex-col gap-y-8">
        <div className="flex flex-col gap-y-3">
          <ChosenMethod
            farm={farm!}
            percentage={percentage.toString()}
            setPercentage={setPercentage}
            handlePercChange={handlePercChange}
            lpBal={lpBalance?.formatted!}
            lpBalLoading={lpBalanceLoading}
            lpTokens={lpTokens.toString()}
            setLpTokens={setLpTokens}
            handleLpTokensChange={handleLpTokensChange}
            methodId={methodId}
          />
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
              {methodId == 0 ? (
                <span>
                  {parseFloat(percentage) > 0
                    ? (
                        (fixedAmtNum(percentage) *
                          fixedAmtNum(lpBalance?.formatted!)) /
                        100
                      ).toLocaleString("en-US")
                    : "0"}{" "}
                  Tokens
                </span>
              ) : (
                <span>
                  {fixedAmtNum(lpBalance?.formatted!) > 0
                    ? (
                        (fixedAmtNum(lpTokens) * 100) /
                        fixedAmtNum(lpBalance?.formatted!)
                      ).toFixed(2)
                    : 0}
                  %
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-row mt-6 gap-2">
          {!isApprovedSuccess && !isSuccessApproveTxn && (
            <MButton
              type="secondary"
              isLoading={isLoadingApproveTxn || isLoadingApproveCall}
              text={
                (
                  methodId == 0
                    ? fixedAmtNum(percentage) <= 0
                    : fixedAmtNum(lpTokens) <= 0 ||
                      fixedAmtNum(lpTokens) > lpBalanceNum
                )
                  ? "Please enter amount"
                  : isLoadingApproveTxn
                  ? "Waiting for Approval"
                  : isLoadingApproveCall
                  ? "Sign the Txn in Wallet"
                  : `Approve ${getLpTokenSymbol(tokenNames)}`
              }
              disabled={
                isLoadingApproveCall ||
                isLoadingApproveTxn ||
                (methodId == 0
                  ? fixedAmtNum(percentage) <= 0
                  : fixedAmtNum(lpTokens) <= 0 ||
                    fixedAmtNum(lpTokens) > lpBalanceNum) ||
                typeof approveLpToken == "undefined"
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
              (methodId == 0
                ? percentage == "" || percentage == "0"
                : lpTokens == "" ||
                  lpTokens == "0" ||
                  fixedAmtNum(lpTokens) > lpBalanceNum) ||
              !(isApprovedSuccess || isSuccessApproveTxn)
            }
            text="Confirm Staking"
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
      farm!.chef,
      0,
      2,
      farm?.protocol == "zenlink" ? ("stake" as any) : ("deposit" as any),
      farm!,
      address!,
      getArgs()
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
          You are staking
        </h3>
        <div className="flex flex-col p-6 rounded-lg border border-[#BEBEBE] gap-y-2 text-[#344054] font-bold text-lg leading-6">
          <div className="inline-flex items-center gap-x-2">
            <span>
              {stakeAmount < 0.01
                ? "<0.01"
                : stakeAmount.toLocaleString("en-US")}
            </span>
            <div className="z-10 flex overflow-hidden rounded-full">
              <Image
                src={farm?.asset.logos[0] as string}
                alt={farm?.asset.logos[0] as string}
                width={24}
                height={24}
              />
            </div>
            <div className="z-10 flex overflow-hidden rounded-full">
              <Image
                src={farm?.asset.logos[1] as string}
                alt={farm?.asset.logos[1] as string}
                width={24}
                height={24}
              />
            </div>
          </div>
          <p>{farm?.asset.symbol} Pool Tokens</p>
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
          text="Confirm Staking"
          onClick={() => {
            handleStaking();
            setIsProcessStep(true);
          }}
        />
      </div>
    );
  };

  const ProcessStep = () => {
    return (
      <div className="flex flex-col items-center gap-y-8 text-left font-semibold leading-5">
        {isSuccessStakingTxn ? (
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
        ) : !isErrorStakingCall && !isErrorStakingTxn ? (
          <>
            <h3 className="text-base">Waiting For Confirmation</h3>
            <h2 className="text-xl">
              Staking{" "}
              {stakeAmount < 0.01
                ? "<0.01"
                : stakeAmount.toLocaleString("en-US")}{" "}
              {farm?.asset.symbol} Tokens
            </h2>
            <hr className="border-t border-[#E3E3E3] min-w-full" />
            <p className="text-base leading-5 font-semibold text-[##AAABAD]">
              {isLoadingStakingTxn
                ? "Waiting for transaction to complete"
                : isLoadingStakingCall
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
        open={isOpen || isOpenModalCondition}
        setOpen={isOpenModalCondition ? () => {} : setIsOpen}
        title="Stake LP Tokens"
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

// ChosenMethod returns the type of input field
const ChosenMethod: FC<ChosenMethodProps> = ({
  farm,
  percentage,
  setPercentage,
  handlePercChange,
  lpBal,
  lpBalLoading,
  lpTokens,
  setLpTokens,
  handleLpTokensChange,
  methodId,
}) => {
  return methodId === 0 ? (
    <div className="relative flex flex-row justify-between px-6 py-[14px] border border-[#D0D5DD] rounded-lg">
      <div className="absolute text-[#344054 text-base font-medium leading-5 left-0 -top-9 flex flex-row gap-x-[6px] items-center">
        <span>Enter</span>
        <div className="inline-flex items-center justify-center -space-x-2">
          {farm?.asset.logos.map((logo, index) => (
            <div key={index} className="flex z-0 overflow-hidden rounded-full">
              <Image src={logo} alt={logo} width={24} height={24} />
            </div>
          ))}
        </div>
        <span className="font-bold">{farm?.asset?.symbol}</span>{" "}
        <span>percentage of Tokens to Stake</span>
      </div>
      <input
        placeholder="0"
        className={clsx(
          "text-base text-[#4E4C4C] font-bold leading-6 text-left bg-transparent focus:outline-none"
        )}
        onChange={handlePercChange}
        value={percentage}
        autoFocus
      />
      <span
        className={clsx(
          "flex items-center absolute top-0 bottom-0",
          percentage.length == 1
            ? "left-9"
            : percentage.length == 2
            ? "left-[46px]"
            : "left-14",
          "text-base text-[#4E4C4C] font-bold leading-6",
          percentage == "" && "hidden"
        )}
      >
        %
      </span>
      <div className="inline-flex items-center gap-x-2">
        <div className="flex flex-col items-end text-[#667085] text-sm font-bold leading-5 opacity-50">
          {lpBalLoading ? (
            <span>loading...</span>
          ) : (
            !!lpBal && (
              <p className="flex flex-col items-end">
                <span>Balance</span>
                <span>
                  {parseFloat(lpBal) < 0.01
                    ? "<0.01"
                    : toUnits(parseFloat(lpBal), 2)}
                </span>
              </p>
            )
          )}
        </div>
        <button
          className="p-2 bg-[#F1F1F1] rounded-lg text-[#8B8B8B] text-[14px] font-bold leading-5"
          onClick={() => {
            setPercentage("100");
          }}
        >
          MAX
        </button>
      </div>
    </div>
  ) : (
    <div className="relative flex flex-row justify-between px-6 py-[14px] border border-[#D0D5DD] rounded-lg">
      <div className="absolute text-[#344054 text-base font-medium leading-5 left-0 -top-9 flex flex-row gap-x-[6px] items-center">
        <span>Enter</span>
        <div className="inline-flex items-center justify-center -space-x-2">
          {farm?.asset.logos.map((logo, index) => (
            <div key={index} className="flex z-0 overflow-hidden rounded-full">
              <Image src={logo} alt={logo} width={24} height={24} />
            </div>
          ))}
        </div>
        <span className="font-bold">{farm?.asset?.symbol}</span>{" "}
        <span>Tokens to Stake</span>
      </div>
      <input
        placeholder="0"
        className={clsx(
          "text-base text-[#4E4C4C] font-bold leading-6 text-left bg-transparent focus:outline-none"
        )}
        onChange={handleLpTokensChange}
        value={lpTokens}
        autoFocus
      />
      <div className="inline-flex items-center gap-x-2">
        <p className="flex flex-col items-end text-[#667085] text-sm font-bold leading-5 opacity-50">
          {lpBalLoading ? (
            <span>loading...</span>
          ) : (
            !!lpBal && (
              <div className="flex flex-col items-end">
                <span>Balance</span>
                <span>
                  {parseFloat(lpBal) < 0.01
                    ? "<0.01"
                    : toUnits(parseFloat(lpBal), 2)}
                </span>
              </div>
            )
          )}
        </p>
        <button
          className="p-2 bg-[#F1F1F1] rounded-lg text-[#8B8B8B] text-[14px] font-bold leading-5"
          onClick={() => {
            setLpTokens(lpBal!);
          }}
        >
          MAX
        </button>
      </div>
    </div>
  );
};

export default StakingModal;

import { useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import {
  lpUpdatedAtom,
  slippageModalOpenAtom,
  unstakingModalOpenAtom,
} from "@store/commonAtoms";
import {
  useAccount,
  useBalance,
  useContractRead,
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
import { Address, parseAbi, parseUnits } from "viem";
import LiquidityModalWrapper from "../LiquidityModalWrapper";
import Image from "next/image";
import { FarmType } from "@utils/types/common";
import { Method } from "@utils/types/enums";
import Spinner from "../Spinner";
import Link from "next/link";
import { CogIcon } from "@heroicons/react/solid";
import { fixedAmtNum, getChefAbi } from "@utils/abis/contract-helper-methods";
import WrongNetworkModal from "../WrongNetworkModal";
import useGasEstimation from "@hooks/useGasEstimation";
import { getNativeTokenAddress } from "@utils/network";
import toUnits from "@utils/toUnits";
import { handleUnstakeEvent } from "@utils/tracking";
import getTimestamp from "@utils/getTimestamp";
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
  staked: string;
  isLoadingStaked: boolean;
  lpTokens: string;
  setLpTokens: (value: string) => void;
  handleLpTokensChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  methodId: Method;
}

const UnstakingModal = () => {
  const { address, connector } = useAccount();
  const { chain } = useNetwork();

  const [isSlippageModalOpen, setIsSlippageModalOpen] = useAtom(
    slippageModalOpenAtom
  );
  const [SLIPPAGE] = useAtom(slippageAtom);
  const [isOpen, setIsOpen] = useAtom(unstakingModalOpenAtom);
  const [farm] = useAtom(selectedFarmAtom);
  const [positions, setPositions] = useAtom(positionsAtom);

  const [lpUpdated, setLpUpdated] = useAtom(lpUpdatedAtom);
  const [lpTokenPricesMap] = useAtom(lpTokenPricesAtom);

  // Transaction Process Steps
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [isProcessStep, setIsProcessStep] = useState(false);
  const [isSlippageStep, setIsSlippageStep] = useState(false);

  const [percentage, setPercentage] = useState<string>("");
  const [lpTokens, setLpTokens] = useState<string>("");
  const [methodId, setMethodId] = useState<Method>(Method.PERCENTAGE);
  const [txnHash, setTrxnHash] = useState<string>("");

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
    const pamt = BigNumber(staked!, 10)
      .multipliedBy(parseFloat(percentage == "" ? "0" : percentage) / 100)
      // .multipliedBy(BigNumber(10).pow(18))
      .decimalPlaces(0, 1)
      .toString();
    // console.log(
    //   "gaars",
    //   staked,
    //   (staked * parseFloat(percentage == "" ? "0" : percentage)) / 100
    // );

    const amt =
      methodId == Method.PERCENTAGE
        ? // ? parseUnits(
          //     `${
          //       (staked * parseFloat(percentage == "" ? "0" : percentage)) / 100
          //     }`,
          //     18
          //   )
          pamt
        : BigNumber(lpTokens == "" ? "0" : lpTokens)
            .multipliedBy(BigNumber(10).pow(18))
            .decimalPlaces(0, 1)
            .toString();
    console.log("usargs", amt);
    // : parseUnits(`${parseFloat(lpTokens == "" ? "0" : lpTokens)}`, 18); // amount
    if (farm?.protocol.toLowerCase() == "curve") {
      return [amt];
    } else if (farm?.protocol.toLowerCase() == "sirius") {
      return [amt, 1];
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
    console.log(
      "tokenkey",
      `${farm?.chain!}-${farm?.protocol!}-${tokenSymbol}-${tokenAddress}`
    );
    console.log("token", tokenPrice);
    if (!!tokenPrice && typeof tokenPrice == "number") {
      console.log("...setting tokenprice", tokenPrice);
      setNativePrice(tokenPrice);
    }
  }, [farm, tokenPricesMap]);

  const chefAbi = useMemo(() => {
    return getChefAbi(farm?.protocol!, farm?.chef as Address);
  }, [farm]);

  // Deriving Staked balance
  const { data: userInfo, isLoading: isLoadingUserInfo } = useContractRead({
    address: farm?.chef as Address,
    abi: parseAbi(chefAbi),
    functionName:
      farm?.protocol == "curve" || farm?.protocol.toLowerCase() == "sirius"
        ? "balanceOf"
        : farm?.protocol == "zenlink"
        ? "getUserInfo"
        : farm?.protocol == "arthswap"
        ? "userInfos"
        : "userInfo",
    args: farm?.protocol == "curve" ? [address] : [farm?.id, address],
    enabled: !!farm && !!address,
  });

  useEffect(() => {
    console.log("userInfo", userInfo, "\nargs", {
      address: farm?.chef as Address,
      abi: parseAbi(chefAbi),
      functionName:
        farm?.protocol == "curve" || farm?.protocol.toLowerCase() == "sirius"
          ? "balanceOf"
          : "userInfo",
      args: farm?.protocol == "curve" ? [address] : [farm?.id, address],
      enabled: !!farm && !!address,
    });
  }, [userInfo]);

  const staked: string = useMemo(() => {
    console.log("stakeduserInfo", userInfo);
    if (!userInfo) return "0";
    // if (farm?.protocol == "curve") return Number(userInfo) / 10 ** 18;
    if (farm?.protocol == "curve") return userInfo.toString();
    const ui = userInfo as bigint[];
    // return Number(ui[0]) / 10 ** 18;
    return ui[0].toString();
  }, [userInfo]);

  // Unstake LP Tokens
  const {
    data: unstakingData,
    isLoading: isLoadingUnstakingCall,
    isError: isErrorUnstakingCall,
    // isSuccess: isSuccessUnstakingCall,
    writeAsync: unstaking,
  } = useContractWrite({
    address: farm?.chef as Address,
    abi: parseAbi(chefAbi),
    functionName:
      farm?.protocol == "zenlink" ? ("redeem" as any) : ("withdraw" as any),
    chainId: chain?.id,
  });

  // Wait unstaking Txn
  const {
    isLoading: isLoadingUnstakingTxn,
    isError: isErrorUnstakingTxn,
    isSuccess: isSuccessUnstakingTxn,
  } = useWaitForTransaction({
    hash: unstakingData?.hash,
  });

  const handleUnstaking = async () => {
    try {
      const args = getArgs();
      console.log("unstake args", args);
      const txnRes = await unstaking?.({
        args: args,
      });
      if (!!txnRes) {
        setTrxnHash(txnRes.hash);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isSuccessUnstakingTxn) {
      console.log("unstaking txn success!");
      // Tracking
      handleUnstakeEvent({
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
            methodId == Method.PERCENTAGE
              ? ((Number(staked) / 10 ** 18) * fixedAmtNum(percentage)) / 100
              : fixedAmtNum(lpTokens),
          asset: farm?.asset.symbol!,
          valueUSD:
            lpTokenPricesMap[
              `${farm?.chain}-${farm?.protocol}-${farm?.asset.symbol}-${farm?.asset.address}`
            ],
        },
      });
      (async () => {
        console.log("beforeuepos", farm?.chain!, farm?.protocol!);

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
        console.log("npos", a?.name, a?.position);
        const tempPositions = { ...positions };
        tempPositions[a?.name!] = a?.position;
        setPositions((prevState: any) => ({
          ...prevState,
          ...tempPositions,
        }));
      })();
    }
  }, [isSuccessUnstakingTxn]);

  const unstakeAmount = useMemo(() => {
    return methodId == Method.PERCENTAGE
      ? ((Number(staked) / 10 ** 18) *
          parseFloat(percentage == "" ? "0" : percentage)) /
          100
      : parseFloat(lpTokens == "" ? "0" : lpTokens);
  }, [methodId, percentage, lpTokens]);

  const InputStep = () => {
    const confirmDisable =
      unstakeAmount > Number(staked) / 10 ** 18 &&
      (methodId == Method.PERCENTAGE ? percentage != "" : lpTokens != "");

    return (
      <div className="w-full flex mt-8 flex-col gap-y-8">
        <div className="flex flex-col gap-y-3">
          <ChosenMethod
            farm={farm!}
            percentage={percentage.toString()}
            setPercentage={setPercentage}
            handlePercChange={handlePercChange}
            staked={staked}
            isLoadingStaked={isLoadingUserInfo}
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
              {methodId == Method.PERCENTAGE ? (
                <span>
                  {parseFloat(percentage) > 0
                    ? (
                        (fixedAmtNum(percentage) * Number(staked)) /
                        10 ** 18 /
                        100
                      ).toLocaleString("en-US")
                    : "0"}{" "}
                  Tokens
                </span>
              ) : (
                <span>
                  {BigNumber(staked).isGreaterThan(0)
                    ? (
                        (fixedAmtNum(lpTokens) * 100 * 10 ** 18) /
                        Number(staked)
                      ).toFixed(2)
                    : 0}
                  %
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="w-full">
          <MButton
            type="primary"
            isLoading={false}
            disabled={
              (methodId == Method.PERCENTAGE
                ? percentage == "" || percentage == "0"
                : lpTokens == "" || lpTokens == "0") || confirmDisable
            }
            text={confirmDisable ? "Insufficient Balance" : "Confirm Unstaking"}
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
      3,
      farm?.protocol == "zenlink" ? ("redeem" as any) : ("withdraw" as any),
      farm!,
      address!,
      getArgs()
    );
    return (
      <div className="flex flex-col gap-y-8 text-left">
        <button
          className="max-w-fit hover:translate-x-1 active:-translate-x-0 transition-all duration-200 ease-in-out"
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
          You are Unstaking
        </h3>
        <div className="flex flex-col p-6 rounded-lg border border-[#BEBEBE] gap-y-2 text-[#344054] font-bold text-lg leading-6">
          <div className="inline-flex items-center gap-x-2">
            <span>
              {unstakeAmount < 0.01
                ? "<0.01"
                : unstakeAmount.toLocaleString("en-US")}
            </span>
            {farm?.asset.underlyingAssets.map((token, index) => (
              <div key={index} className="rounded-full overflow-hidden">
                <Image
                  src={farm.asset.logos[index]}
                  alt={token?.address}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              </div>
            ))}
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
          text="Confirm Unstaking"
          onClick={() => {
            handleUnstaking();
            setIsProcessStep(true);
          }}
        />
      </div>
    );
  };

  const ProcessStep = () => {
    return (
      <div className="flex flex-col items-center gap-y-8 text-left font-semibold leading-5">
        {isSuccessUnstakingTxn ? (
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
        ) : !isErrorUnstakingCall && !isErrorUnstakingTxn ? (
          <>
            <h3 className="text-base">Waiting For Confirmation</h3>
            <h2 className="text-xl">
              Unstaking{" "}
              {unstakeAmount < 0.01
                ? "<0.01"
                : unstakeAmount.toLocaleString("en-US")}{" "}
              {farm?.asset.symbol} Tokens
            </h2>
            <hr className="border-t border-[#E3E3E3] min-w-full" />
            <p className="text-base leading-5 font-semibold text-[##AAABAD]">
              {isLoadingUnstakingTxn
                ? "Waiting for transaction to complete"
                : isLoadingUnstakingCall
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
    isLoadingUnstakingCall || isLoadingUnstakingTxn || isSlippageModalOpen;

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
        title="Unstake LP Tokens"
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
const ChosenMethod: React.FC<ChosenMethodProps> = ({
  farm,
  percentage,
  setPercentage,
  handlePercChange,
  staked,
  isLoadingStaked,
  lpTokens,
  setLpTokens,
  handleLpTokensChange,
  methodId,
}) => {
  return methodId === Method.PERCENTAGE ? (
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
        <span className="font-bold">{farm?.asset.symbol}</span>{" "}
        <span>tokens percentage to Unstake</span>
      </div>
      <input
        placeholder="0"
        className={clsx(
          "text-base text-[#4E4C4C] font-bold leading-6 text-left bg-transparent focus:outline-none after:content-end-['x']"
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
          {isLoadingStaked ? (
            <span>loading...</span>
          ) : (
            <p className="flex flex-col items-end">
              <span>Balance</span>
              <span>
                {Number(staked) / 10 ** 18 < 0.01
                  ? "<0.01"
                  : toUnits(Number(staked) / 10 ** 18, 2)}
              </span>
            </p>
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
        <span>Tokens to Remove</span>
      </div>
      <input
        placeholder="0"
        className={clsx(
          "text-base font-bold leading-6 text-left bg-transparent focus:outline-none",
          fixedAmtNum(lpTokens) > Number(staked) / 10 ** 18
            ? "text-[#FF9999]"
            : "text-[#4E4C4C]"
        )}
        onChange={handleLpTokensChange}
        value={lpTokens}
        autoFocus
      />
      <div className="inline-flex items-center gap-x-2">
        <p className="flex flex-col items-end text-[#667085] text-sm font-bold leading-5 opacity-50">
          {isLoadingStaked ? (
            <span>loading...</span>
          ) : (
            <div className="flex flex-col items-end">
              <span>Balance</span>
              <span>
                {Number(staked) / 10 ** 18 < 0.01
                  ? "<0.01"
                  : toUnits(Number(staked) / 10 ** 18, 2)}
              </span>
            </div>
          )}
        </p>
        <button
          className="p-2 bg-[#F1F1F1] rounded-lg text-[#8B8B8B] text-[14px] font-bold leading-5"
          onClick={() => {
            setLpTokens(
              BigNumber(staked).dividedBy(BigNumber(10).pow(18)).toString()
            );
          }}
        >
          MAX
        </button>
      </div>
    </div>
  );
};

export default UnstakingModal;

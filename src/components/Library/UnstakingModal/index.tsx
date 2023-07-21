import { FC, useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import {
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
import { selectedFarmAtom, slippageAtom } from "@store/atoms";
import { Address, parseAbi, parseUnits } from "viem";
import LiquidityModalWrapper from "../LiquidityModalWrapper";
import Image from "next/image";
import { FarmType } from "@utils/types";
import Spinner from "../Spinner";
import Link from "next/link";
import { CogIcon } from "@heroicons/react/solid";
import { getChefAbi } from "@utils/abis/contract-helper-methods";
import WrongNetworkModal from "../WrongNetworkModal";

interface ChosenMethodProps {
  farm: FarmType;
  percentage: string;
  setPercentage: (value: string) => void;
  handlePercChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  staked: number;
  isLoadingStaked: boolean;
  lpTokens: string;
  setLpTokens: (value: string) => void;
  handleLpTokensChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  methodId: number;
}

const UnstakingModal = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const [isSlippageModalOpen, setIsSlippageModalOpen] = useAtom(
    slippageModalOpenAtom
  );
  const [SLIPPAGE] = useAtom(slippageAtom);
  const [isOpen, setIsOpen] = useAtom(unstakingModalOpenAtom);
  const [farm] = useAtom(selectedFarmAtom);

  // Transaction Process Steps
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [isProcessStep, setIsProcessStep] = useState(false);

  const [percentage, setPercentage] = useState<string>("");
  const [lpTokens, setLpTokens] = useState<string>("");
  const [methodId, setMethodId] = useState<number>(0);
  const [txnHash, setTrxnHash] = useState<string>("");

  // When InputType.Percentage
  const handlePercChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setPercentage(event.target.value);
  };

  // When InputType.Token
  const handleLpTokensChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setLpTokens(event.target.value);
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

  const GAS_FEES = 0.0014; // In STELLA

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
        : "userInfo",
    args: farm?.protocol == "curve" ? [address] : [farm?.id, address],
    enabled: !!farm && !!address,
  });

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

  const staked: number = useMemo(() => {
    console.log("userInfo", userInfo);
    if (!userInfo) return 0;
    if (farm?.protocol == "curve") return Number(userInfo) / 10 ** 18;
    const ui = userInfo as bigint[];
    return Number(ui[0]) / 10 ** 18;
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
      const args = (() => {
        const amt =
          methodId == 0
            ? parseUnits(
                `${
                  (staked * parseFloat(percentage == "" ? "0" : percentage)) /
                  100
                }`,
                18
              )
            : parseUnits(`${parseFloat(lpTokens == "" ? "0" : lpTokens)}`, 18); // amount
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
      })();

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

  const unstakeAmount = useMemo(() => {
    return methodId == 0
      ? (staked * parseFloat(percentage == "" ? "0" : percentage)) / 100
      : parseFloat(lpTokens == "" ? "0" : lpTokens);
  }, [methodId, percentage, lpTokens]);

  const InputStep = () => {
    const confirmDisable =
      unstakeAmount > staked &&
      (methodId == 0 ? percentage != "" : lpTokens != "");

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
          <div className="inline-flex gap-2 items-center justify-start">
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
        </div>
        {/* Estimate Gas and Slippage Tolerance */}
        {/* Gas Fees // Slippage // Suff. Wallet balance */}
        <div
          className={clsx(
            "rounded-xl",
            parseFloat(nativeBal?.formatted ?? "0") > GAS_FEES
              ? "bg-[#C0F9C9]"
              : "bg-[#FFB7B7]"
          )}
        >
          <div
            className={clsx(
              "flex flex-col gap-y-3 rounded-xl px-6 py-3 bg-[#ECFFEF]",
              parseFloat(nativeBal?.formatted ?? "0") > GAS_FEES
                ? "bg-[#ECFFEF]"
                : "bg-[#FFE8E8]"
            )}
          >
            {/* <div className="inline-flex justify-between text-[#4E4C4C] font-bold leading-5 text-base">
              <span>Estimated Gas Fees:</span>
              <p>
                <span className="opacity-40 mr-2 font-semibold">
                  {GAS_FEES} STELLA
                </span>
                <span>$1234</span>
              </p>
            </div> */}
            <div className="inline-flex items-center font-medium text-[14px] leading-5 text-[#344054]">
              <span>Slippage Tolerance: {SLIPPAGE}%</span>
              <button
                onClick={() => {
                  setIsSlippageModalOpen(true);
                  setIsOpen(false);
                }}
              >
                <CogIcon className="w-4 h-4 text-[#344054] ml-2 transform origin-center hover:rotate-[30deg] transition-all duration-200" />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-y-2 items-center rounded-b-xl pt-[14px] pb-2 text-center">
            <h3 className="text-[#4E4C4C] text-base font-bold">
              {parseFloat(nativeBal?.formatted ?? "0") > GAS_FEES
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
        <div className="w-full">
          <MButton
            type="primary"
            isLoading={false}
            disabled={
              (methodId == 0
                ? percentage == "" || percentage == "0"
                : lpTokens == "" || lpTokens == "0") ||
              confirmDisable ||
              parseFloat(nativeBal?.formatted ?? "0") <= GAS_FEES
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
            <span>{unstakeAmount.toLocaleString("en-US")}</span>
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
                href={`https://moonscan.io/tx/${txnHash}`}
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
              Unstaking {unstakeAmount.toLocaleString("en-US")}{" "}
              {farm?.asset.symbol} Tokens
            </h2>
            <hr className="border-t border-[#E3E3E3] min-w-full" />
            <p className="text-base text-[#373738]">
              {isLoadingUnstakingCall
                ? "Waiting for Completion"
                : isLoadingUnstakingTxn
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
            <p className="text-base text-[#AAABAD]">Redirecting in 3s</p>
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
        {isProcessStep ? (
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
  staked,
  isLoadingStaked,
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
        <span>Tokens to Unstake</span>
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
      <div className="inline-flex items-center gap-x-2">
        <p className="flex flex-col items-end text-[#667085] text-sm font-bold leading-5 opacity-50">
          {isLoadingStaked ? (
            <span>loading...</span>
          ) : (
            <div className="flex flex-col items-end">
              <span>Balance</span>
              <span>{staked.toLocaleString("en-US")}</span>
            </div>
          )}
        </p>
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
        <span>Tokens to Unstake</span>
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
          {isLoadingStaked ? (
            <span>loading...</span>
          ) : (
            !!staked && (
              <div className="flex flex-col items-end">
                <span>Balance</span>
                <span>{staked.toLocaleString("en-US")}</span>
              </div>
            )
          )}
        </p>
        <button
          className="p-2 bg-[#F1F1F1] rounded-lg text-[#8B8B8B] text-[14px] font-bold leading-5"
          onClick={() => {
            setLpTokens(staked.toString(10));
          }}
        >
          MAX
        </button>
      </div>
    </div>
  );
};

export default UnstakingModal;

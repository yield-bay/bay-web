import { FC, useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import {
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
import { selectedFarmAtom, slippageAtom } from "@store/atoms";
// import { stellaswapV1ChefAbi } from "@components/Common/Layout/evmUtils";
import { Address, parseAbi, parseUnits } from "viem";
import { useApproveToken, useIsApprovedToken } from "@hooks/useApprovalHooks";
import LiquidityModalWrapper from "../LiquidityModalWrapper";
import { CogIcon } from "@heroicons/react/solid";
import Image from "next/image";
import { FarmType } from "@utils/types";
import Spinner from "../Spinner";
import Link from "next/link";
import { getChefAbi } from "@utils/abis/contract-helper-methods";
import WrongNetworkModal from "../WrongNetworkModal";

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
  const { address } = useAccount();
  const { chain } = useNetwork();

  const [isSlippageModalOpen, setIsSlippageModalOpen] = useAtom(
    slippageModalOpenAtom
  );
  const [SLIPPAGE] = useAtom(slippageAtom);
  const [isOpen, setIsOpen] = useAtom(stakingModalOpenAtom);
  const [farm] = useAtom(selectedFarmAtom);

  const [percentage, setPercentage] = useState("");
  const [lpTokens, setLpTokens] = useState("");
  const [methodId, setMethodId] = useState<number>(0);
  const [txnHash, setTxnHash] = useState<string>("");

  // Transaction Process Steps
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [isProcessStep, setIsProcessStep] = useState(false);

  const tokenNames = formatTokenSymbols(farm?.asset.symbol ?? "");

  useEffect(() => {
    console.log("selectedFarm", farm);
  }, [farm]);

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
    data: isApprovedData,
    isLoading: isApprovedLoading,
    isSuccess: isApprovedSuccess,
  } = useIsApprovedToken(farm?.asset.address!, farm?.chef as Address);

  const {
    isLoadingApproveCall,
    isLoadingApproveTxn,
    isSuccessApproveTxn,
    writeAsync: approveLpToken,
  } = useApproveToken(farm?.asset.address!, farm?.chef as Address);

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
      const args = (() => {
        const amt =
          methodId == 0
            ? parseUnits(
                `${
                  (lpBalanceNum *
                    parseFloat(percentage == "" ? "0" : percentage)) /
                  100
                }`,
                18
              )
            : parseUnits(`${parseFloat(lpTokens == "" ? "0" : lpTokens)}`, 18); // amount
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
      })();

      console.log("stake args", args);

      const txnRes = await staking?.({
        args: args,
      });
      if (!!txnRes) {
        setTxnHash(txnRes.hash);
      }
      console.log("txnResult", txnRes);
    } catch (error) {
      console.error(error);
    }
  };

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
                  {GAS_FEES} {nativeBal?.symbol}
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
        <div className="flex flex-row mt-6 gap-2">
          {!isApprovedSuccess && !isSuccessApproveTxn && (
            <MButton
              type="secondary"
              isLoading={isLoadingApproveTxn || isLoadingApproveCall}
              text={
                isLoadingApproveCall
                  ? "Waiting for Approval"
                  : isLoadingApproveTxn
                  ? "Sign the Txn in Wallet"
                  : `Approve ${getLpTokenSymbol(tokenNames)}`
              }
              disabled={
                isSuccessApproveTxn ||
                isLoadingApproveCall ||
                isLoadingApproveTxn ||
                typeof approveLpToken == "undefined" ||
                parseFloat(nativeBal?.formatted ?? "0") <= GAS_FEES
              }
              onClick={async () => {
                const txn = await approveLpToken?.();
                console.log("Approve0 Result", txn);
              }}
            />
          )}
          <MButton
            type="primary"
            isLoading={false}
            disabled={
              (methodId == 0
                ? percentage == "" || percentage == "0"
                : lpTokens == "" || lpTokens == "0") ||
              // !isSuccessApproveTxn ||
              parseFloat(nativeBal?.formatted ?? "0") <= GAS_FEES
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
            <span>{stakeAmount.toLocaleString("en-US")}</span>
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
        <MButton
          type="primary"
          isLoading={false}
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
                href={`https://moonscan.io/tx/${txnHash}}`}
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
              Staking {stakeAmount.toLocaleString("en-US")} {farm?.asset.symbol}{" "}
              Tokens
            </h2>
            <hr className="border-t border-[#E3E3E3] min-w-full" />
            <p className="text-base text-[#373738]">
              {isLoadingStakingCall
                ? "Waiting for Completion"
                : isLoadingStakingTxn
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
        <span>Tokens to Stake</span>
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
          {lpBalLoading ? (
            <span>loading...</span>
          ) : (
            !!lpBal && (
              <div className="flex flex-col items-end">
                <span>Balance</span>
                <span>
                  {parseFloat(lpBal).toLocaleString("en-US")}{" "}
                  {farm?.asset.symbol}
                </span>
              </div>
            )
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
        <span>Tokens to Remove</span>
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
                  {parseFloat(lpBal).toLocaleString("en-US")}{" "}
                  {farm?.asset.symbol}
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

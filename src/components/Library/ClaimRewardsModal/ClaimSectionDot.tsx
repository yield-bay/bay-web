import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAtom } from "jotai";
import clsx from "clsx";
import LiquidityModalWrapper from "../LiquidityModalWrapper";
import { selectedPositionAtom } from "@store/atoms";
import { claimModalOpenAtom } from "@store/commonAtoms";
import { Spinner } from "@chakra-ui/react";
import MButton from "../MButton";
import { dotAccountAtom } from "@store/accountAtoms";

const GAS_FEES = 0.0014; // In STELLA

const ClaimSectionDot = () => {
  const [isOpen, setIsOpen] = useAtom(claimModalOpenAtom);
  const [account] = useAtom(dotAccountAtom);
  const [position] = useAtom(selectedPositionAtom);

  useEffect(() => console.log("selected position @claimrewards"), [position]);

  const [isProcessStep, setIsProcessStep] = useState(false);
  const isOpenModalCondition = false; // Conditions to be written
  const [txnHash, setTxnHash] = useState<string>("");

  useEffect(() => {
    setIsProcessStep(false);
  }, [isOpen]);

  // MGX Balance
  // fetchMGXBalance();

  const handleClaimRewards = async () => {
    try {
      console.log("called claim rewards method");
    } catch (error) {
      console.error("error while claiming rewards:", error);
    }
  };

  const InputStep = () => {
    return (
      <div className="w-full flex flex-col gap-y-8">
        {/* Tokens to receive */}
        <div className="text-[#344054] text-left">
          <p className="text-base font-medium leading-5">You receive:</p>
          <div className="inline-flex gap-x-4 mt-3">
            {position?.unclaimedRewards.map((reward, index) => (
              <div
                key={index}
                className="inline-flex items-center space-x-3 rounded-xl bg-[#F1F1F1] px-6 py-3"
              >
                <Image
                  src={`https://raw.githubusercontent.com/yield-bay/assets/main/list/${reward.token.toUpperCase()}.png`}
                  alt={reward.token + "_logo"}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="inline-flex text-lg font-medium leading-5 gap-x-2">
                  {reward.amount >= 0.01
                    ? parseFloat(reward.amount.toFixed(2)).toLocaleString(
                        "en-US"
                      )
                    : "<0.01"}{" "}
                  {reward.token}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Estimate Gas */}
        <div
          className={clsx(
            "rounded-xl",
            // parseFloat(nativeBal?.formatted ?? "0") > GAS_FEES
            "bg-[#C0F9C9]"
            // : "bg-[#FFB7B7]"
          )}
        >
          <div
            className={clsx(
              "flex flex-col gap-y-3 rounded-xl px-6 py-3 bg-[#ECFFEF]",
              // parseFloat(nativeBal?.formatted ?? "0") > GAS_FEES
              "bg-[#ECFFEF]"
              // : "bg-[#FFE8E8]"
            )}
          >
            <div className="inline-flex justify-between text-[#4E4C4C] font-bold leading-5 text-base">
              <span>Estimated Gas Fees:</span>
              <p>
                <span className="opacity-40 mr-2 font-semibold">
                  {GAS_FEES} STELLA
                </span>
                <span>$1234</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-y-2 items-center rounded-b-xl pt-[14px] pb-2 text-center">
            <h3 className="text-[#4E4C4C] text-base font-bold">
              {/* {parseFloat(nativeBal?.formatted ?? "0") > GAS_FEES */}
              {"Sufficient"}
              {/* : "Insufficient"}{" "} */}
              Wallet Balance
            </h3>
            {false ? (
              <span className="text-[#344054] opacity-50 text-sm font-medium leading-5">
                loading balance...
              </span>
            ) : (
              <span className="text-[#344054] opacity-50 text-sm font-medium leading-5">
                {"24"} {"MGX"}
                {/* {nativeBal?.formatted} {nativeBal?.symbol} */}
              </span>
            )}
          </div>
        </div>
        <MButton
          type="primary"
          className="mt-4"
          isLoading={false}
          text="Claim Rewards"
          onClick={() => {
            setIsProcessStep(true);
            handleClaimRewards();
          }}
        />
      </div>
    );
  };

  const ProcessStep = () => {
    return (
      <div className="flex flex-col items-center gap-y-8 text-left font-semibold leading-5">
        {/* {isSuccessClaimRewardsTxn ? ( */}
        {false ? (
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
              <button
                className="text-[#A3A3A3]"
                onClick={() => setIsOpen(false)}
              >
                Go Back
              </button>
            </div>
          </>
        ) : // ) : !isErrorClaimRewardsTxn && !isErrorClaimRewardsCall ? (
        true ? (
          <>
            <h3 className="text-base">Waiting For Confirmation</h3>
            <h2 className="text-xl">Withdrawing 50 STELLA/GLMR LP Tokens</h2>
            <hr className="border-t border-[#E3E3E3] min-w-full" />
            <p className="text-base text-[#373738]">
              {/* {isLoadingClaimRewardsTxn
                ? "Waiting for Transaction to cComplete"
                : isLoadingClaimRewardsCall
                ? "Confirm Transaction in your Wallet"
                : ""} */}
              Waiting for Transaction to Complete
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

  return !!position ? (
    <LiquidityModalWrapper
      open={isOpen || isOpenModalCondition}
      setOpen={isOpenModalCondition ? () => {} : setIsOpen}
      title="Claim Rewards"
    >
      <div>{isProcessStep ? <ProcessStep /> : <InputStep />}</div>
    </LiquidityModalWrapper>
  ) : (
    <></>
  );
};

export default ClaimSectionDot;

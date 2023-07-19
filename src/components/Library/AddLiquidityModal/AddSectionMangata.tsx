// Library Imports
import { FC, useRef, PropsWithChildren, useEffect, useState } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import Image from "next/image";

// Component, Util and Hook Imports
import MButton from "@components/Library/MButton";
import Spinner from "@components/Library/Spinner";
import { addLiqModalOpenAtom, slippageModalOpenAtom } from "@store/commonAtoms";
import { UnderlyingAssets } from "@utils/types";
import LiquidityModalWrapper from "../LiquidityModalWrapper";
import { CogIcon } from "@heroicons/react/solid";
import { selectedFarmAtom, slippageAtom, tokenPricesAtom } from "@store/atoms";

enum InputType {
  Off = -1,
  First = 0,
  Second = 1,
}

const AddSectionMangata: FC<PropsWithChildren> = () => {
  const [isOpen, setIsOpen] = useAtom(addLiqModalOpenAtom);
  const [selectedFarm] = useAtom(selectedFarmAtom);
  const [isSlippageModalOpen, setIsSlippageModalOpen] = useAtom(
    slippageModalOpenAtom
  );

  // const [tokenPricesMap] = useAtom(tokenPricesAtom);
  const [SLIPPAGE] = useAtom(slippageAtom);

  // Input focus states
  const [focusedInput, setFocusedInput] = useState<InputType>(InputType.First);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const secondInputRef = useRef<HTMLInputElement>(null);

  const [farmAsset0, farmAsset1] =
    selectedFarm?.asset.underlyingAssets ?? new Array<UnderlyingAssets>();

  // Transaction Process Steps
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [isProcessStep, setIsProcessStep] = useState(false);

  useEffect(() => {
    console.log("selectedFarm", selectedFarm);
  }, [selectedFarm]);

  // Amount States
  const [firstTokenAmount, setFirstTokenAmount] = useState("");
  const [secondTokenAmount, setSecondTokenAmount] = useState("");

  useEffect(() => {
    if (firstInputRef.current && secondInputRef.current) {
      if (focusedInput == InputType.First) {
        firstInputRef.current.focus();
      } else if (focusedInput == InputType.Second) {
        secondInputRef.current.focus();
      }
    }
  }, []);

  useEffect(() => {
    // Empty the values when Modal is opened or closed
    setFirstTokenAmount("");
    setSecondTokenAmount("");
  }, [isOpen]);

  const handleAddLiquidity = async () => {
    console.log("So, you want to Add Liquidity!");
  };

  const getFirstTokenRelation = () => {};

  const getSecondTokenRelation = () => {};

  // Updated tokenAmounts based on value of other token
  const updateSecondTokenAmount = (firstTokenAmount: number) => {};

  const updateFirstTokenAmount = (secondTokenAmount: number) => {};

  // update first token values
  const handleChangeFirstTokenAmount = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFirstTokenAmount(e.target.value);
    // update first amount based on second
    updateSecondTokenAmount(parseFloat(e.target.value));
  };

  // update token values
  const handleChangeSecondTokenAmount = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSecondTokenAmount(e.target.value);
    // update first amount based on second
    updateFirstTokenAmount(parseFloat(e.target.value));
  };

  // Method to handle max button for first token
  // const handleMaxFirstToken = () => {
  //   if (farmAsset0?.symbol == "MGX") {
  //     // toast({
  //     //   position: "top",
  //     //   duration: 3000,
  //     //   render: () => (
  //     //     <ToastWrapper
  //     //       title="Insufficient balance to pay gas fees!"
  //     //       status="warning"
  //     //     />
  //     //   ),
  //     // });
  //   } else if (farmAsset1?.symbol == "MGX") {
  //     setFirstTokenAmount(
  //       firstTokenBalance
  //         ? (firstTokenBalance - (fees ?? 0) - 20).toString()
  //         : ""
  //     );
  //   } else {
  //     setFirstTokenAmount(
  //       firstTokenBalance ? firstTokenBalance.toString() : ""
  //     );
  //   }
  //   updateSecondTokenAmount(firstTokenBalance as number);
  // };

  // // Method to handle max button for second token
  // const handleMaxSecondToken = () => {
  //   // Checking if user has enough balance to pay gas fees
  //   if (
  //     (secondTokenBalance as number) < 20 &&
  //     (token1 == "MGR" || token1 == "MGX")
  //   ) {
  //     // toast({
  //     //   position: "top",
  //     //   duration: 3000,
  //     //   render: () => (
  //     //     <ToastWrapper
  //     //       title="Insufficient balance to pay gas fees!"
  //     //       status="warning"
  //     //     />
  //     //   ),
  //     // });
  //   } else if (token1 == "MGR" || token1 == "MGX") {
  //     setSecondTokenAmount(
  //       secondTokenBalance
  //         ? (secondTokenBalance - (fees ?? 0) - 20).toString()
  //         : ""
  //     );
  //   } else {
  //     setSecondTokenAmount(
  //       secondTokenBalance ? secondTokenBalance.toString() : ""
  //     );
  //   }
  //   updateFirstTokenAmount(secondTokenBalance as number);
  // };

  const InputStep = () => {
    return (
      <div className="w-full mt-9 flex flex-col gap-y-3">
        {/* First token Container */}
        <div className="relative flex flex-row justify-between px-6 py-[14px] border border-[#D0D5DD] rounded-lg">
          <div className="absolute left-0 -top-9 flex flex-row gap-x-[6px] items-center">
            <div className="z-10 flex overflow-hidden rounded-full">
              <Image
                src={selectedFarm?.asset.logos[0] as string}
                alt={selectedFarm?.asset.logos[0] as string}
                width={24}
                height={24}
              />
            </div>
            <span className="text-[#344054 text-[14px] font-medium leading-5">
              {farmAsset0?.symbol}
            </span>
          </div>
          <input
            placeholder="0"
            className={clsx(
              "text-base text-[#4E4C4C] font-bold leading-6 text-left bg-transparent focus:outline-none"
            )}
            onChange={handleChangeFirstTokenAmount}
            value={firstTokenAmount}
            name="firstTokenAmount"
            id="firstTokenAmount"
            ref={firstInputRef}
            // onBlur={() => setFocusedInput(InputType.Off)}
            onFocus={() => setFocusedInput(InputType.First)}
            autoFocus={focusedInput === InputType.First}
          />
          <div className="inline-flex items-center gap-x-2">
            <div className="flex flex-col items-end text-sm leading-5 opacity-50">
              {/* {token0BalanceLoading ? ( */}
              {false ? (
                <span>loading...</span>
              ) : (
                // !!token0Balance && (
                <div className="flex flex-col items-end">
                  <span>Balance</span>
                  <span>
                    10
                    {farmAsset0?.symbol}
                  </span>
                </div>
              )}
            </div>
            <button
              className="p-2 bg-[#F1F1F1] rounded-lg text-[#8B8B8B] text-[14px] font-bold leading-5"
              onClick={handleMaxFirstToken}
            >
              MAX
            </button>
          </div>
        </div>
        {/* Low Balance */}
        {/* {fixedAmtNum(firstTokenAmount) >
          fixedAmtNum(token0Balance?.formatted) && (
          <div className="text-[#FF9999] leading-6 font-semibold text-base text-left">
            You need{" "}
            {fixedAmtNum(firstTokenAmount) -
              fixedAmtNum(token0Balance?.formatted)}{" "}
            {farmAsset0?.symbol} for creating an LP token with{" "}
            {fixedAmtNum(secondTokenAmount)}
            {farmAsset1?.symbol}
          </div>
        )} */}
        {/* Plus Icon */}
        <div className="bg-[#e0dcdc] flex justify-center p-3 max-w-fit items-center rounded-full text-base select-none mx-auto">
          <Image src="/icons/PlusIcon.svg" alt="Plus" width={16} height={16} />
        </div>
        {/* Second token container */}
        <div className="relative flex flex-row justify-between px-6 py-[14px] border border-[#D0D5DD] rounded-lg">
          <div className="absolute left-0 -top-9 flex flex-row gap-x-[6px] items-center">
            <div className="z-10 flex overflow-hidden rounded-full">
              <Image
                src={selectedFarm?.asset.logos[1] as string}
                alt={selectedFarm?.asset.logos[1] as string}
                width={24}
                height={24}
              />
            </div>
            <span className="text-[#344054 text-[14px] font-medium leading-5">
              {farmAsset1?.symbol}
            </span>
          </div>
          <input
            placeholder="0"
            className={clsx(
              "text-base text-[#4E4C4C] font-bold leading-6 text-left bg-transparent focus:outline-none"
            )}
            onChange={handleChangeSecondTokenAmount}
            value={secondTokenAmount}
            name="secondTokenAmount"
            id="secondTokenAmount"
            ref={secondInputRef}
            // onBlur={() => setFocusedInput(InputType.Off)}
            onFocus={() => setFocusedInput(InputType.Second)}
            autoFocus={focusedInput === InputType.Second}
          />
          <div className="inline-flex items-center gap-x-2">
            <p className="flex flex-col items-end text-sm leading-5 opacity-50">
              {false ? ( // Loading variable
                <span>loading...</span>
              ) : (
                // !!token1Balance && (
                true && (
                  <div className="flex flex-col items-end">
                    <span>Balance</span>
                    <span>
                      {parseFloat("10.02").toLocaleString("en-US")}{" "}
                      {farmAsset1?.symbol}
                    </span>
                  </div>
                )
              )}
            </p>
            <button
              className="p-2 bg-[#F1F1F1] rounded-lg text-[#8B8B8B] text-[14px] font-bold leading-5"
              onClick={handleMaxSecondToken}
            >
              MAX
            </button>
          </div>
        </div>
        {/* {fixedAmtNum(secondTokenAmount) >
          fixedAmtNum(token1Balance?.formatted) && (
          <div className="text-[#FF9999] leading-6 font-semibold text-base text-left">
            You need{" "}
            {fixedAmtNum(secondTokenAmount) -
              fixedAmtNum(token1Balance?.formatted)}{" "}
            {farmAsset1?.symbol} for creating an LP token with{" "}
            {fixedAmtNum(firstTokenAmount)}
            {farmAsset0?.symbol}
          </div>
        )} */}

        {/* Relative Conversion and Share of Pool */}
        <div className="p-3 flex flex-row justify-between text-[#667085] text-[14px] leading-5 font-bold text-opacity-50">
          <div className="flex flex-col items-start gap-y-2">
            <p>
              {12} {farmAsset0?.symbol} per {farmAsset1?.symbol}
            </p>
            <p>
              {24} {farmAsset1?.symbol} per {farmAsset0?.symbol}
            </p>
            {/* <p>
              {getFirstTokenRelation()} {farmAsset0?.symbol} per{" "}
              {farmAsset1?.symbol}
            </p>
            <p>
              {getSecondTokenRelation()} {farmAsset1?.symbol} per{" "}
              {farmAsset0?.symbol}
            </p> */}
          </div>
          <p className="flex flex-col items-end">
            <span>
              0.02
              {/* {(totalSupply !== 0 && minLpTokens > 0
                ? (minLpTokens / totalSupply) * 100 < 0.001
                  ? "<0.001"
                  : (minLpTokens / totalSupply) * 100
                : 0
              ).toLocaleString("en-US")} */}
              %
            </span>
            <span>Share of pool</span>
          </p>
        </div>

        {/* Gas Fees // Slippage // Suff. Wallet balance */}
        <div
          className={clsx(
            "rounded-xl",
            // fixedAmtNum(nativeBal?.formatted) > gasEstimate
            "bg-[#C0F9C9]"
            // : "bg-[#FFB7B7]"
          )}
        >
          <div
            className={clsx(
              "flex flex-col gap-y-3 rounded-xl px-6 py-3 bg-[#ECFFEF]",
              // fixedAmtNum(nativeBal?.formatted) > gasEstimate
              "bg-[#ECFFEF]"
              // : "bg-[#FFE8E8]"
            )}
          >
            <div className="inline-flex justify-between text-[#4E4C4C] font-bold leading-5 text-base">
              <span>Estimated Gas Fees:</span>
              <p className="inline-flex">
                <span className="opacity-40 mr-2 font-semibold">
                  {/* {gasEstimate.toFixed(3) ?? 0} {nativeBal?.symbol} */}
                  {(24.043243).toFixed(3) ?? 0} {"KSM"}
                </span>
                <span>${(24.54245).toFixed(5)}</span>
                {/* <span>${(gasEstimate * nativePrice).toFixed(5)}</span> */}
              </p>
            </div>
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
              {/* {fixedAmtNum(nativeBal?.formatted) > gasEstimate */}
              Sufficient
              {/* : "Insufficient"}{" "} */}
              Wallet Balance
            </h3>
            {/* <span className="text-[#344054] opacity-50 text-sm font-medium leading-5">
              {parseFloat(nativeBal?.formatted!).toLocaleString("en-US")}{" "}
              {nativeBal?.symbol}
            </span> */}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-row gap-x-3 mt-9">
          <div className="flex flex-row w-full gap-x-3">
            <MButton
              type="primary"
              isLoading={false}
              disabled={
                firstTokenAmount == "" ||
                secondTokenAmount == "" ||
                parseFloat(firstTokenAmount) <= 0 ||
                parseFloat(secondTokenAmount) <= 0
                // fixedAmtNum(nativeBal?.formatted) <= gasEstimate ||
                // fixedAmtNum(firstTokenAmount) >
                //   fixedAmtNum(token0Balance?.formatted) ||
                // fixedAmtNum(secondTokenAmount) >
                //   fixedAmtNum(token1Balance?.formatted)
              }
              text="Confirm Adding Liquidity"
              onClick={() => {
                if (
                  parseFloat(firstTokenAmount) <= 0 &&
                  parseFloat(secondTokenAmount) <= 0
                ) {
                  console.log("Both token amount can't be zero");
                } else {
                  setIsConfirmStep(true);
                }
              }}
            />
          </div>
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
          You will receive
        </h3>
        <div className="flex flex-col p-6 rounded-lg border border-[#BEBEBE] gap-y-2 text-[#344054] font-bold text-lg leading-6">
          <div className="inline-flex items-center gap-x-2">
            <span>{3}</span>
            {/* <span>{minLpTokens}</span> */}
            <div className="z-10 flex overflow-hidden rounded-full">
              <Image
                src={selectedFarm?.asset.logos[0] as string}
                alt={selectedFarm?.asset.logos[0] as string}
                width={24}
                height={24}
              />
            </div>
            <div className="z-10 flex overflow-hidden rounded-full">
              <Image
                src={selectedFarm?.asset.logos[1] as string}
                alt={selectedFarm?.asset.logos[1] as string}
                width={24}
                height={24}
              />
            </div>
          </div>
          <p>
            {farmAsset0?.symbol}/{farmAsset1?.symbol} Pool Tokens
          </p>
        </div>
        <div className="inline-flex justify-between text-sm font-bold">
          <span className="text-[#0B0B0B]">Rates</span>
          <p className="flex flex-col gap-y-2 text-[#282929]">
            <span>
              1 {farmAsset0?.symbol} = {24} {farmAsset1?.symbol}
            </span>
            <span>
              1 {farmAsset1?.symbol} = {30} {farmAsset0?.symbol}
            </span>
            {/* <span>
              1 {farmAsset0?.symbol} = {getSecondTokenRelation()}{" "}
              {farmAsset1?.symbol}
            </span>
            <span>
              1 {farmAsset1?.symbol} = {getFirstTokenRelation()}{" "}
              {farmAsset0?.symbol}
            </span> */}
          </p>
        </div>
        <hr className="border-t border-[#E3E3E3] min-w-full" />
        {/* Relative Conversion and Share of Pool */}
        <div className="p-3 flex flex-row justify-between text-[#667085] text-[14px] leading-5 font-bold text-opacity-50">
          <div className="flex flex-col gap-y-2">
            <p>
              {24} {farmAsset0?.symbol} per {farmAsset1?.symbol}
            </p>
            <p>
              {25} {farmAsset1?.symbol} per {farmAsset0?.symbol}
            </p>
          </div>
          <p className="flex flex-col items-end">
            <span>
              {/* {(totalSupply !== 0 && minLpTokens > 0
                ? (minLpTokens / totalSupply) * 100 < 0.001
                  ? "<0.001"
                  : (minLpTokens / totalSupply) * 100
                : 0
              ).toLocaleString("en-US")} */}
              4%
            </span>
            <span>Share of pool</span>
          </p>
        </div>
        <MButton
          type="primary"
          isLoading={false}
          text="Confirm Supply"
          onClick={() => {
            handleAddLiquidity();
            setIsProcessStep(true);
          }}
        />
      </div>
    );
  };

  const ProcessStep = () => {
    return (
      <div className="flex flex-col items-center gap-y-8 text-left font-semibold leading-5">
        {true ? (
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
            <div className="text-base font-semibold leading-5">
              <button
                className="text-[#A3A3A3]"
                onClick={() => setIsOpen(false)}
              >
                Go Back
              </button>
            </div>
          </>
        ) : // ) : !isErrorAddLiqTxn && !isErrorAddLiqCall ? (
        false ? (
          <>
            <h3 className="text-base">Waiting For Confirmation</h3>
            <h2 className="text-xl">
              Supplying {firstTokenAmount} {farmAsset0?.symbol} and{" "}
              {secondTokenAmount} {farmAsset1?.symbol}
            </h2>
            <hr className="border-t border-[#E3E3E3] min-w-full" />
            <p className="text-base text-[#373738]">
              Confirmation Transaction in your Wallet
              {/* {isLoadingAddLiqTxn
                ? "Waiting for Completion"
                : isLoadingAddLiqCall
                ? "Confirmation Transaction in your Wallet"
                : ""} */}
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
    // approveToken0Loading ||
    // approveToken1Loading ||
    // approveToken0TxnLoading ||
    // approveToken1TxnLoading ||
    // isLoadingAddLiqCall ||
    // isLoadingAddLiqTxn ||
    isSlippageModalOpen;

  return (
    !!selectedFarm && (
      <LiquidityModalWrapper
        open={isOpen || isOpenModalCondition}
        setOpen={isOpenModalCondition ? () => {} : setIsOpen}
        title="Add Liquidity"
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

export default AddSectionMangata;

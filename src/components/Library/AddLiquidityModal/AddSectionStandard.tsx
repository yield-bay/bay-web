// Library Imports
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import Image from "next/image";
import { parseAbi, parseUnits } from "viem";
import {
  useAccount,
  useBalance,
  useNetwork,
  useContractWrite,
  useWaitForTransaction,
  usePublicClient,
} from "wagmi";

// Component, Util and Hook Imports
import MButton from "@components/Library/MButton";
import Spinner from "@components/Library/Spinner";
import { addLiqModalOpenAtom, slippageModalOpenAtom } from "@store/commonAtoms";
import { selectedFarmAtom, slippageAtom } from "@store/atoms";
import { formatTokenSymbols } from "@utils/farmListMethods";
import {
  getAddLiqFunctionName,
  getRouterAbi,
} from "@utils/abis/contract-helper-methods";
import { UnderlyingAssets } from "@utils/types";
import useTokenReserves from "@hooks/useTokenReserves";
import useLPBalance from "@hooks/useLPBalance";
import { useIsApprovedToken, useApproveToken } from "@hooks/useApprovalHooks";
import useMinimumLPTokens from "@hooks/useMinLPTokens";
import LiquidityModalWrapper from "../LiquidityModalWrapper";
import { CogIcon } from "@heroicons/react/solid";
import Link from "next/link";

const AddSectionStandard: FC<PropsWithChildren> = () => {
  const [isOpen, setIsOpen] = useAtom(addLiqModalOpenAtom);
  const [selectedFarm] = useAtom(selectedFarmAtom);
  const [isSlippageModalOpen, setIsSlippageModalOpen] = useAtom(
    slippageModalOpenAtom
  );
  const [SLIPPAGE] = useAtom(slippageAtom);

  const { address } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();

  const tokenNames = formatTokenSymbols(selectedFarm?.asset.symbol ?? "");
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

  const { reserve0, reserve1 } = useTokenReserves(
    selectedFarm?.asset.address!,
    selectedFarm?.protocol!
  );

  const minLpTokens = useMinimumLPTokens(
    selectedFarm?.asset.address!,
    SLIPPAGE,
    reserve0,
    reserve1,
    isNaN(parseInt(firstTokenAmount)) ? 0 : parseInt(firstTokenAmount),
    isNaN(parseInt(secondTokenAmount)) ? 0 : parseInt(secondTokenAmount)
  );

  const { lpBalance, lpBalanceLoading } = useLPBalance(
    selectedFarm?.asset.address!
  );

  useEffect(() => {
    // Empty the values when Modal is opened or closed
    setFirstTokenAmount("");
    setSecondTokenAmount("");
  }, [isOpen]);

  const { data: nativeBal, isLoading: isLoadingNativeBal } = useBalance({
    address,
    chainId: chain?.id,
    enabled: !!address,
  });

  const GAS_FEES = 0.0014; // In STELLA

  // Balance Token0
  const { data: token0Balance, isLoading: token0BalanceLoading } = useBalance({
    address,
    chainId: chain?.id,
    token: farmAsset0?.address,
    enabled: !!address && !!selectedFarm,
  });

  // Balance Token1
  const { data: token1Balance, isLoading: token1BalanceLoading } = useBalance({
    address,
    chainId: chain?.id,
    token: farmAsset1?.address,
    enabled: !!address && !!selectedFarm,
  });

  // Check Approval Token0 & Token1
  const { data: isToken0Approved, isLoading: isToken0ApprovedLoading } =
    useIsApprovedToken(farmAsset0?.address, selectedFarm?.router!);

  const { data: isToken1Approved, isLoading: isToken1ApprovedLoading } =
    useIsApprovedToken(farmAsset1?.address, selectedFarm?.router!);

  // To approve token0 and token1
  const {
    isLoadingApproveCall: approveToken0Loading,
    isLoadingApproveTxn: approveToken0TxnLoading,
    isSuccessApproveCall: approveToken0Success,
    isSuccessApproveTxn: approveToken0TxnSuccess,
    writeAsync: approveToken0,
  } = useApproveToken(farmAsset0?.address, selectedFarm?.router!);
  const {
    isLoadingApproveCall: approveToken1Loading,
    isLoadingApproveTxn: approveToken1TxnLoading,
    isSuccessApproveCall: approveToken1Success,
    isSuccessApproveTxn: approveToken1TxnSuccess,
    writeAsync: approveToken1,
  } = useApproveToken(farmAsset1?.address, selectedFarm?.router!);

  const {
    data: addLiquidityData,
    isLoading: isLoadingAddLiqCall,
    isSuccess: isSuccessAddLiqCall,
    writeAsync: addLiquidity,
    isError: isErrorAddLiqCall,
  } = useContractWrite({
    address: selectedFarm?.router,
    abi: parseAbi(
      getRouterAbi(
        selectedFarm?.protocol!,
        selectedFarm?.farmType == "StandardAmm" ? false : true
      )
    ),
    functionName: getAddLiqFunctionName(
      selectedFarm?.protocol as string
    ) as any,
    chainId: chain?.id,
  });

  // Wait AddLiquidity Txn
  const {
    data: addLiquidityTxnData,
    isLoading: isLoadingAddLiqTxn,
    isError: isErrorAddLiqTxn,
    isSuccess: isSuccessAddLiqTxn,
  } = useWaitForTransaction({
    hash: addLiquidityData?.hash,
  });

  const handleAddLiquidity = async () => {
    try {
      // Fetch latest block's timestamp
      const block = await publicClient.getBlock();
      const blocktimestamp = Number(block.timestamp.toString() + "000") + 60000; // Adding 60 seconds
      console.log("timestamp fetched //", blocktimestamp);

      console.log("calling addliquidity method...");
      const txnRes = await addLiquidity?.({
        args: [
          farmAsset0?.address, // TokenA Address
          farmAsset1?.address, // TokenB Address
          parseUnits(`${parseFloat(firstTokenAmount)}`, farmAsset0?.decimals),
          parseUnits(`${parseFloat(secondTokenAmount)}`, farmAsset1?.decimals),
          1, // amountAMin
          1, // amountBMin
          address, // To
          blocktimestamp, // deadline (uint256)
        ],
      });
      console.log("called addliquidity method.", txnRes);
    } catch (error) {
      console.error("Error in Adding liquidity", error);
    }
  };

  // Updated tokenAmounts based on value of other token
  const updateSecondTokenAmount = (firstTokenAmount: number): string => {
    const poolRatio = reserve0 / reserve1;
    const expectedSecondTokenAmount =
      (firstTokenAmount / poolRatio) * (1 + SLIPPAGE);
    const secondTokenAmount = isNaN(expectedSecondTokenAmount)
      ? "0"
      : expectedSecondTokenAmount.toFixed(5);
    setSecondTokenAmount(secondTokenAmount);
    return secondTokenAmount;
  };

  const updateFirstTokenAmount = (secondTokenAmount: number): string => {
    const poolRatio = reserve0 / reserve1;
    const expectedFirstTokenAmount =
      (poolRatio * secondTokenAmount) / (1 + SLIPPAGE);
    const firstTokenAmount = isNaN(expectedFirstTokenAmount)
      ? "0"
      : expectedFirstTokenAmount.toFixed(5);
    setFirstTokenAmount(firstTokenAmount);
    return firstTokenAmount;
  };

  // Method to update token values and fetch fees based on firstToken Input
  const handleChangeFirstTokenAmount = async (e: any) => {
    setFirstTokenAmount(e.target.value);
    // Updating Second Token amount
    const firstTokenFloat = parseFloat(e.target.value);
    updateSecondTokenAmount(firstTokenFloat);
  };

  // Method to update token values and fetch fees based on secondToken Input
  const handleChangeSecondTokenAmount = async (e: any) => {
    setSecondTokenAmount(e.target.value);
    // Calculate first token amount
    const secondTokenFloat = parseFloat(e.target.value);
    updateFirstTokenAmount(secondTokenFloat);
  };

  useEffect(() => {
    if (!isToken0ApprovedLoading || !isToken1ApprovedLoading) {
      console.log("isToken0Approved", !!Number(isToken0Approved));
      console.log("isToken1Approved", !!Number(isToken1Approved));
    }
  }, [isToken1Approved, isToken0Approved]);

  // Remove after testing
  useEffect(() => {
    if (isLoadingAddLiqCall) {
      console.log("addliq method loading... sign the txn");
    } else if (isLoadingAddLiqTxn) {
      console.log("addliq txn loading...");
      console.log("call hash", addLiquidityData?.hash);
    }
  }, [isLoadingAddLiqCall, isLoadingAddLiqTxn]);

  useEffect(() => {
    if (isSuccessAddLiqTxn) {
      console.log("addliq txn success!");
      console.log("txn data", addLiquidityTxnData);
    }
  }, [isSuccessAddLiqTxn]);

  useEffect(() => {
    if (!isToken0ApprovedLoading || !isToken1ApprovedLoading) {
      console.log("isSuccess Approve0", approveToken0TxnSuccess);
      console.log("isSuccess Approve1", approveToken1TxnSuccess);
    }
  }, [approveToken0TxnSuccess, approveToken1TxnSuccess]);

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
            min={0}
            onChange={handleChangeFirstTokenAmount}
            value={firstTokenAmount}
            autoFocus
          />
          <div className="inline-flex items-center gap-x-2">
            <p className="flex flex-col items-end text-sm leading-5 opacity-50">
              {token0BalanceLoading ? (
                <span>loading...</span>
              ) : (
                !!token0Balance && (
                  <div className="flex flex-col items-end">
                    <span>Balance</span>
                    <span>
                      {parseFloat(token0Balance?.formatted).toLocaleString(
                        "en-US"
                      )}{" "}
                      {token0Balance?.symbol}
                    </span>
                  </div>
                )
              )}
            </p>
            <button
              className="p-2 bg-[#F1F1F1] rounded-lg text-[#8B8B8B] text-[14px] font-bold leading-5"
              onClick={() => {
                setFirstTokenAmount(token0Balance?.formatted ?? "0");
                updateSecondTokenAmount(
                  parseFloat(token0Balance?.formatted ?? "0")
                );
              }}
            >
              MAX
            </button>
          </div>
        </div>
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
            min={0}
            onChange={handleChangeSecondTokenAmount}
            value={secondTokenAmount}
          />
          <div className="inline-flex items-center gap-x-2">
            <p className="flex flex-col items-end text-sm leading-5 opacity-50">
              {token1BalanceLoading ? (
                <span>loading...</span>
              ) : (
                !!token1Balance && (
                  <div className="flex flex-col items-end">
                    <span>Balance</span>
                    <span>
                      {parseFloat(token1Balance?.formatted).toLocaleString(
                        "en-US"
                      )}{" "}
                      {token1Balance?.symbol}
                    </span>
                  </div>
                )
              )}
            </p>
            <button
              className="p-2 bg-[#F1F1F1] rounded-lg text-[#8B8B8B] text-[14px] font-bold leading-5"
              onClick={() => {
                setSecondTokenAmount(token1Balance?.formatted ?? "0");
                updateFirstTokenAmount(
                  parseFloat(token1Balance?.formatted ?? "0")
                );
              }}
            >
              MAX
            </button>
          </div>
        </div>

        {/* Relative Conversion and Share of Pool */}
        <div className="p-3 flex flex-row justify-between text-[#667085] text-[14px] leading-5 font-bold text-opacity-50">
          <div className="flex flex-col gap-y-2">
            <p>0.1234 GLMR per STELLA</p>
            <p>0.1234 STELLA per GLMR</p>
          </div>
          <p className="flex flex-col items-end">
            <span>{"<0.001%"}</span>
            <span>Share of pool</span>
          </p>
        </div>

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
            <div className="inline-flex justify-between text-[#4E4C4C] font-bold leading-5 text-base">
              <span>Estimated Gas Fees:</span>
              <p>
                <span className="opacity-40 mr-2 font-semibold">
                  {GAS_FEES} STELLA
                </span>
                <span>$1234</span>
              </p>
            </div>
            <div className="inline-flex items-center font-medium text-[14px] leading-5 text-[#344054]">
              <span>Slippage Tolerance: {SLIPPAGE}%</span>
              <button onClick={() => setIsSlippageModalOpen(true)}>
                <CogIcon className="w-4 h-4 text-[#344054] ml-2" />
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

        {/* Buttons */}
        <div className="flex flex-row gap-x-3 mt-9">
          {isToken0ApprovedLoading || isToken1ApprovedLoading ? (
            <MButton
              type="primary"
              isLoading={false}
              disabled={true}
              text="Checking if tokens are approved..."
            />
          ) : (
            <div className="flex flex-row w-full gap-x-3">
              {!isToken0Approved && !approveToken0TxnSuccess && (
                <MButton
                  type="secondary"
                  isLoading={approveToken0Loading || approveToken0TxnLoading}
                  text={
                    approveToken0Loading
                      ? "Sign the Txn in Wallet"
                      : approveToken0TxnLoading
                      ? "Waiting for Approval"
                      : `Approve ${farmAsset0.symbol}`
                  }
                  disabled={
                    approveToken0TxnSuccess ||
                    approveToken0Loading ||
                    approveToken0TxnLoading ||
                    typeof approveToken0 == "undefined" ||
                    parseFloat(nativeBal?.formatted ?? "0") <= GAS_FEES
                  }
                  onClick={async () => {
                    try {
                      const txn = await approveToken0?.();
                      console.log("Approve0 Result", txn);
                    } catch (error) {
                      console.log("Error while Approving toke0", error);
                    }
                  }}
                />
              )}
              {!isToken1Approved &&
                !approveToken1TxnSuccess &&
                (isToken0Approved || approveToken0TxnSuccess) && (
                  <MButton
                    type="secondary"
                    isLoading={approveToken1Loading || approveToken1TxnLoading}
                    text={
                      approveToken1Loading
                        ? "Sign the Txn in Wallet"
                        : approveToken1TxnLoading
                        ? "Waiting for Approval"
                        : `Approve ${farmAsset1.symbol}`
                    }
                    disabled={
                      approveToken1TxnSuccess ||
                      approveToken1Loading ||
                      approveToken1TxnLoading ||
                      typeof approveToken1 == "undefined" ||
                      parseFloat(nativeBal?.formatted ?? "0") <= GAS_FEES
                    }
                    onClick={async () => {
                      const txn = await approveToken1?.();
                      console.log("Approve1 Result", txn);
                    }}
                  />
                )}
              <MButton
                type="primary"
                isLoading={false}
                disabled={
                  firstTokenAmount == "" ||
                  secondTokenAmount == "" ||
                  (parseFloat(firstTokenAmount) <= 0 &&
                    parseFloat(secondTokenAmount) <= 0) ||
                  parseFloat(nativeBal?.formatted ?? "0") <= GAS_FEES
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
          )}
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
            <span>{minLpTokens}</span>
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
            <span>1 STELLA = 0.1235 GLMR</span>
            <span>1 GLMR = 7.0389 STELLA</span>
          </p>
        </div>
        <hr className="border-t border-[#E3E3E3] min-w-full" />
        {/* Relative Conversion and Share of Pool */}
        <div className="p-3 flex flex-row justify-between text-[#667085] text-[14px] leading-5 font-bold text-opacity-50">
          <div className="flex flex-col gap-y-2">
            <p>0.1234 GLMR per STELLA</p>
            <p>0.1234 STELLA per GLMR</p>
          </div>
          <p className="flex flex-col items-end">
            <span>{"<0.001%"}</span>
            <span>Share of pool</span>
          </p>
        </div>
        <MButton
          type="primary"
          isLoading={false}
          text="Confirm Supply"
          onClick={() => {
            console.log("args:", {
              aAddress: farmAsset0?.address,
              bAddress: farmAsset1?.address,
              aAmount: parseUnits(
                `${parseFloat(firstTokenAmount)}`,
                farmAsset0?.decimals
              ),
              bAmount: parseUnits(
                `${parseFloat(secondTokenAmount)}`,
                farmAsset0?.decimals
              ),
              aAmountMin: 1, // amountAMin
              bAmountMin: 1, // amountBMin
              to: address, // To
              timestamp: "calculated in call", // deadline (uint256)
            });
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
        {isSuccessAddLiqTxn ? (
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
                // href={`https://moonscan.io/tx/${addLiquidityTxnData?.hash}}`}
                href={"#"}
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
        ) : !isErrorAddLiqTxn && !isErrorAddLiqCall ? (
          <>
            <h3 className="text-base">Waiting For Confirmation</h3>
            <h2 className="text-xl">
              Supplying {firstTokenAmount} {farmAsset0?.symbol} and{" "}
              {secondTokenAmount} {farmAsset1?.symbol}
            </h2>
            <hr className="border-t border-[#E3E3E3] min-w-full" />
            <p className="text-base text-[#373738]">
              {isLoadingAddLiqTxn
                ? "Waiting for Completion"
                : isLoadingAddLiqCall
                ? "Confirmation Transaction in your Wallet"
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
    approveToken0Loading ||
    approveToken1Loading ||
    approveToken0TxnLoading ||
    approveToken1TxnLoading ||
    isLoadingAddLiqCall ||
    isLoadingAddLiqTxn ||
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

export default AddSectionStandard;

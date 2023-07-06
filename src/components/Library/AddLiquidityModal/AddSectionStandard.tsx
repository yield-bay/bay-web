// Library Imports
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import Image from "next/image";
import { parseUnits } from "viem";
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
import { addLiqModalOpenAtom } from "@store/commonAtoms";
import { selectedFarmAtom } from "@store/atoms";
import { formatTokenSymbols, getLpTokenSymbol } from "@utils/farmListMethods";
import {
  getAbi,
  getAddLiqFunctionName,
} from "@utils/abis/contract-helper-methods";
import { UnderlyingAssets } from "@utils/types";
import useTokenReserves from "@hooks/useTokenReserves";
import useLPBalance from "@hooks/useLPBalance";
import { useIsApprovedToken, useApproveToken } from "@hooks/useApprovalHooks";
import useMinimumLPTokens from "@hooks/useMinLPTokens";
import LiquidityModalWrapper from "../LiquidityModalWrapper";
import toUnits from "@utils/toUnits";
import { CogIcon } from "@heroicons/react/solid";

const SLIPPAGE = 0.5; // In percentage

const AddSectionStandard: FC<PropsWithChildren> = () => {
  const [isOpen, setIsOpen] = useAtom(addLiqModalOpenAtom);
  const [selectedFarm] = useAtom(selectedFarmAtom);
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
    useIsApprovedToken(farmAsset0, selectedFarm?.router!);

  const { data: isToken1Approved, isLoading: isToken1ApprovedLoading } =
    useIsApprovedToken(farmAsset1, selectedFarm?.router!);

  // To approve token0 and token1
  const {
    isLoadingApproveCall: approveToken0Loading,
    isLoadingApproveTxn: approveToken0TxnLoading,
    isSuccessApproveCall: approveToken0Success,
    isSuccessApproveTxn: approveToken0TxnSuccess,
    writeAsync: approveToken0,
  } = useApproveToken(farmAsset0, selectedFarm?.router!);
  const {
    isLoadingApproveCall: approveToken1Loading,
    isLoadingApproveTxn: approveToken1TxnLoading,
    isSuccessApproveCall: approveToken1Success,
    isSuccessApproveTxn: approveToken1TxnSuccess,
    writeAsync: approveToken1,
  } = useApproveToken(farmAsset1, selectedFarm?.router!);

  const {
    data: addLiquidityData,
    isLoading: isLoadingAddLiqCall,
    isSuccess: isSuccessAddLiqCall,
    writeAsync: addLiquidity,
    // } = usePrepareContractWrite({
  } = useContractWrite({
    address: selectedFarm?.router,
    abi: getAbi(
      selectedFarm?.protocol as string,
      selectedFarm?.chain as string,
      getLpTokenSymbol(tokenNames)
    ),
    functionName: getAddLiqFunctionName(selectedFarm?.protocol as string),
    chainId: chain?.id,
  });

  // Wait AddLiquidity Txn
  const { isLoading: isLoadingAddLiqTxn, isSuccess: isSuccessAddLiqTxn } =
    useWaitForTransaction({
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
          parseUnits(`${parseFloat(secondTokenAmount)}`, farmAsset0?.decimals),
          1, // amountAMin
          1, // amountBMin
          address, // To
          blocktimestamp, // deadline (uint256)
        ],
      });
      console.log("called addliquidity method.", txnRes);
    } catch (error) {
      console.error(error);
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
    }
  }, [isLoadingAddLiqCall, isLoadingAddLiqTxn]);

  useEffect(() => {
    if (!isToken0ApprovedLoading || !isToken1ApprovedLoading) {
      console.log("isSuccess Approve0", approveToken0TxnSuccess);
      console.log("isSuccess Approve1", approveToken1TxnSuccess);
    }
  }, [approveToken0TxnSuccess, approveToken1TxnSuccess]);

  const InputStep = !!selectedFarm && (
    <LiquidityModalWrapper
      open={isOpen}
      setOpen={setIsOpen}
      title="Add Liquidity"
    >
      <div className="w-full flex flex-col gap-y-3">
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
              {token1BalanceLoading ? (
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
            <button className="p-2 bg-[#F1F1F1] rounded-lg text-[#8B8B8B] text-[14px] font-bold leading-5">
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
            autoFocus
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
            <button className="p-2 bg-[#F1F1F1] rounded-lg text-[#8B8B8B] text-[14px] font-bold leading-5">
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
        <div className="bg-[#C0F9C9] rounded-xl">
          <div className="flex flex-col gap-y-3 rounded-xl px-6 py-3 bg-[#ECFFEF]">
            <div className="inline-flex justify-between text-[#4E4C4C] font-bold leading-5 text-base">
              <span>Estimated Gas Fees:</span>
              <p>
                <span className="opacity-40 mr-2 font-semibold">
                  0.000045 STELLA
                </span>
                <span>$1234</span>
              </p>
            </div>
            <div className="inline-flex items-center font-medium text-[14px] leading-5 text-[#344054]">
              <span>Slippage Tolerance: {SLIPPAGE}%</span>
              <button onClick={() => {}}>
                <CogIcon className="w-4 h-4 text-[#344054] ml-2" />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-y-2 items-center rounded-b-xl pt-[14px] pb-2 text-center">
            <h3 className="text-[#4E4C4C] text-base font-bold">
              Sufficient Wallet Balance
            </h3>
            <span className="text-[#344054] opacity-50 text-sm font-medium leading-5">
              89.567576 STELLA
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-row gap-x-3 mt-9">
          {isToken0ApprovedLoading || isToken0ApprovedLoading ? (
            <MButton
              type="primary"
              isLoading={false}
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
                    approveToken0TxnLoading ||
                    typeof approveToken0 == "undefined"
                  }
                  onClick={async () => {
                    const txn = await approveToken0?.();
                    console.log("Approve0 Result", txn);
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
                      approveToken1TxnLoading ||
                      typeof approveToken1 == "undefined"
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
                  typeof addLiquidity == "undefined" ||
                  isLoadingAddLiqCall ||
                  isSuccessAddLiqTxn
                }
                text={"Confirm Adding Liquidity"}
                onClick={() => {
                  if (
                    parseFloat(firstTokenAmount) <= 0 &&
                    parseFloat(secondTokenAmount) <= 0
                  ) {
                    console.log("Both token amount can't be zero");
                  } else {
                    console.log("router.addLiquidity @params", {
                      address_token0: farmAsset0?.address,
                      address_token1: farmAsset1?.address,
                      token0Amount: parseFloat(firstTokenAmount),
                      token1Amount: parseFloat(secondTokenAmount),
                      minToken0Amount:
                        (parseFloat(firstTokenAmount) * (100 - SLIPPAGE)) / 100,
                      minToken1Amount:
                        (parseFloat(secondTokenAmount) * (100 - SLIPPAGE)) /
                        100,
                      msg_sender: address,
                      block_timestamp: "Calc at runtime",
                    });
                    // Handler of Add Liquidity
                    // handleAddLiquidity();
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </LiquidityModalWrapper>
  );

  const ConfirmStep = <></>;

  const ProcessStep = <></>;

  return isProcessStep ? ProcessStep : isConfirmStep ? ConfirmStep : InputStep;
};

export default AddSectionStandard;

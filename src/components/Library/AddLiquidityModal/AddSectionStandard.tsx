// Library Imports
import {
  FC,
  useRef,
  PropsWithChildren,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import Image from "next/image";
import { parseAbi } from "viem";
import {
  useAccount,
  useBalance,
  useNetwork,
  useContractWrite,
  useWaitForTransaction,
  usePublicClient,
} from "wagmi";
import { ethers } from "ethers";
import Link from "next/link";
import { CogIcon } from "@heroicons/react/solid";

// Component, Util and Hook Imports
import MButton from "@components/Library/MButton";
import Spinner from "@components/Library/Spinner";
import { addLiqModalOpenAtom, slippageModalOpenAtom } from "@store/commonAtoms";
import {
  selectedFarmAtom,
  slippageAtom,
  tokenPricesAtom,
  positionsAtom,
  lpTokenPricesAtom,
} from "@store/atoms";
import {
  fixedAmtNum,
  getAddLiqFunctionName,
  getRouterAbi,
} from "@utils/abis/contract-helper-methods";
import { UnderlyingAssets } from "@utils/types/common";
import toUnits from "@utils/toUnits";
import useTokenReserves from "@hooks/useTokenReserves";
import { useIsApprovedToken, useApproveToken } from "@hooks/useApprovalHooks";
import useMinimumLPTokens from "@hooks/useMinLPTokens";
import LiquidityModalWrapper from "../LiquidityModalWrapper";
import useGasEstimation from "@hooks/useGasEstimation";
import { getNativeTokenAddress } from "@utils/network";
import WrongNetworkModal from "../WrongNetworkModal";
import { handleAddLiquidityEvent } from "@utils/tracking";
import getTimestamp from "@utils/getTimestamp";
import { updateEvmPositions } from "@utils/position-utils/evmPositions";
import BigNumber from "bignumber.js";
import Countdown from "../Countdown";
import { createNumRegex } from "@utils/createRegex";
import SlippageBox from "../SlippageBox";
import TokenContainer from "./TokenContainer";

enum InputType {
  Off = -1,
  First = 0,
  Second = 1,
}

const getPoolRatio = (r0: string, r1: string, d0: number, d1: number) => {
  const amount0 = parseFloat(ethers.formatUnits(r0, d0));
  const amount1 = parseFloat(ethers.formatUnits(r1, d1));
  const poolRatio = amount0 / amount1;
  return poolRatio;
};

const THIRTY_MINUTES_IN_MS = 60000 * 30;

const AddSectionStandard: FC<PropsWithChildren> = () => {
  const { address, connector } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const [isOpen, setIsOpen] = useAtom(addLiqModalOpenAtom);
  const [selectedFarm] = useAtom(selectedFarmAtom);
  const [isSlippageModalOpen, setIsSlippageModalOpen] = useAtom(
    slippageModalOpenAtom
  );
  const [positions, setPositions] = useAtom(positionsAtom);
  const [lpTokenPricesMap] = useAtom(lpTokenPricesAtom);
  const [tokenPricesMap] = useAtom(tokenPricesAtom);

  const [SLIPPAGE] = useAtom(slippageAtom);
  const [txnHash, setTxnHash] = useState<string>("");

  // Input focus states
  const [focusedInput, setFocusedInput] = useState<InputType>(InputType.First);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const secondInputRef = useRef<HTMLInputElement>(null);

  const [farmAsset0, farmAsset1] =
    selectedFarm?.asset.underlyingAssets ?? new Array<UnderlyingAssets>();

  // Transaction Process Steps
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [isProcessStep, setIsProcessStep] = useState(false);
  const [isSlippageStep, setIsSlippageStep] = useState(false);

  // Amount States
  const [firstTokenAmount, setFirstTokenAmount] = useState("");
  const [secondTokenAmount, setSecondTokenAmount] = useState("");

  const { reserve0, reserve1 } = useTokenReserves(
    selectedFarm?.asset.address!,
    selectedFarm?.protocol!,
    selectedFarm?.router!
  );

  const { minLpTokens, totalSupply } = useMinimumLPTokens(
    selectedFarm?.asset.address!,
    SLIPPAGE,
    reserve0,
    reserve1,
    fixedAmtNum(firstTokenAmount),
    fixedAmtNum(secondTokenAmount),
    farmAsset0.decimals,
    farmAsset1.decimals
  );

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

  const { data: nativeBal, isLoading: isLoadingNativeBal } = useBalance({
    address,
    chainId: chain?.id,
    enabled: !!address,
  });
  const [nativePrice, setNativePrice] = useState<number>(0);

  useEffect(() => {
    if (!selectedFarm) {
      console.warn("Farm is not available!");
      return;
    }
    const { tokenSymbol, tokenAddress } = getNativeTokenAddress(
      selectedFarm.chain
    );
    if (!tokenSymbol || !tokenAddress) {
      console.warn("Native token is not available!");
      return;
    }
    const tokenPriceKey = `${selectedFarm.chain}-${selectedFarm.protocol}-${tokenSymbol}-${tokenAddress}`;
    const tokenPrice = tokenPricesMap[tokenPriceKey];

    if (typeof tokenPrice !== "number") {
      console.warn(`Token price for ${tokenPriceKey} is not a number`);
      return;
    }
    setNativePrice(tokenPrice);
  }, [selectedFarm, tokenPricesMap]);

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
  const {
    // data: isToken0Approved,
    isLoading: isToken0ApprovedLoading,
    isSuccess: isToken0ApprovedSuccess,
  } = useIsApprovedToken(
    farmAsset0?.address,
    selectedFarm?.router!,
    token0Balance,
    fixedAmtNum(firstTokenAmount)
  );

  const {
    // data: isToken1Approved,
    isLoading: isToken1ApprovedLoading,
    isSuccess: isToken1ApprovedSuccess,
  } = useIsApprovedToken(
    farmAsset1?.address,
    selectedFarm?.router!,
    token1Balance,
    fixedAmtNum(secondTokenAmount)
  );

  // To approve token0 and token1
  const {
    isLoadingApproveCall: approveToken0CallLoading,
    isLoadingApproveTxn: approveToken0TxnLoading,
    isSuccessApproveTxn: approveToken0TxnSuccess,
    writeAsync: approveToken0,
  } = useApproveToken(
    farmAsset0?.address,
    selectedFarm?.router!,
    farmAsset0?.symbol,
    token0Balance
  );
  const {
    isLoadingApproveCall: approveToken1CallLoading,
    isLoadingApproveTxn: approveToken1TxnLoading,
    isSuccessApproveTxn: approveToken1TxnSuccess,
    writeAsync: approveToken1,
  } = useApproveToken(
    farmAsset1?.address,
    selectedFarm?.router!,
    farmAsset1?.symbol,
    token1Balance
  );

  const {
    data: addLiquidityData,
    isLoading: isLoadingAddLiqCall,
    // isSuccess: isSuccessAddLiqCall,
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
    onError: (error) => {
      console.error(
        `Error: Adding Liquidity in ${selectedFarm?.asset.symbol} Farm:`,
        error
      );
    },
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

  /**
   *
   * @param amount - Amount to be formatted
   * @param decimals - Decimals of the token
   * @param multiplier - Multiplier to be applied to the amount
   * @returns Formatted amount
   */
  const formatTokenAmount = (
    amount: string,
    decimals: number,
    multiplier: number = 1
  ) => {
    return BigNumber(amount, 10)
      .multipliedBy(BigNumber(10).pow(decimals))
      .multipliedBy(multiplier)
      .decimalPlaces(0, 1)
      .toString();
  };

  const handleAddLiquidity = async () => {
    if (!addLiquidity) {
      throw new Error("AddLiquidity is not defined!");
    }

    try {
      // Fetch latest block's timestamp
      const block = await publicClient.getBlock();
      const blocktimestamp =
        Number(block.timestamp.toString() + "000") + THIRTY_MINUTES_IN_MS;

      const addArgs = [
        farmAsset0?.address,
        farmAsset1?.address,
        formatTokenAmount(firstTokenAmount, farmAsset0?.decimals),
        formatTokenAmount(secondTokenAmount, farmAsset1?.decimals),
        formatTokenAmount(
          firstTokenAmount,
          farmAsset0?.decimals,
          (100 - SLIPPAGE) / 100
        ),
        formatTokenAmount(
          secondTokenAmount,
          farmAsset1?.decimals,
          (100 - SLIPPAGE) / 100
        ),
        address, // To
        blocktimestamp, // deadline (uint256)
      ];

      const txnRes = await addLiquidity?.({
        args: addArgs,
      });

      if (!!txnRes) {
        setTxnHash(txnRes.hash);
        console.info("Add Liquidity Txn Hash", txnRes.hash);
      }
    } catch (error) {
      console.error(
        `Error while adding liquidity -> ${selectedFarm?.asset.symbol} Farm\n`,
        error
      );
      // throw error;
    }
  };

  const getFirstTokenRelation = useMemo((): string => {
    const poolRatio = getPoolRatio(
      reserve0,
      reserve1,
      farmAsset0.decimals,
      farmAsset1.decimals
    );
    const expectedFirstTokenAmount = poolRatio;
    const firstTokenAmount = isNaN(expectedFirstTokenAmount)
      ? 0
      : expectedFirstTokenAmount;
    return firstTokenAmount < 0.001
      ? "<0.001"
      : firstTokenAmount.toLocaleString("en-US");
  }, [selectedFarm]);

  const getSecondTokenRelation = useMemo((): string => {
    const poolRatio = getPoolRatio(
      reserve0,
      reserve1,
      farmAsset0.decimals,
      farmAsset1.decimals
    );
    const expectedSecondTokenAmount = 1 / poolRatio;
    const secondTokenAmount = isNaN(expectedSecondTokenAmount)
      ? 0
      : expectedSecondTokenAmount;
    return secondTokenAmount < 0.001
      ? "<0.001"
      : secondTokenAmount.toLocaleString("en-US");
  }, [selectedFarm]);

  // Updated tokenAmounts based on value of other token
  const updateSecondTokenAmount = (firstTokenAmount: number) => {
    const poolRatio = getPoolRatio(
      reserve0,
      reserve1,
      farmAsset0.decimals,
      farmAsset1.decimals
    );
    const expectedSecondTokenAmount = firstTokenAmount / poolRatio;
    const secondTokenAmount = isNaN(expectedSecondTokenAmount)
      ? "0"
      : expectedSecondTokenAmount.toString();
    setSecondTokenAmount(secondTokenAmount);
  };

  const updateFirstTokenAmount = (secondTokenAmount: number) => {
    const poolRatio = getPoolRatio(
      reserve0,
      reserve1,
      farmAsset0.decimals,
      farmAsset1.decimals
    );
    const expectedFirstTokenAmount = poolRatio * secondTokenAmount;
    const firstTokenAmount = isNaN(expectedFirstTokenAmount)
      ? "0"
      : expectedFirstTokenAmount.toString();
    setFirstTokenAmount(firstTokenAmount);
  };

  // Handler function for handling inputs
  const handleChangeTokenAmount = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setTokenAmount: React.Dispatch<React.SetStateAction<string>>,
    updateTokenAmount: (value: number) => void,
    decimals: number
  ) => {
    const value = e.target.value;
    // regex only let numerical values upto token decimals
    const regex = createNumRegex(decimals);
    if (regex.test(value) || value === "") {
      setTokenAmount(value);
      // update first amount based on second
      updateTokenAmount(parseFloat(value));
    }
  };

  // update first token values
  const handleChangeFirstTokenAmount = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleChangeTokenAmount(
      e,
      setFirstTokenAmount,
      updateSecondTokenAmount,
      farmAsset0.decimals
    );
  };

  // update second token values
  const handleChangeSecondTokenAmount = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleChangeTokenAmount(
      e,
      setSecondTokenAmount,
      updateFirstTokenAmount,
      farmAsset1.decimals
    );
  };

  useEffect(() => {
    if (isSuccessAddLiqTxn) {
      // Tracking
      handleAddLiquidityEvent({
        userAddress: address!,
        walletType: "EVM",
        walletProvider: connector?.name!,
        timestamp: getTimestamp(),
        farm: {
          id: selectedFarm?.id!,
          chef: selectedFarm?.chef!,
          chain: selectedFarm?.chain!,
          protocol: selectedFarm?.protocol!,
          assetSymbol: selectedFarm?.asset.symbol!,
        },
        underlyingAmounts: [
          {
            amount: fixedAmtNum(firstTokenAmount),
            asset: farmAsset0?.symbol,
            valueUSD:
              tokenPricesMap[
                `${selectedFarm?.chain!}-${selectedFarm?.protocol!}-${
                  farmAsset0?.symbol
                }-${farmAsset0?.address}`
              ],
          },
          {
            amount: fixedAmtNum(secondTokenAmount),
            asset: farmAsset1?.symbol,
            valueUSD:
              tokenPricesMap[
                `${selectedFarm?.chain!}-${selectedFarm?.protocol!}-${
                  farmAsset1?.symbol
                }-${farmAsset1?.address}`
              ],
          },
        ],
        lpAmount: {
          amount: minLpTokens,
          asset: selectedFarm?.asset.symbol!,
          valueUSD:
            lpTokenPricesMap[
              `${selectedFarm?.chain}-${selectedFarm?.protocol}-${selectedFarm?.asset.symbol}-${selectedFarm?.asset.address}`
            ],
        },
      });
      (async () => {
        const a = await updateEvmPositions({
          farm: {
            id: selectedFarm?.id!,
            chef: selectedFarm?.chef!,
            chain: selectedFarm?.chain!,
            protocol: selectedFarm?.protocol!,
            asset: {
              symbol: selectedFarm?.asset.symbol!,
              address: selectedFarm?.asset.address!,
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
  }, [isSuccessAddLiqTxn]);

  const InputStep = () => {
    const disableInput =
      approveToken0CallLoading ||
      approveToken0TxnLoading ||
      approveToken1CallLoading ||
      approveToken1TxnLoading;

    const disableApproveFirstToken =
      approveToken0TxnSuccess ||
      approveToken0CallLoading ||
      approveToken0TxnLoading ||
      typeof approveToken0 == "undefined" ||
      fixedAmtNum(firstTokenAmount) <= 0;

    const disableApproveSecondToken =
      approveToken1TxnSuccess ||
      approveToken1CallLoading ||
      approveToken1TxnLoading ||
      typeof approveToken1 == "undefined" ||
      fixedAmtNum(secondTokenAmount) <= 0;

    const disableConfirmButton =
      fixedAmtNum(firstTokenAmount) <= 0 ||
      fixedAmtNum(secondTokenAmount) <= 0 ||
      !(isToken0ApprovedSuccess || approveToken0TxnSuccess) ||
      !(isToken1ApprovedSuccess || approveToken1TxnSuccess) ||
      fixedAmtNum(firstTokenAmount) > fixedAmtNum(token0Balance?.formatted) ||
      fixedAmtNum(secondTokenAmount) > fixedAmtNum(token1Balance?.formatted);

    return (
      <div className="w-full mt-9 flex flex-col gap-y-3">
        {/* First token Container */}
        <TokenContainer
          handleChangeTokenAmount={handleChangeFirstTokenAmount}
          inputToFocus={InputType.First}
          focusedInput={focusedInput}
          setFocusedInput={setFocusedInput}
          farm={selectedFarm!}
          tokenSymbol={farmAsset0?.symbol}
          tokenAmount={firstTokenAmount}
          inputRef={firstInputRef}
          setTokenAmount={setFirstTokenAmount}
          updateAnotherTokenAmount={updateSecondTokenAmount}
          tokenBalanceLoading={token0BalanceLoading}
          tokenBalance={token0Balance}
          otherTokenAmount={secondTokenAmount}
          otherTokenSymbol={farmAsset1?.symbol}
          disableInput={disableInput}
        />
        {/* Plus Icon */}
        <div className="bg-[#e0dcdc] flex justify-center p-3 max-w-fit items-center rounded-full text-base select-none mx-auto">
          <Image src="/icons/PlusIcon.svg" alt="Plus" width={16} height={16} />
        </div>
        {/* Second token container */}
        <TokenContainer
          handleChangeTokenAmount={handleChangeSecondTokenAmount}
          inputToFocus={InputType.Second}
          focusedInput={focusedInput}
          setFocusedInput={setFocusedInput}
          farm={selectedFarm!}
          tokenSymbol={farmAsset1?.symbol}
          tokenAmount={secondTokenAmount}
          inputRef={secondInputRef}
          setTokenAmount={setSecondTokenAmount}
          updateAnotherTokenAmount={updateFirstTokenAmount}
          tokenBalanceLoading={token1BalanceLoading}
          tokenBalance={token1Balance}
          otherTokenAmount={firstTokenAmount}
          otherTokenSymbol={farmAsset0?.symbol}
          disableInput={disableInput}
        />
        {/* Relative Conversion and Share of Pool */}
        <div className="p-3 flex flex-row justify-between text-[#667085] text-[14px] leading-5 font-bold text-opacity-50">
          <div className="flex flex-col items-start gap-y-2">
            <p>
              {getFirstTokenRelation} {farmAsset0?.symbol} per{" "}
              {farmAsset1?.symbol}
            </p>
            <p>
              {getSecondTokenRelation} {farmAsset1?.symbol} per{" "}
              {farmAsset0?.symbol}
            </p>
          </div>
          <p className="flex flex-col items-end">
            <span>
              {(totalSupply !== 0 && minLpTokens > 0
                ? (minLpTokens / totalSupply) * 100 < 0.001
                  ? "<0.001"
                  : (minLpTokens / totalSupply) * 100
                : 0
              ).toLocaleString("en-US")}
              %
            </span>
            <span>Share of pool</span>
          </p>
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
              {!isToken0ApprovedSuccess && !approveToken0TxnSuccess && (
                <MButton
                  type="secondary"
                  isLoading={
                    approveToken0CallLoading || approveToken0TxnLoading
                  }
                  text={
                    fixedAmtNum(firstTokenAmount) <= 0
                      ? "Please enter amount"
                      : approveToken0CallLoading
                      ? "Sign the Txn in Wallet"
                      : approveToken0TxnLoading
                      ? "Waiting for Approval"
                      : `Approve ${farmAsset0.symbol}`
                  }
                  disabled={disableApproveFirstToken}
                  onClick={async () => {
                    try {
                      const txn = await approveToken0?.();
                      // console.log("Approve0 Result", txn);
                    } catch (error) {
                      console.error(
                        `Error while Approving ${farmAsset0?.symbol}`,
                        error
                      );
                    }
                  }}
                />
              )}
              {!isToken1ApprovedSuccess &&
                !approveToken1TxnSuccess &&
                (isToken0ApprovedSuccess || approveToken0TxnSuccess) && (
                  <MButton
                    type="secondary"
                    isLoading={
                      approveToken1CallLoading || approveToken1TxnLoading
                    }
                    text={
                      fixedAmtNum(secondTokenAmount) <= 0
                        ? "Please enter amount"
                        : approveToken1CallLoading
                        ? "Sign the Txn in Wallet"
                        : approveToken1TxnLoading
                        ? "Waiting for Approval"
                        : `Approve ${farmAsset1.symbol}`
                    }
                    disabled={disableApproveSecondToken}
                    onClick={async () => {
                      try {
                        const txn = await approveToken1?.();
                        // console.log("Approve1 Result", txn);
                      } catch (error) {
                        console.error(
                          `Error while Approving ${farmAsset1?.symbol}`,
                          error
                        );
                      }
                    }}
                  />
                )}
              <MButton
                type="primary"
                isLoading={false}
                disabled={disableConfirmButton}
                text="Confirm Adding Liquidity"
                onClick={() => {
                  setIsConfirmStep(true);
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const ConfirmStep = () => {
    // Gas estimate
    const { gasEstimate, isError } = useGasEstimation(
      selectedFarm!.router,
      1,
      0,
      getAddLiqFunctionName(selectedFarm?.protocol as string) as any,
      selectedFarm!,
      address!,
      [
        farmAsset0?.address,
        farmAsset1?.address,
        formatTokenAmount(firstTokenAmount, farmAsset0?.decimals),
        formatTokenAmount(secondTokenAmount, farmAsset1?.decimals),
        formatTokenAmount(
          firstTokenAmount,
          farmAsset0?.decimals,
          (100 - SLIPPAGE) / 100
        ),
        formatTokenAmount(
          secondTokenAmount,
          farmAsset1?.decimals,
          (100 - SLIPPAGE) / 100
        ),
        address, // To
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
        <div className="flex flex-col p-6 rounded-lg border border-[#BEBEBE] gap-y-2 text-[#344054] font-bold text-lg leading-6">
          <div className="inline-flex items-center gap-x-2">
            <span>
              {minLpTokens / 10 ** 18 < 0.01
                ? "<0.01"
                : toUnits(minLpTokens / 10 ** 18, 2)}
            </span>
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
              1 {farmAsset0?.symbol} = {getSecondTokenRelation}{" "}
              {farmAsset1?.symbol}
            </span>
            <span>
              1 {farmAsset1?.symbol} = {getFirstTokenRelation}{" "}
              {farmAsset0?.symbol}
            </span>
          </p>
        </div>
        {/* Relative Conversion and Share of Pool */}
        <div className="p-3 flex flex-row justify-between text-[#667085] text-[14px] leading-5 font-bold text-opacity-50">
          <div className="flex flex-col gap-y-2">
            <p>
              {getFirstTokenRelation} {farmAsset0?.symbol} per{" "}
              {farmAsset1?.symbol}
            </p>
            <p>
              {getSecondTokenRelation} {farmAsset1?.symbol} per{" "}
              {farmAsset0?.symbol}
            </p>
          </div>
          <p className="flex flex-col items-end">
            <span>
              {(totalSupply !== 0 && minLpTokens > 0
                ? (minLpTokens / totalSupply) * 100 < 0.001
                  ? "<0.001"
                  : (minLpTokens / totalSupply) * 100
                : 0
              ).toLocaleString("en-US")}
              %
            </span>
            <span>Share of pool</span>
          </p>
        </div>
        <hr className="border-t border-[#E3E3E3] min-w-full" />
        {/* Gas Estimate / Slippage Button / Wallet Balance */}
        <div
          className={clsx(
            "rounded-xl",
            fixedAmtNum(nativeBal?.formatted) > gasEstimate
              ? "bg-[#C0F9C9]"
              : "bg-[#FFB7B7]"
          )}
        >
          <div
            className={clsx(
              "flex flex-col gap-y-3 rounded-xl px-6 py-3 bg-[#ECFFEF]",
              fixedAmtNum(nativeBal?.formatted) > gasEstimate
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
              {fixedAmtNum(nativeBal?.formatted) > gasEstimate
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
          text="Confirm Supply"
          onClick={() => {
            // console.log("args:", {
            //   aAddress: farmAsset0?.address,
            //   bAddress: farmAsset1?.address,
            //   aAmount: parseUnits(
            //     `${parseFloat(firstTokenAmount)}`,
            //     farmAsset0?.decimals
            //   ),
            //   bAmount: parseUnits(
            //     `${parseFloat(secondTokenAmount)}`,
            //     farmAsset0?.decimals
            //   ),
            //   aAmountMin: 1, // amountAMin
            //   bAmountMin: 1, // amountBMin
            //   to: address, // To
            //   timestamp: "calculated in call", // deadline (uint256)
            // });
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
                href={
                  selectedFarm?.chain == "moonbeam"
                    ? `https://moonscan.io/tx/${txnHash}`
                    : selectedFarm?.chain == "moonriver"
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
        ) : !isErrorAddLiqTxn && !isErrorAddLiqCall ? (
          <>
            <h3 className="text-base">Waiting For Confirmation</h3>
            <h2 className="text-xl">
              Supplying{" "}
              {parseFloat(firstTokenAmount) < 0.01
                ? "<0.01"
                : toUnits(parseFloat(firstTokenAmount), 2)}{" "}
              {farmAsset0?.symbol} and{" "}
              {parseFloat(secondTokenAmount) < 0.01
                ? "<0.01"
                : toUnits(parseFloat(secondTokenAmount), 2)}{" "}
              {farmAsset1?.symbol}
            </h2>
            <hr className="border-t border-[#E3E3E3] min-w-full" />
            <p className="text-base text-[#373738]">
              {isLoadingAddLiqTxn
                ? "Waiting for transaction to complete"
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

  const isOpenModalCondition = useMemo(() => {
    return (
      approveToken0CallLoading ||
      approveToken1CallLoading ||
      approveToken0TxnLoading ||
      approveToken1TxnLoading ||
      isLoadingAddLiqCall ||
      isLoadingAddLiqTxn ||
      isSlippageModalOpen
    );
  }, [
    approveToken0CallLoading,
    approveToken1CallLoading,
    approveToken0TxnLoading,
    approveToken1TxnLoading,
    isLoadingAddLiqCall,
    isLoadingAddLiqTxn,
    isSlippageModalOpen,
  ]);

  const setOpenProp = useCallback(() => {
    if (!isOpenModalCondition) {
      setIsOpen(false);
    }
  }, [isOpenModalCondition]);

  if (selectedFarm?.chain.toLowerCase() !== chain?.name.toLowerCase()) {
    return (
      <WrongNetworkModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        farmChain={selectedFarm?.chain.toLowerCase()!}
      />
    );
  }

  return (
    !!selectedFarm && (
      <LiquidityModalWrapper
        open={isOpen || isOpenModalCondition}
        setOpen={setOpenProp}
        title="Add Liquidity"
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

export default AddSectionStandard;

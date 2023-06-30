import { FC, PropsWithChildren, useEffect, useState } from "react";
import { useBalance, useContractRead } from "wagmi";
import ModalWrapper from "../ModalWrapper";
import { addLiqModalOpenAtom } from "@store/commonAtoms";
import { useAtom } from "jotai";
import MButton from "@components/Library/MButton";
import clsx from "clsx";
import Image from "next/image";
import { selectedFarmAtom } from "@store/atoms";
import { formatTokenSymbols, getLpTokenSymbol } from "@utils/farmListMethods";
import { parseAbi, parseUnits } from "viem";
import {
  useAccount,
  useNetwork,
  useContractWrite,
  useWaitForTransaction,
  usePublicClient,
} from "wagmi";
import {
  getAbi,
  getAddLiqFunctionName,
} from "@utils/abis/contract-helper-methods";
import { UnderlyingAssets } from "@utils/types";
import { tokenAbi } from "@components/Common/Layout/evmUtils";
// import useBlockTimestamp from "@hooks/useBlockTimestamp";
import useTokenReserves from "@hooks/useTokenReserves";
import useLPBalance from "@hooks/useLPBalance";

const AddSectionStandard: FC<PropsWithChildren> = () => {
  const [isOpen, setIsOpen] = useAtom(addLiqModalOpenAtom);
  const [selectedFarm] = useAtom(selectedFarmAtom);
  const { address } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();

  const tokenNames = formatTokenSymbols(selectedFarm?.asset.symbol ?? "");
  const [farmAsset0, farmAsset1] =
    selectedFarm?.asset.underlyingAssets ?? new Array<UnderlyingAssets>();

  useEffect(() => {
    console.log("selectedFarm", selectedFarm);
  }, [selectedFarm]);

  // Amount States
  const [firstTokenAmount, setFirstTokenAmount] = useState("");
  const [secondTokenAmount, setSecondTokenAmount] = useState("");
  const [estimateLpMinted, setEstimateLpMinted] = useState<number | undefined>(
    undefined
  );

  const { reserve0, reserve1 } = useTokenReserves(selectedFarm?.asset.address!);
  const { lpBalance, lpBalanceLoading } = useLPBalance(
    selectedFarm?.asset.address!
  );

  // Debounced values
  // const debouncedFirstTokenAmount: any = useDebounce(firstTokenAmount, 500);
  // const debouncedSecondTokenAmount: any = useDebounce(secondTokenAmount, 500);

  // States
  // const [isProcessing, setIsProcessing] = useState(false);
  // const [isSuccess, setIsSuccess] = useState(false);
  // const [isApproving, setIsApproving] = useState(false);

  const SLIPPAGE = 0.5; // In percentage

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

  // Check Approval Token0
  const { data: isToken0Approved, isLoading: isToken0ApprovedLoading } =
    useContractRead({
      address: farmAsset0?.address,
      abi: parseAbi(tokenAbi),
      functionName: "allowance" as any,
      args: [
        address, // owner
        selectedFarm?.router, // spender
      ],
      enabled: !!address && !!selectedFarm,
    });
  // Check Approval Token1
  const { data: isToken1Approved, isLoading: isToken1ApprovedLoading } =
    useContractRead({
      address: farmAsset1?.address,
      abi: parseAbi(tokenAbi),
      functionName: "allowance" as any,
      args: [
        address, // owner
        selectedFarm?.router, // spender
      ],
      enabled: !!address && !!selectedFarm,
    });

  // Approve token0
  const { data: dataApprove0, writeAsync: approveToken0 } = useContractWrite({
    address: farmAsset0?.address,
    abi: parseAbi(tokenAbi),
    functionName: "approve" as any,
    chainId: chain?.id,
  });
  // Approve token1
  const { data: dataApprove1, writeAsync: approveToken1 } = useContractWrite({
    address: farmAsset1?.address,
    abi: parseAbi(tokenAbi),
    functionName: "approve" as any,
    chainId: chain?.id,
  });

  const {
    data: addLiquidityData,
    isLoading: addLiquidityLoading,
    isSuccess: addLiquiditySuccess,
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
  const { isLoading: isLoadingAddLiq, isSuccess: isSuccessAddLiq } =
    useWaitForTransaction({
      hash: addLiquidityData?.hash,
    });

  // Waiting for Txns
  const { isLoading: isLoadingApprove0, isSuccess: isSuccessApprove0 } =
    useWaitForTransaction({
      hash: dataApprove0?.hash,
    });
  const { isLoading: isLoadingApprove1, isSuccess: isSuccessApprove1 } =
    useWaitForTransaction({
      hash: dataApprove1?.hash,
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
    const estimatedLPAmountMinted =
      (firstTokenAmount * parseFloat(lpBalance!)) / reserve0;
    setEstimateLpMinted(estimatedLPAmountMinted);
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
    const estimatedLPAmountMinted =
      (secondTokenAmount * parseFloat(lpBalance!)) / reserve1;
    setEstimateLpMinted(estimatedLPAmountMinted);
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
    const expectedSecondTokenAmount = updateSecondTokenAmount(firstTokenFloat);
    // if (e.target.value == "") {
    //   setFees(null);
    // }
    // await handleFees(firstTokenAmount, expectedSecondTokenAmount);
  };

  // Method to update token values and fetch fees based on secondToken Input
  const handleChangeSecondTokenAmount = async (e: any) => {
    setSecondTokenAmount(e.target.value);

    // Calculate first token amount
    const secondTokenFloat = parseFloat(e.target.value);
    const expectedFirstTokenAmount = updateFirstTokenAmount(secondTokenFloat);

    // if (e.target.value == "") {
    //   setFees(null);
    // }
    // // Calculate Fees
    // await handleFees(secondTokenAmount, expectedFirstTokenAmount);
  };

  // Testing useEffects for Console Logs
  // useEffect(() => {
  //   console.log("reserve0", reserve0);
  //   console.log("reserve1", reserve1);
  //   console.log("lpBalance", lpBalance);
  // }, [reserve0, reserve1, lpBalance]);

  useEffect(() => {
    if (!isToken0ApprovedLoading || !isToken1ApprovedLoading) {
      console.log("isToken0Approved", !!Number(isToken0Approved));
      console.log("isToken1Approved", !!Number(isToken1Approved));
    }
  }, [isToken1Approved, isToken0Approved]);

  useEffect(() => {
    if (addLiquidityLoading) {
      console.log("addliq method loading... sign the txn");
    } else if (isLoadingAddLiq) {
      console.log("addliq txn loading...", isLoadingAddLiq);
    }
  }, [addLiquidityLoading, isLoadingAddLiq]);

  useEffect(() => {
    if (!isToken0ApprovedLoading || !isToken1ApprovedLoading) {
      console.log("isSuccess Approve0", isSuccessApprove0);
      console.log("isSuccess Approve1", isSuccessApprove1);
    }
  }, [isSuccessApprove0, isSuccessApprove1]);

  return (
    !!selectedFarm && (
      <ModalWrapper open={isOpen} setOpen={setIsOpen}>
        <p className="font-semibold text-lg text-left">Add Liquidity</p>
        <div className="w-full flex flex-col gap-y-10">
          {/* First token Container */}
          <div className="flex flex-col gap-y-3">
            <div className="text-left text-base">
              {token0BalanceLoading ? (
                <p>loading...</p>
              ) : (
                !!token0Balance && (
                  <p>
                    Balance: {token0Balance?.formatted} {token0Balance?.symbol}
                  </p>
                )
              )}
            </div>
            <div
              className={clsx(
                "flex flex-row justify-between p-4 border border-[#727272] rounded-lg"
              )}
            >
              <div className="flex flex-row gap-x-5 items-center">
                <div className="z-10 flex overflow-hidden rounded-full">
                  <Image
                    src={selectedFarm?.asset.logos[0] as string}
                    alt={selectedFarm?.asset.symbol as string}
                    width={32}
                    height={32}
                  />
                </div>
                <span>{farmAsset0?.symbol}</span>
              </div>
              <div className="flex flex-col gap-y-3">
                <div className="flex flex-row justify-end items-center gap-x-3">
                  <p className="flex flex-col items-end text-sm leading-[19px] opacity-50">
                    <span>Balance</span>
                  </p>
                </div>
                <div className="text-right">
                  <input
                    placeholder="0"
                    className={clsx(
                      "text-xl leading-[27px] bg-transparent text-right focus:outline-none"
                      // token0BalNotAvailable && "text-[#FF8787]"
                    )}
                    min={0}
                    onChange={handleChangeFirstTokenAmount}
                    value={firstTokenAmount}
                    autoFocus
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="py-3 px-4 bg-[#E0DCDC] rounded-full max-w-fit mx-auto select-none">
            +
          </div>
          {/* Second token container */}
          <div className="flex flex-col gap-y-3">
            <div className="text-left text-base">
              {token1BalanceLoading ? (
                <p>loading...</p>
              ) : (
                !!token1Balance && (
                  <p>
                    Balance: {token1Balance?.formatted} {token1Balance?.symbol}
                  </p>
                )
              )}
            </div>
            <div
              className={clsx(
                "flex flex-row justify-between p-4 border border-[#727272] rounded-lg"
              )}
            >
              <div className="flex flex-row gap-x-5 items-center">
                <div className="z-10 flex overflow-hidden rounded-full">
                  <Image
                    src={selectedFarm?.asset.logos[1] as string}
                    alt={selectedFarm?.asset.symbol as string}
                    width={32}
                    height={32}
                  />
                </div>
                <span>{farmAsset1?.symbol}</span>
              </div>
              <div className="flex flex-col gap-y-3">
                <div className="flex flex-row justify-end items-center gap-x-3">
                  <p className="flex flex-col items-end text-sm leading-[19px] opacity-50">
                    <span>Balance</span>
                  </p>
                </div>
                <div className="text-right">
                  <input
                    placeholder="0"
                    className={clsx(
                      "text-xl leading-[27px] bg-transparent text-right focus:outline-none"
                      // token1BalNotAvailable && "text-[#FF8787]"
                    )}
                    min={0}
                    onChange={handleChangeSecondTokenAmount}
                    value={secondTokenAmount}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-y-2">
            {isToken0ApprovedLoading || isToken1ApprovedLoading ? (
              <MButton
                type="primary"
                text="Checking if tokens are approved..."
              />
            ) : (isSuccessApprove0 || !!Number(isToken0Approved)) &&
              (isSuccessApprove1 || !!Number(isToken1Approved)) ? (
              <MButton
                type="secondary"
                disabled={
                  // Atleast one token must be more than zero
                  firstTokenAmount == "" ||
                  secondTokenAmount == "" ||
                  (parseFloat(firstTokenAmount) <= 0 &&
                    parseFloat(secondTokenAmount) <= 0) ||
                  typeof addLiquidity == "undefined" ||
                  isLoadingAddLiq ||
                  isSuccessAddLiq
                }
                text={isLoadingAddLiq ? "Processing..." : "Confirm"}
                onClick={async () => {
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
                        (parseFloat(firstTokenAmount) * (100 - SLIPPAGE)) / 100, // TODO: Need to multiply it with token amount?
                      minToken1Amount:
                        (parseFloat(secondTokenAmount) * (100 - SLIPPAGE)) /
                        100,
                      msg_sender: address,
                      block_timestamp: "Calc at runtime",
                    });
                    // Handler of Add Liquidity
                    handleAddLiquidity();
                  }
                }}
              />
            ) : (
              <>
                {!isToken0Approved && !isSuccessApprove0 && (
                  <MButton
                    type="secondary"
                    text={
                      isLoadingApprove0
                        ? "Approving..."
                        : `Approve ${farmAsset0.symbol} Token`
                    }
                    disabled={
                      isSuccessApprove0 ||
                      isLoadingApprove0 ||
                      typeof approveToken0 == "undefined"
                    }
                    onClick={async () => {
                      const txn = await approveToken0?.({
                        args: [
                          selectedFarm?.router,
                          BigInt(
                            "115792089237316195423570985008687907853269984665640564039457584007913129639935"
                          ),
                        ],
                      });
                      console.log("Approve0 Result", txn);
                    }}
                  />
                )}
                {!isToken1Approved && !isSuccessApprove1 && (
                  <MButton
                    text={
                      isLoadingApprove1
                        ? "Approving..."
                        : `Approve ${farmAsset1.symbol} Token`
                    }
                    type="secondary"
                    disabled={
                      isSuccessApprove1 ||
                      isLoadingApprove1 ||
                      typeof approveToken1 == "undefined"
                    }
                    onClick={async () => {
                      const txn = await approveToken1?.({
                        args: [
                          selectedFarm?.router,
                          BigInt(
                            "115792089237316195423570985008687907853269984665640564039457584007913129639935"
                          ),
                        ],
                      });
                      console.log("Approve1 Result", txn);
                    }}
                  />
                )}
              </>
            )}
            <MButton
              type="transparent"
              text="Go Back"
              onClick={() => {
                setIsOpen(false);
              }}
            />
          </div>
          {isSuccessAddLiq && <div>Liquidity Added successfully</div>}
        </div>
      </ModalWrapper>
    )
  );
};

// ("function approve(address guy, uint wad) public returns (bool)");

export default AddSectionStandard;

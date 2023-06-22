import { FC, PropsWithChildren, useEffect, useState } from "react";
import { useBalance } from "wagmi";
import ModalWrapper from "../ModalWrapper";
import { addLiqModalOpenAtom } from "@store/commonAtoms";
import { useAtom } from "jotai";
import MButton from "@components/Library/MButton";
import clsx from "clsx";
import Image from "next/image";
import { selectedFarmAtom } from "@store/atoms";
import { formatTokenSymbols, getLpTokenSymbol } from "@utils/farmListMethods";
import {
  useAccount,
  useNetwork,
  useBlockNumber,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
  usePublicClient,
} from "wagmi";
import { type Block } from "viem";
import { useDebounce } from "usehooks-ts";
import {
  getAbi,
  getContractAddress,
  getAddLiqFunctionName,
} from "@utils/abis/contract-helper-methods";
import { UnderlyingAssets } from "@utils/types";

const AddLiquidityModal: FC<PropsWithChildren> = () => {
  const [isOpen, setIsOpen] = useAtom(addLiqModalOpenAtom);
  const [selectedFarm] = useAtom(selectedFarmAtom);
  const { address } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();

  const tokenNames = formatTokenSymbols(selectedFarm?.asset.symbol ?? "");
  const [token0, token1] = tokenNames;
  const [farmAsset0, farmAsset1] =
    selectedFarm?.asset.underlyingAssets ?? new Array<UnderlyingAssets>();

  // Amount States
  const [firstTokenAmount, setFirstTokenAmount] = useState("");
  const [secondTokenAmount, setSecondTokenAmount] = useState("");

  // Debounced values
  const debouncedFirstTokenAmount = useDebounce(firstTokenAmount, 500);
  const debouncedSecondTokenAmount = useDebounce(secondTokenAmount, 500);

  const [isToken0Approved, setIsToken0Approved] = useState(false);
  const [isToken1Approved, setIsToken1Approved] = useState(false);
  const [isUnsupported, setIsUnsupported] = useState(true);

  const [block, setBlock] = useState<Block | null>(null);

  // States
  // const [isProcessing, setIsProcessing] = useState(false);
  // const [isSuccess, setIsSuccess] = useState(false);
  // const [isApproving, setIsApproving] = useState(false);

  const SLIPPAGE = 0.5; // In percentage

  const { data: blockNumber } = useBlockNumber({
    enabled: Boolean(debouncedFirstTokenAmount && debouncedSecondTokenAmount),
  });

  useEffect(() => {
    setFirstTokenAmount("");
    setSecondTokenAmount("");
  }, [isOpen]);

  useEffect(() => {
    publicClient
      .getBlock()
      .then((x) => {
        setBlock(x);
        console.log("block", x.timestamp, typeof x.timestamp);
        console.log("block.timestamp in integer", Number(x.timestamp));
      })
      .catch((error) => console.log("getBlock error", error));
  }, [publicClient]);

  useEffect(() => {
    console.log("debouncedFirstTokenAmount", debouncedFirstTokenAmount);
    console.log("debouncedSecondTokenAmount", debouncedSecondTokenAmount);
  }, [debouncedFirstTokenAmount, debouncedSecondTokenAmount]);

  // Balance
  const {
    data: balanceData,
    isLoading: balanceLoading,
    isError: balanceError,
  } = useBalance({
    address,
    chainId: chain?.id,
    // token: tokenAddress
  });

  useEffect(() => {
    if (!!selectedFarm) {
      console.log(
        "abi for current pool",
        getAbi(
          selectedFarm?.protocol as string,
          selectedFarm?.chain as string,
          getLpTokenSymbol(tokenNames)
        )
      );
    }
  }, [selectedFarm]);

  // Write contract
  const { config } = usePrepareContractWrite({
    address:
      selectedFarm?.protocol.toLowerCase() != "zenlink"
        ? selectedFarm?.router
        : getContractAddress(
            selectedFarm?.protocol as string,
            getLpTokenSymbol(tokenNames)
          ),
    abi: getAbi(
      selectedFarm?.protocol as string,
      selectedFarm?.chain as string,
      getLpTokenSymbol(tokenNames)
    ),
    functionName: getAddLiqFunctionName(selectedFarm?.protocol as string),
    chainId: chain?.id,
    args: [
      farmAsset0?.address, // TokenA Address
      farmAsset1?.address, // TokenB Address
      parseFloat(debouncedFirstTokenAmount), // amountADesired
      parseFloat(debouncedSecondTokenAmount), // amountBDesired
      Math.floor(
        (parseFloat(debouncedFirstTokenAmount) * (100 - SLIPPAGE)) / 100
      ), // amountAMin
      Math.floor(
        (parseFloat(debouncedSecondTokenAmount) * (100 - SLIPPAGE)) / 100
      ), // amountBMin
      address, // To
      Number(block?.timestamp), // deadline (uint256)
    ],
    enabled: Boolean(debouncedFirstTokenAmount && debouncedSecondTokenAmount),
  });

  const {
    data,
    isLoading: addLiquidityLoading,
    isSuccess: addLiquiditySuccess,
    writeAsync: addLiquidity,
  } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const handleAddLiquidity = async () => {
    try {
      const txnRes = await addLiquidity?.();
      console.log("txnResult", txnRes);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isToken0Approved && isToken1Approved) {
      setIsUnsupported(false);
    }
  }, [isToken0Approved, isToken1Approved]);

  useEffect(() => console.log("farm", selectedFarm), [selectedFarm]);

  // Method to update token values and fetch fees based on firstToken Input
  const handleChangeFirstTokenAmount = async (e: any) => {
    setFirstTokenAmount(e.target.value);
    // const firstTokenAmount = parseFloat(e.target.value);
    // if (e.target.value == "") {
    //   setFees(null);
    // }
    // const expectedSecondTokenAmount = updateSecondTokenAmount(firstTokenAmount);
    // await handleFees(firstTokenAmount, expectedSecondTokenAmount);
  };

  // Method to update token values and fetch fees based on secondToken Input
  const handleChangeSecondTokenAmount = async (e: any) => {
    setSecondTokenAmount(e.target.value);
    // if (e.target.value == "") {
    //   setFees(null);
    // }

    // // Calculate first token amount
    // const secondTokenAmount = parseFloat(e.target.value);
    // const expectedFirstTokenAmount = updateFirstTokenAmount(secondTokenAmount);
    // // Calculate Fees
    // await handleFees(secondTokenAmount, expectedFirstTokenAmount);
  };

  return (
    !!selectedFarm && (
      <ModalWrapper open={isOpen} setOpen={setIsOpen}>
        <p className="font-semibold text-lg text-left">Add Liquidity</p>
        <div className="text-left text-base">
          {balanceLoading ? (
            <p>loading...</p>
          ) : !!balanceData && !balanceError ? (
            <p>
              Balance: {balanceData?.formatted} {balanceData?.symbol}
            </p>
          ) : (
            <p>error</p>
          )}
        </div>
        <div className="w-full flex flex-col gap-y-10">
          {/* First token Container */}
          <div className="flex flex-col gap-y-3">
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
            {isUnsupported ? (
              <>
                <MButton
                  type="secondary"
                  text="Approve First Token"
                  disabled={
                    isToken0Approved || isNaN(parseFloat(firstTokenAmount))
                  }
                  onClick={() => {
                    setIsToken0Approved(true);
                  }}
                />
                <MButton
                  type="secondary"
                  text="Approve Second Token"
                  disabled={
                    isToken1Approved || isNaN(parseFloat(secondTokenAmount))
                  }
                  onClick={() => {
                    setIsToken1Approved(true);
                  }}
                />
              </>
            ) : (
              <MButton
                type="secondary"
                disabled={
                  // Atleast one token must be more than zero
                  firstTokenAmount == "" ||
                  secondTokenAmount == "" ||
                  (parseFloat(firstTokenAmount) <= 0 &&
                    parseFloat(secondTokenAmount) <= 0 &&
                    (!addLiquidity || isLoading))
                }
                text={isLoading ? "Processing..." : "Confirm"}
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
                        (parseFloat(firstTokenAmount) * (100 - SLIPPAGE)) / 100, // TODO: Need to multiply it with token amount?
                      minToken1Amount:
                        (parseFloat(secondTokenAmount) * (100 - SLIPPAGE)) /
                        100,
                      msg_sender: address,
                      block_timestamp: Number(block?.timestamp),
                    });
                    // Handler of Add Liquidity
                    handleAddLiquidity();
                  }
                }}
              />
            )}
            <MButton
              type="transparent"
              text="Go Back"
              onClick={() => {
                setIsOpen(false);
              }}
            />
          </div>
          {isSuccess && <div>Liquidity Added successfully</div>}
        </div>
      </ModalWrapper>
    )
  );
};

export default AddLiquidityModal;

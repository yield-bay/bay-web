// Library Imports
import {
  FC,
  useRef,
  PropsWithChildren,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import Image from "next/image";
import { parseAbi, parseUnits, parseEther } from "viem";
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
import {
  addLiqModalOpenAtom,
  evmPosLoadingAtom,
  lpUpdatedAtom,
  slippageModalOpenAtom,
} from "@store/commonAtoms";
import {
  selectedFarmAtom,
  slippageAtom,
  tokenPricesAtom,
  farmsAtom,
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
import {
  // fetchEvmPositions,
  updateEvmPositions,
} from "@utils/position-utils/evmPositions";
import BigNumber from "bignumber.js";
import Countdown from "../Countdown";

enum InputType {
  Off = -1,
  First = 0,
  Second = 1,
}

const getPoolRatio = (r0: string, r1: string, d0: number, d1: number) => {
  const amount0 = parseFloat(ethers.formatUnits(r0, d0));
  const amount1 = parseFloat(ethers.formatUnits(r1, d1));
  const pr = amount0 / amount1;
  return pr;
};

const AddSectionStandard: FC<PropsWithChildren> = () => {
  const { address, connector } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const [isOpen, setIsOpen] = useAtom(addLiqModalOpenAtom);
  const [selectedFarm] = useAtom(selectedFarmAtom);
  const [isSlippageModalOpen, setIsSlippageModalOpen] = useAtom(
    slippageModalOpenAtom
  );
  const [farms] = useAtom(farmsAtom);
  const [positions, setPositions] = useAtom(positionsAtom);
  const [lpTokenPricesMap] = useAtom(lpTokenPricesAtom);
  const [tokenPricesMap] = useAtom(tokenPricesAtom);
  // const [, setIsEvmPosLoading] = useAtom(evmPosLoadingAtom);
  // const [lpUpdated, setLpUpdated] = useAtom(lpUpdatedAtom);

  const [SLIPPAGE] = useAtom(slippageAtom);
  const [txnHash, setTxnHash] = useState<string>("");

  // Input focus states
  const [focusedInput, setFocusedInput] = useState<InputType>(InputType.First);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const secondInputRef = useRef<HTMLInputElement>(null);

  const [farmAsset0, farmAsset1] =
    selectedFarm?.asset.underlyingAssets ?? new Array<UnderlyingAssets>();
  // const [reserve0, reserve1] = useState("0");

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
    selectedFarm?.protocol!,
    selectedFarm?.router!
  );
  // let iface = new ethers.Interface(
  //   getRouterAbi(
  //     selectedFarm?.protocol!,
  //     selectedFarm?.farmType == "StandardAmm" ? false : true
  //   )
  // );
  // const fdata = new ethers.Interface(
  //   getRouterAbi(
  //     selectedFarm?.protocol!,
  //     selectedFarm?.farmType == "StandardAmm" ? false : true
  //   )
  // ).encodeFunctionData(
  //   getAddLiqFunctionName(selectedFarm?.protocol as string) as any,
  //   [
  //     farmAsset0?.address, // TokenA Address
  //     farmAsset1?.address, // TokenB Address
  //     // 1,
  //     // 1,
  //     // 1,
  //     // 1,
  //     parseUnits(
  //       `${
  //         firstTokenAmount == "" || firstTokenAmount == "0"
  //           ? 1
  //           : parseFloat(firstTokenAmount)
  //       }`,
  //       farmAsset0?.decimals
  //     ),
  //     parseUnits(
  //       `${
  //         secondTokenAmount == "" || secondTokenAmount == "0"
  //           ? 1 /
  //             getPoolRatio(
  //               reserve0,
  //               reserve1,
  //               farmAsset0.decimals,
  //               farmAsset1.decimals
  //             )
  //           : parseFloat(secondTokenAmount)
  //       }`,
  //       farmAsset1?.decimals
  //     ),
  //     parseUnits(
  //       `${
  //         (firstTokenAmount == "" || firstTokenAmount == "0"
  //           ? 1
  //           : parseFloat(firstTokenAmount) * (100 - SLIPPAGE)) / 100
  //       }`,
  //       farmAsset0?.decimals
  //     ), // amountAMin
  //     parseUnits(
  //       `${
  //         (secondTokenAmount == "" || secondTokenAmount == "0"
  //           ? 1 /
  //             getPoolRatio(
  //               reserve0,
  //               reserve1,
  //               farmAsset0.decimals,
  //               farmAsset1.decimals
  //             )
  //           : parseFloat(secondTokenAmount) * (100 - SLIPPAGE)) / 100
  //       }`,
  //       farmAsset1?.decimals
  //     ), // amountBMin
  //     address, // To
  //     1784096161000, // deadline (uint256)
  //   ]
  // );
  // const x = estimateGas(iface, fdata, selectedFarm!.router, address!);

  // useEffect(function siriusReserves() {
  //   if (selectedFarm?.protocol!.toLowerCase() == "sirius") {
  //     const { data: bal0 } = useContractRead({
  //       address: selectedFarm?.router!,
  //       abi: parseAbi(siriusRouterAbi),
  //       functionName: "getTokenBalance",
  //       args: [0],
  //       enabled: !!selectedFarm?.protocol! && !!selectedFarm?.router!,
  //     });
  //     const { data: bal1 } = useContractRead({
  //       address: selectedFarm?.router!,
  //       abi: parseAbi(siriusRouterAbi),
  //       functionName: "getTokenBalance",
  //       args: [1],
  //       enabled: !!selectedFarm?.protocol! && !!selectedFarm?.router!,
  //     });
  //     reserve0 = (bal0 as bigint).toString();
  //     reserve1 = (bal1 as bigint).toString();
  //     console.log("sirbal", bal0, bal1, router, selectedFarm?.protocol!);
  //     // return {
  //     //   reserve0: (bal0 as bigint).toString(),
  //     //   reserve1: (bal1 as bigint).toString(),
  //     // };
  //   }
  // });
  // const { data: bal0 } = useContractRead({
  //   address: selectedFarm?.router!,
  //   abi: parseAbi(siriusRouterAbi),
  //   functionName: "getTokenBalance",
  //   args: [0],
  //   enabled: !!selectedFarm?.protocol! && !!selectedFarm?.router!,
  // });
  // // eslint-disable-next-line react-hooks/rules-of-hooks
  // const { data: bal1 } = useContractRead({
  //   address: selectedFarm?.router!,
  //   abi: parseAbi(siriusRouterAbi),
  //   functionName: "getTokenBalance",
  //   args: [1],
  //   enabled: !!selectedFarm?.protocol! && !!selectedFarm?.router!,
  // });
  // console.log("sirbal", bal0, bal1, router, selectedFarm?.protocol!);
  // // return {
  // //   reserve0: (bal0 as bigint).toString(),
  // //   reserve1: (bal1 as bigint).toString(),
  // // };

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
    const { tokenSymbol, tokenAddress } = getNativeTokenAddress(
      selectedFarm?.chain!
    );
    const tokenPrice =
      tokenPricesMap[
        `${selectedFarm?.chain!}-${selectedFarm?.protocol!}-${tokenSymbol}-${tokenAddress}`
      ];
    // console.log(
    //   "tokenkey",
    //   `${selectedFarm?.chain!}-${selectedFarm?.protocol!}-${tokenSymbol}-${tokenAddress}`
    // );
    console.log("token", tokenPrice);
    if (!!tokenPrice && typeof tokenPrice == "number") {
      console.log("...setting tokenprice", tokenPrice);
      setNativePrice(tokenPrice);
    }
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
  } = useIsApprovedToken(farmAsset0?.address, selectedFarm?.router!);

  const {
    // data: isToken1Approved,
    isLoading: isToken1ApprovedLoading,
    isSuccess: isToken1ApprovedSuccess,
  } = useIsApprovedToken(farmAsset1?.address, selectedFarm?.router!);

  // To approve token0 and token1
  const {
    isLoadingApproveCall: approveToken0CallLoading,
    isLoadingApproveTxn: approveToken0TxnLoading,
    // isSuccessApproveCall: approveToken0CallSuccess,
    isSuccessApproveTxn: approveToken0TxnSuccess,
    writeAsync: approveToken0,
  } = useApproveToken(
    farmAsset0?.address,
    selectedFarm?.router!,
    farmAsset0?.symbol
  );
  const {
    isLoadingApproveCall: approveToken1CallLoading,
    isLoadingApproveTxn: approveToken1TxnLoading,
    // isSuccessApproveCall: approveToken1CallSuccess,
    isSuccessApproveTxn: approveToken1TxnSuccess,
    writeAsync: approveToken1,
  } = useApproveToken(
    farmAsset1?.address,
    selectedFarm?.router!,
    farmAsset1?.symbol
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
      console.log(
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

  const handleAddLiquidity = async () => {
    try {
      // Fetch latest block's timestamp
      const block = await publicClient.getBlock();
      const blocktimestamp =
        Number(block.timestamp.toString() + "000") + 60000 * 30; // Adding  30 minutes
      console.log("timestamp fetched //", blocktimestamp);

      console.log("calling addliquidity method...");

      const addArgs = [
        farmAsset0?.address,
        farmAsset1?.address,
        BigNumber(firstTokenAmount, 10)
          .multipliedBy(BigNumber(10).pow(farmAsset0?.decimals))
          .decimalPlaces(0, 1)
          .toString(),
        BigNumber(secondTokenAmount, 10)
          .multipliedBy(BigNumber(10).pow(farmAsset1?.decimals))
          .decimalPlaces(0, 1)
          .toString(),
        BigNumber(firstTokenAmount, 10)
          .multipliedBy((100 - SLIPPAGE) / 100)
          .multipliedBy(BigNumber(10).pow(farmAsset0?.decimals))
          .decimalPlaces(0, 1)
          .toString(),
        BigNumber(secondTokenAmount, 10)
          .multipliedBy((100 - SLIPPAGE) / 100)
          .multipliedBy(BigNumber(10).pow(farmAsset1?.decimals))
          .decimalPlaces(0, 1)
          .toString(),
        address, // To
        blocktimestamp, // deadline (uint256)
      ];
      console.log("addArgs", addArgs);

      const txnRes = await addLiquidity?.({
        args: addArgs,
      });
      if (!!txnRes) {
        setTxnHash(txnRes.hash);
      }
      console.log(
        `Adding Liquidity in ${selectedFarm?.asset.symbol} Farm`,
        txnRes
      );
    } catch (error) {
      console.error(
        `Error while adding liquidity -> ${selectedFarm?.asset.symbol} Farm\n`,
        error
      );
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
    console.log(
      "siri",
      poolRatio,
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

  useEffect(() => {
    if (!isToken0ApprovedLoading || !isToken1ApprovedLoading) {
      console.log("isToken0ApprovedSuccess", isToken0ApprovedSuccess);
      console.log("isToken1ApprovedSuccess", isToken1ApprovedSuccess);
    }
  }, [isToken1ApprovedSuccess, isToken0ApprovedSuccess]);

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
        console.log(
          "beforeuepos",
          selectedFarm?.chain!,
          selectedFarm?.protocol!
        );

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
        console.log("npos", a?.name, a?.position);
        const tempPositions = { ...positions };
        tempPositions[a?.name!] = a?.position;
        setPositions((prevState: any) => ({
          ...prevState,
          ...tempPositions,
        }));
      })();
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
              {token0BalanceLoading ? (
                <span>loading...</span>
              ) : (
                !!token0Balance && (
                  <div className="flex flex-col items-end">
                    <span>Balance</span>
                    <span>
                      {parseFloat(token0Balance?.formatted).toLocaleString(
                        "en-US"
                      )}
                    </span>
                  </div>
                )
              )}
            </div>
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
        {fixedAmtNum(firstTokenAmount) >
          fixedAmtNum(token0Balance?.formatted) && (
          <div className="text-[#FF9999] leading-6 font-semibold text-base text-left">
            {focusedInput == InputType.First
              ? "Insufficient Balance"
              : `You need ${
                  fixedAmtNum(firstTokenAmount) -
                  fixedAmtNum(token0Balance?.formatted)
                } ${
                  farmAsset0?.symbol
                } for creating an LP token with ${fixedAmtNum(
                  secondTokenAmount
                )} ${farmAsset1?.symbol}`}
          </div>
        )}
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
            <div className="flex flex-col items-end text-sm leading-5 opacity-50">
              {token1BalanceLoading ? (
                <span>loading...</span>
              ) : (
                !!token1Balance && (
                  <p className="flex flex-col items-end">
                    <span>Balance</span>
                    <span>
                      {parseFloat(token1Balance?.formatted).toLocaleString(
                        "en-US"
                      )}
                    </span>
                  </p>
                )
              )}
            </div>
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
        {fixedAmtNum(secondTokenAmount) >
          fixedAmtNum(token1Balance?.formatted) && (
          <div className="text-[#FF9999] leading-6 font-semibold text-base text-left">
            {focusedInput == InputType.Second
              ? "Insufficient Balance"
              : `You need ${
                  fixedAmtNum(secondTokenAmount) -
                  fixedAmtNum(token1Balance?.formatted)
                } ${
                  farmAsset1?.symbol
                } for creating an LP token with ${fixedAmtNum(
                  firstTokenAmount
                )} ${farmAsset0?.symbol}`}
          </div>
        )}

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
                    approveToken0CallLoading
                      ? "Sign the Txn in Wallet"
                      : approveToken0TxnLoading
                      ? "Waiting for Approval"
                      : `Approve ${farmAsset0.symbol}`
                  }
                  disabled={
                    approveToken0TxnSuccess ||
                    approveToken0CallLoading ||
                    approveToken0TxnLoading ||
                    typeof approveToken0 == "undefined"
                    // fixedAmtNum(nativeBal?.formatted) <= gasEstimate
                  }
                  onClick={async () => {
                    try {
                      const txn = await approveToken0?.();
                      console.log("Approve0 Result", txn);
                    } catch (error) {
                      console.log(
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
                      approveToken1CallLoading
                        ? "Sign the Txn in Wallet"
                        : approveToken1TxnLoading
                        ? "Waiting for Approval"
                        : `Approve ${farmAsset1.symbol}`
                    }
                    disabled={
                      approveToken1TxnSuccess ||
                      approveToken1CallLoading ||
                      approveToken1TxnLoading ||
                      typeof approveToken1 == "undefined"
                      // fixedAmtNum(nativeBal?.formatted) <= gasEstimate
                    }
                    onClick={async () => {
                      try {
                        const txn = await approveToken1?.();
                        console.log("Approve1 Result", txn);
                      } catch (error) {
                        console.log(
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
                disabled={
                  // firstTokenAmount == "" ||
                  // secondTokenAmount == "" ||
                  // parseFloat(firstTokenAmount) <= 0 ||
                  // parseFloat(secondTokenAmount) <= 0 ||
                  fixedAmtNum(firstTokenAmount) <= 0 ||
                  fixedAmtNum(secondTokenAmount) <= 0 ||
                  !(isToken0ApprovedSuccess || approveToken0TxnSuccess) ||
                  !(isToken1ApprovedSuccess || approveToken1TxnSuccess) ||
                  fixedAmtNum(firstTokenAmount) >
                    fixedAmtNum(token0Balance?.formatted) ||
                  fixedAmtNum(secondTokenAmount) >
                    fixedAmtNum(token1Balance?.formatted)
                }
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
        BigNumber(firstTokenAmount, 10)
          .multipliedBy(BigNumber(10).pow(farmAsset0?.decimals))
          .decimalPlaces(0, 1)
          .toString(),
        BigNumber(secondTokenAmount, 10)
          .multipliedBy(BigNumber(10).pow(farmAsset1?.decimals))
          .decimalPlaces(0, 1)
          .toString(),
        BigNumber(firstTokenAmount, 10)
          .multipliedBy((100 - SLIPPAGE) / 100)
          .multipliedBy(BigNumber(10).pow(farmAsset0?.decimals))
          .decimalPlaces(0, 1)
          .toString(),
        BigNumber(secondTokenAmount, 10)
          .multipliedBy((100 - SLIPPAGE) / 100)
          .multipliedBy(BigNumber(10).pow(farmAsset1?.decimals))
          .decimalPlaces(0, 1)
          .toString(),
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
                <p>Estimating Gas...</p>
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

  const isOpenModalCondition =
    approveToken0CallLoading ||
    approveToken1CallLoading ||
    approveToken0TxnLoading ||
    approveToken1TxnLoading ||
    isLoadingAddLiqCall ||
    isLoadingAddLiqTxn ||
    isSlippageModalOpen;

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

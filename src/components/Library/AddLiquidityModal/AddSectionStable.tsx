import { type FC, useState, useCallback, useMemo, useEffect } from "react";
import {
  useAccount,
  useBalance,
  useContractWrite,
  useNetwork,
  usePublicClient,
  useWaitForTransaction,
} from "wagmi";
import { useAtom } from "jotai";
import {
  addLiqModalOpenAtom,
  evmPosLoadingAtom,
  lpUpdatedAtom,
  slippageModalOpenAtom,
} from "@store/commonAtoms";
import {
  lpTokenPricesAtom,
  positionsAtom,
  selectedFarmAtom,
  slippageAtom,
  tokenPricesAtom,
} from "@store/atoms";
import MButton from "../MButton";
import { UnderlyingAssets } from "@utils/types/common";
import {
  fixedAmtNum,
  getAddLiqFunctionName,
  getRouterAbi,
} from "@utils/abis/contract-helper-methods";
import TokenInput from "./TokenInput";
import TokenButton from "./TokenButton";
import { Address, parseAbi, parseEther, parseUnits } from "viem";
import LiquidityModalWrapper from "../LiquidityModalWrapper";
import { CogIcon } from "@heroicons/react/solid";
import clsx from "clsx";
import Spinner from "../Spinner";
import Link from "next/link";
import Image from "next/image";
import useMinLPTokensStable from "@hooks/useMinLPTokensStable";
import useStableAmounts from "./useStableAmounts";
import toUnits from "@utils/toUnits";
import useTotalSupply from "@hooks/useTotalSupply";
import WrongNetworkModal from "../WrongNetworkModal";
import useGasEstimation from "@hooks/useGasEstimation";
import { getNativeTokenAddress } from "@utils/network";
import {
  // fetchEvmPositions,
  updateEvmPositions,
} from "@utils/position-utils/evmPositions";
import { handleAddLiquidityEvent } from "@utils/tracking";
import getTimestamp from "@utils/getTimestamp";
import Countdown from "../Countdown";
import SlippageBox from "../SlippageBox";

// Constants
const STABLE_AMM_SYMBOLS = [
  "MAI-tripool",
  "FRAX-3pool",
  "MIM-3pool",
  "MAI-3pool",
  "4PUSDT",
  "4JPYC",
  "4WETH",
  "4oUSD",
  "4BAI",
  "4WBNB",
];

const AddSectionStable: FC = () => {
  const publicClient = usePublicClient();
  const { address, connector } = useAccount();
  const { chain } = useNetwork();

  // Transaction Process Steps
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [isProcessStep, setIsProcessStep] = useState(false);
  const [isSlippageStep, setIsSlippageStep] = useState(false);

  const [isSlippageModalOpen, setIsSlippageModalOpen] = useAtom(
    slippageModalOpenAtom
  );
  const [txnHash, setTxnHash] = useState<string>("");
  const [SLIPPAGE] = useAtom(slippageAtom);
  const [isOpen, setIsOpen] = useAtom(addLiqModalOpenAtom);
  const [farm] = useAtom(selectedFarmAtom);
  const [approvalMap, setApprovalMap] = useState<{
    [address: Address]: boolean;
  }>({});
  const [inputMap, setInputMap] = useState<{
    [address: Address]: string;
  }>({});
  const [inputMapAmount, setInputMapAmount] = useState<{
    [address: Address]: number;
  }>({});
  const [balanceMap, setBalanceMap] = useState<{
    [address: Address]: string;
  }>({});
  const [isApprovingMap, setIsApprovingMap] = useState<{
    [address: Address]: boolean;
  }>({});

  const isCorrectChain = farm?.chain.toLowerCase() == chain?.name.toLowerCase();

  // const [farms] = useAtom(farmsAtom);
  const [positions, setPositions] = useAtom(positionsAtom);
  const [lpTokenPricesMap, setLpTokenPricesMap] = useAtom(lpTokenPricesAtom);
  // const [lpUpdated, setLpUpdated] = useAtom(lpUpdatedAtom);
  const [tokenPricesMap] = useAtom(tokenPricesAtom);
  const [, setIsEvmPosLoading] = useAtom(evmPosLoadingAtom);
  // Checking if farm assets have a lp-token pair
  const logos = useMemo(() => {
    const symbol = farm?.asset.symbol;
    const assetLogos = farm?.asset.logos;
    let logos: (string | string[])[];
    if (STABLE_AMM_SYMBOLS.includes(symbol ?? "")) {
      logos = [
        assetLogos?.[0]!,
        [assetLogos?.[1]!, assetLogos?.[2]!, assetLogos?.[3]!],
      ];
    } else {
      logos = assetLogos ?? [];
    }
    return logos;
  }, [farm]);

  const tokens = farm?.asset.underlyingAssets ?? [];

  // useEffect(() => {
  //   // console.log("balancemap", balanceMap);
  // }, [balanceMap]);

  // Input focus states
  const [focusedInput, setFocusedInput] = useState<number>(0);

  const totalSupply = useTotalSupply(
    farm?.asset.address!,
    farm?.protocol!,
    isCorrectChain
  );

  const { data: nativeBal, isLoading: isLoadingNativeBal } = useBalance({
    address,
    chainId: chain?.id,
    enabled: !!address && !!chain,
  });

  const [nativePrice, setNativePrice] = useState<number>(0);

  useEffect(() => {
    const { tokenSymbol, tokenAddress } = getNativeTokenAddress(farm?.chain!);
    const tokenPrice =
      tokenPricesMap[
        `${farm?.chain!}-${farm?.protocol!}-${tokenSymbol}-${tokenAddress}`
      ];
    // console.log(
    //   "tokenkey",
    //   `${farm?.chain!}-${farm?.protocol!}-${tokenSymbol}-${tokenAddress}`
    // );
    // console.log("token", tokenPrice);
    if (!!tokenPrice && typeof tokenPrice == "number") {
      // console.log("...setting tokenprice", tokenPrice);
      setNativePrice(tokenPrice);
    }
  }, [farm, tokenPricesMap]);

  // useEffect(() => console.log("selectedfarm", farm), [farm]);

  // const tokens = farm?.asset.underlyingAssets ?? [];

  const handleInput = useCallback((token: UnderlyingAssets, value: string) => {
    const parsedValue = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
    // Setting inputMap for Input fields
    setInputMap((pre: { [address: Address]: string }) => ({
      ...pre,
      [token.address]: value,
    }));
    // Setting inputMapAmount of amount array for calculation
    setInputMapAmount((pre: { [address: Address]: number }) => ({
      ...pre,
      [token.address]: parsedValue,
    }));
  }, []);

  const amounts = useStableAmounts(inputMapAmount, tokens);

  const estLpAmount = useMinLPTokensStable(
    farm?.router!,
    farm?.protocol!,
    amounts,
    isCorrectChain
  );

  const {
    data: addLiquidityData,
    isLoading: isLoadingAddLiqCall,
    isError: isErrorAddLiqCall,
    isSuccess: isSuccessAddLiqCall,
    writeAsync: addLiquidity,
  } = useContractWrite({
    address: farm?.router,
    abi: parseAbi(
      getRouterAbi(
        farm?.protocol!,
        farm?.farmType == "StandardAmm" ? false : true
      )
    ),
    functionName: getAddLiqFunctionName(farm?.protocol!) as any,
    chainId: chain?.id,
    onError: (error) => {
      console.error(
        `Error: Adding Liquidity in ${farm?.asset.symbol} Farm:`,
        error
      );
    },
  });

  // Wait AddLiquidity Txn
  const {
    // data: addLiquidityTxnData,
    isLoading: isLoadingAddLiqTxn,
    isError: isErrorAddLiqTxn,
    isSuccess: isSuccessAddLiqTxn,
  } = useWaitForTransaction({
    hash: addLiquidityData?.hash,
  });

  useEffect(() => {
    if (isSuccessAddLiqTxn) {
      // console.log("addliq txn success!");

      // Tracking
      handleAddLiquidityEvent({
        userAddress: address!,
        walletType: "EVM",
        walletProvider: connector?.name!,
        timestamp: getTimestamp(),
        farm: {
          id: farm?.id!,
          chef: farm?.chef!,
          chain: farm?.chain!,
          protocol: farm?.protocol!,
          assetSymbol: farm?.asset.symbol!,
        },
        underlyingAmounts: farm?.asset.underlyingAssets.map((asset) => {
          return {
            amount: inputMapAmount[asset.address],
            asset: asset.symbol,
            valueUSD:
              tokenPricesMap[
                `${farm?.chain!}-${farm?.protocol!}-${asset.symbol}-${
                  asset.address
                }`
              ],
          };
        })!,
        lpAmount: {
          amount: estLpAmount,
          asset: farm?.asset.symbol!,
          valueUSD:
            lpTokenPricesMap[
              `${farm?.chain}-${farm?.protocol}-${farm?.asset.symbol}-${farm?.asset.address}`
            ],
        },
      });
      (async () => {
        // console.log("beforeuepos", farm?.chain!, farm?.protocol!);

        const a = await updateEvmPositions({
          farm: {
            id: farm?.id!,
            chef: farm?.chef!,
            chain: farm?.chain!,
            protocol: farm?.protocol!,
            asset: {
              symbol: farm?.asset.symbol!,
              address: farm?.asset.address!,
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

  const isRequirementApproved = useMemo(() => {
    if (Object.keys(inputMapAmount).length === 0) return false;
    const allTokensAmountZeroOrLess = Object.values(inputMapAmount).every(
      (amount) => amount <= 0
    );
    if (allTokensAmountZeroOrLess) return false;
    return Object.entries(inputMapAmount).every(([tokenAddress, amount]) => {
      if (amount > 0) {
        const isApproved = !!approvalMap[tokenAddress as Address];
        return isApproved === true;
      }
      return true; // Ignore tokens with amount <= 0
    });
  }, [approvalMap, inputMapAmount]);

  // useEffect(() => {
  // console.log("balanceMap", balanceMap);
  // }, [balanceMap]);

  const isSufficientBalance = useMemo(() => {
    return Object.entries(balanceMap).every(([tokenAddress, balance]) => {
      if (inputMapAmount[tokenAddress as `0x${string}`] > 0) {
        const balanceNum = fixedAmtNum(balance);
        return inputMapAmount[tokenAddress as `0x${string}`] <= balanceNum;
      }
      return true;
    });
  }, [inputMapAmount, balanceMap]);

  // useEffect(() => {
  // console.log("isRequirementApproved", isRequirementApproved);
  // console.log("approvalMap", approvalMap);
  // console.log("inputMapAmount", inputMapAmount);
  // }, [isRequirementApproved]);

  const handleAddLiquidity = async () => {
    try {
      // Fetch latest block's timestamp
      const block = await publicClient.getBlock();
      const blocktimestamp =
        Number(block.timestamp.toString() + "000") + 60000 * 30; // Adding 30 minutes
      const minToMint = parseUnits(
        `${(estLpAmount * (100 - SLIPPAGE)) / 100}`,
        18
      );
      const args_to_pass =
        farm?.protocol.toLowerCase() == "curve"
          ? [
              amounts, // amounts (uint256[])
              minToMint, // minToMint  (uint256)
            ]
          : [
              amounts, // amounts (uint256[])
              minToMint, // minToMint (uint256)
              blocktimestamp, // deadline (uint256)
            ];

      const txnRes = await addLiquidity?.({
        args: args_to_pass,
        value:
          farm?.asset.symbol == "nASTR-ASTR LP" ? amounts[0] : parseEther("0"),
      });
      // console.log(`Adding Liquidity in ${farm?.asset.symbol} Farm`, txnRes);
      setTxnHash(txnRes?.hash);
    } catch (error) {
      console.error(
        `Error while adding liquidity -> ${farm?.asset.symbol} Farm\n`,
        error
      );
    }
  };

  const InputStep = () => {
    return (
      <div className="w-full -mt-5 flex flex-col gap-y-3">
        <div className="rounded-full max-w-fit mx-auto mb-14 py-1 px-4 bg-[#F4F4FF]">
          <span className="text-[#99F] text-base font-semibold leading-5">
            In Stable AMMs, you can choose to add just one token
          </span>
        </div>
        {tokens.map((token, index) => (
          <TokenInput
            key={`${token?.symbol}-${index}`}
            token={token}
            index={index}
            handleInput={handleInput}
            inputMap={inputMap}
            isApproving={isApprovingMap}
            balanceMap={balanceMap}
            setBalanceMap={setBalanceMap}
            nativeBal={parseFloat(nativeBal?.formatted!).toLocaleString(
              "en-US"
            )}
            logos={logos[index]}
            tokensLength={tokens.length}
            focusedInput={focusedInput}
            setFocusedInput={setFocusedInput}
          />
        ))}

        {/* Relative Conversion and Share of Pool */}
        <div className="p-3 flex flex-row w-full justify-end text-[#667085] text-[14px] leading-5 font-bold text-opacity-50">
          <p className="flex flex-col items-end">
            <span>
              {(totalSupply !== 0 && estLpAmount > 0
                ? (estLpAmount / totalSupply) * 100 < 0.001
                  ? "<0.001"
                  : (estLpAmount / totalSupply) * 100
                : 0
              ).toLocaleString("en-US")}
              %
            </span>
            <span>Share of pool</span>
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full">
          <div className="flex flex-col gap-y-3 w-full">
            {tokens.map((token, index) => (
              <TokenButton
                key={`${token?.symbol}-${index}`}
                token={token}
                inputMapAmount={inputMapAmount}
                selectedFarm={farm!}
                setIsApproving={setIsApprovingMap}
                approvalMap={approvalMap}
                setApprovalMap={setApprovalMap}
              />
            ))}
          </div>
          {isRequirementApproved && (
            <MButton
              type="primary"
              isLoading={isLoadingAddLiqCall || isLoadingAddLiqTxn}
              disabled={
                !isRequirementApproved ||
                typeof addLiquidity == "undefined" ||
                amounts.length < 1 ||
                !isSufficientBalance
              }
              text={isLoadingAddLiqCall ? "Processing..." : "Confirm"}
              onClick={() => {
                setIsConfirmStep(true);
              }}
            />
          )}
        </div>
      </div>
    );
  };

  const isOpenModalCondition =
    isLoadingAddLiqCall ||
    isLoadingAddLiqTxn ||
    isLoadingAddLiqCall ||
    isLoadingAddLiqTxn ||
    isSlippageModalOpen;

  const ConfirmStep = () => {
    // Gas estimate
    const { gasEstimate, isError } = useGasEstimation(
      farm!.router,
      1,
      0,
      getAddLiqFunctionName(farm?.protocol as string) as any,
      farm!,
      address!,
      farm?.protocol.toLowerCase() == "curve"
        ? [
            amounts, // amounts (uint256[])
            parseUnits(
              `${
                (fixedAmtNum(estLpAmount.toString()) * (100 - SLIPPAGE)) / 100
              }`,
              18
            ), // minToMint (uint256)
          ]
        : [
            amounts, // amounts (uint256[])
            parseUnits(
              `${
                (fixedAmtNum(estLpAmount.toString()) * (100 - SLIPPAGE)) / 100
              }`,
              18
            ), // minToMint (uint256)
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
              {estLpAmount < 0.01 ? "<0.01" : toUnits(estLpAmount, 2)}
            </span>
            {/* Make a mapping here */}
            {farm?.asset.logos.map((logo, index) => (
              <div
                key={logo}
                className="z-10 flex overflow-hidden rounded-full"
              >
                <Image src={logo} alt={logo} width={24} height={24} />
              </div>
            ))}
          </div>
          <p>{farm?.asset.symbol} Tokens</p>
        </div>
        {/* Relative Conversion and Share of Pool */}
        <div className="p-3 flex flex-col items-end text-[#667085] text-[14px] leading-5 font-bold text-opacity-50">
          <span>
            {(totalSupply !== 0 && estLpAmount > 0
              ? (estLpAmount / totalSupply) * 100 < 0.001
                ? "<0.001"
                : (estLpAmount / totalSupply) * 100
              : 0
            ).toLocaleString("en-US")}
            {/* % = {estLpAmount} {totalSupply} */}%
          </span>
          <span>Share of pool</span>
        </div>
        <hr className="border-t border-[#E3E3E3] min-w-full" />
        {/* Gas Fees // Slippage // Suff. Wallet balance */}
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
              {isError ? (
                <p className="text-red-400">Error estimating gas</p>
              ) : gasEstimate === 0 ? (
                <p>estimating gas...</p>
              ) : (
                <p>
                  <span className="opacity-40 mr-2 font-semibold">
                    {gasEstimate < 0.001 ? "<0.001" : gasEstimate.toFixed(3)}{" "}
                    {nativeBal?.symbol}
                  </span>
                  {gasEstimate * nativePrice < 0.00001 ? (
                    "<$0.00001"
                  ) : (
                    <span>${(gasEstimate * nativePrice).toFixed(5)}</span>
                  )}
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
              {parseFloat(nativeBal?.formatted ?? "0") > gasEstimate
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
          disabled={isError}
          text="Confirm Supply"
          onClick={() => {
            // console.log("args:", {});
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
                  farm?.chain == "moonbeam"
                    ? `https://moonscan.io/tx/${txnHash}`
                    : farm?.chain == "moonriver"
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
            <h2 className="inline-flex items-center gap-x-1 text-xl">
              <p>Supplying</p>
              <p>
                {amounts.map((amount, index) => (
                  <span key={index}>
                    {Number(amount) / 10 ** tokens[index]?.decimals < 0.01
                      ? "<0.01"
                      : toUnits(
                          Number(amount) / 10 ** tokens[index]?.decimals,
                          2
                        )}{" "}
                    {tokens[index]?.symbol}{" "}
                    {index !== tokens.length - 1 && (
                      <span className="mr-1">and</span>
                    )}
                  </span>
                ))}
              </p>
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

  if (!isCorrectChain) {
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

export default AddSectionStable;

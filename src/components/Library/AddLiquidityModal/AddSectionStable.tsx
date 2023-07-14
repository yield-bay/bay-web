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
import { addLiqModalOpenAtom, slippageModalOpenAtom } from "@store/commonAtoms";
import { selectedFarmAtom, slippageAtom } from "@store/atoms";
import MButton from "../MButton";
import { UnderlyingAssets } from "@utils/types";
import {
  getAddLiqFunctionName,
  getRouterAbi,
} from "@utils/abis/contract-helper-methods";
import TokenInput from "./TokenInput";
import TokenButton from "./TokenButton";
import { parseAbi, parseUnits } from "viem";
import useTokenReserves from "@hooks/useTokenReserves";
import LiquidityModalWrapper from "../LiquidityModalWrapper";
import { CogIcon } from "@heroicons/react/solid";
import clsx from "clsx";
import Spinner from "../Spinner";
import Link from "next/link";
import Image from "next/image";

const AddSectionStable: FC = () => {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { chain } = useNetwork();

  // Transaction Process Steps
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [isProcessStep, setIsProcessStep] = useState(false);

  const [isSlippageModalOpen, setIsSlippageModalOpen] = useAtom(
    slippageModalOpenAtom
  );
  const [SLIPPAGE] = useAtom(slippageAtom);
  const [isOpen, setIsOpen] = useAtom(addLiqModalOpenAtom);
  const [farm] = useAtom(selectedFarmAtom);
  const [approvalMap, setApprovalMap] = useState<{
    [address: `0x${string}`]: boolean;
  }>({});
  const [inputMap, setInputMap] = useState<{
    [address: `0x${string}`]: string;
  }>({});

  const { data: nativeBal, isLoading: isLoadingNativeBal } = useBalance({
    address,
    chainId: chain?.id,
    enabled: !!address,
  });

  useEffect(() => console.log("approvalMap", approvalMap), [approvalMap]);

  const GAS_FEES = 0.0014; // In STELLA

  const tokens = farm?.asset.underlyingAssets ?? [];
  let assets = tokens;

  // const { reserve0, reserve1 } = useTokenReserves(
  //   farm?.asset.address!,
  //   farm?.protocol!
  // );

  const handleInput = useCallback((token: UnderlyingAssets, value: string) => {
    setInputMap((pre: any) => ({
      ...pre,
      [token.address]: value,
    }));
  }, []);

  // Array of input amounts
  const tokenAmount = (value: string | undefined): Number => {
    if (!isNaN(Number(value))) {
      return Number(value);
    }
    return 0;
  };

  const amounts = useMemo(() => {
    const updatedTokens = tokens
      .map((token) => {
        console.log("waota", token, inputMap);
        return parseUnits(
          `${
            !isNaN(Number(inputMap[token.address]))
              ? parseFloat(inputMap[token.address])
              : 0
          }`,
          token.decimals
        );
      })
      .filter((amount) => {
        return !isNaN(Number(amount));
      });
    console.log("updated tokens", updatedTokens);
    return updatedTokens;
  }, [inputMap, tokens]);

  const approvalArray = useMemo(() => {
    return approvalMap ? Object.values(approvalMap) : [];
  }, [approvalMap]);

  // This method returns true if all tokens are approved
  // const isAllTokensApproved = useMemo(() => {
  //   return Object.values(approvalMap).reduce((acc, curr) => acc && curr, true);
  // }, [approvalMap]);

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

  const handleAddLiquidity = async () => {
    try {
      // Fetch latest block's timestamp
      const block = await publicClient.getBlock();
      const blocktimestamp = Number(block.timestamp.toString() + "000") + 60000; // Adding 60 seconds
      console.log("timestamp fetched //", blocktimestamp);
      console.log("calling addliquidity method...", amounts);

      const args_to_pass =
        farm?.protocol.toLowerCase() == "curve"
          ? [
              amounts, // amounts (uint256[])
              1, // minToMint (uint256)
              // address???
            ]
          : [
              amounts, // amounts (uint256[])
              1, // minToMint (uint256)
              blocktimestamp, // deadline (uint256)
            ];

      const txnRes = await addLiquidity?.({
        args: args_to_pass,
      });
      console.log("called addliquidity method.", txnRes);
    } catch (error) {
      console.error(error);
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
            selectedFarm={farm}
            tokensLength={tokens.length}
          />
        ))}

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

        {/* Buttons */}
        <div className="flex flex-row items-center w-full gap-x-3">
          <div className="flex flex-col gap-y-3">
            {tokens.map((token, index) => (
              <TokenButton
                key={`${token?.symbol}-${index}`}
                token={token}
                selectedFarm={farm!}
                setApprovalMap={setApprovalMap}
              />
            ))}
          </div>
          <MButton
            type="primary"
            isLoading={isLoadingAddLiqCall || isLoadingAddLiqTxn}
            disabled={
              amounts.length < 1 ||
              typeof addLiquidity == "undefined" ||
              isLoadingAddLiqCall ||
              isLoadingAddLiqTxn
            }
            text={isLoadingAddLiqCall ? "Processing..." : "Confirm"}
            onClick={async () => {
              if (amounts.length < 1) {
                console.log("Atleast one token amount is required!");
              } else {
                console.log("addLiquidity @args", {
                  amounts: amounts,
                  minToMint: 1,
                  deadline: "Calc at runtime",
                });
                handleAddLiquidity();
              }
            }}
          />
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
            <span>{10100}</span>
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
            console.log("args:", {});
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
              {/* Supplying {firstTokenAmount} {farmAsset0?.symbol} and{" "}
              {secondTokenAmount} {farmAsset1?.symbol} */}
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

  return (
    !!farm && (
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

export default AddSectionStable;

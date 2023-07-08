import { FC, useEffect, useState } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import { removeLiqModalOpenAtom } from "@store/commonAtoms";
import { formatTokenSymbols, getLpTokenSymbol } from "@utils/farmListMethods";
import {
  useAccount,
  useBalance,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePublicClient,
  useWaitForTransaction,
} from "wagmi";
import MButton from "../MButton";
import { selectedFarmAtom } from "@store/atoms";
import { tokenAbi } from "@components/Common/Layout/evmUtils";
import { parseAbi, parseAbiItem, parseUnits } from "viem";
import { getRemoveLiquidFunctionName } from "@utils/abis/contract-helper-methods";
import { getAbi } from "@utils/abis/contract-helper-methods";
import { FarmType, UnderlyingAssets } from "@utils/types";
import useMinimumUnderlyingTokens from "./useMinUnderlyingTokens";
import useLPBalance from "@hooks/useLPBalance";
import LiquidityModalWrapper from "../LiquidityModalWrapper";
import Image from "next/image";
import Spinner from "../Spinner";
import { useIsApprovedToken } from "@hooks/useApprovalHooks";
import Link from "next/link";
import { CogIcon } from "@heroicons/react/solid";

interface ChosenMethodProps {
  farm: FarmType;
  percentage: string;
  setPercentage: (value: string) => void;
  handlePercChange: (event: any) => void;
  lpBal: string;
  lpBalLoading: boolean;
  lpTokens: string;
  setLpTokens: (value: string) => void;
  handleLpTokensChange: (event: any) => void;
  methodId: number;
}

const RemoveLiquidityModal = () => {
  const { address } = useAccount();
  const [isOpen, setIsOpen] = useAtom(removeLiqModalOpenAtom);
  const [farm] = useAtom(selectedFarmAtom);
  const publicClient = usePublicClient();

  useEffect(() => console.log("farm @removeliq", farm), [farm]);

  // Balance of LP Token
  const { lpBalance, lpBalanceLoading } = useLPBalance(farm?.asset.address!);

  const [percentage, setPercentage] = useState("");
  const [lpTokens, setLpTokens] = useState("");
  const [methodId, setMethodId] = useState<number>(0);

  const { chain } = useNetwork();

  const SLIPPAGE = 0.5;

  const tokenNames = formatTokenSymbols(farm?.asset.symbol ?? "");
  const [token0, token1] = tokenNames;
  const [farmAsset0, farmAsset1] =
    farm?.asset.underlyingAssets ?? new Array<UnderlyingAssets>();

  const [minUnderlyingAsset0, minUnderlyingAsset1] = useMinimumUnderlyingTokens(
    farm?.asset.address!,
    farm?.protocol!,
    methodId == 0
      ? (parseFloat(lpBalance!) *
          parseFloat(percentage == "" ? "0" : percentage)) /
          100
      : parseFloat(lpTokens),
    SLIPPAGE
  );

  // Transaction Process Steps
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [isProcessStep, setIsProcessStep] = useState(false);

  // When InputType.Percentage
  const handlePercChange = (event: any) => {
    event.preventDefault();
    const value = parseFloat(event.target.value);
    if ((value >= 0 && value <= 100) || event.target.value == "") {
      setPercentage(event.target.value);
    } else {
      alert("Percentage must be between 0 & 100!");
    }
  };

  // When InputType.Token
  const handleLpTokensChange = (event: any) => {
    event.preventDefault();
    const value = event.target.value;
    if (parseFloat(value) >= 0 || value == "") {
      setLpTokens(event.target.value);
    } else {
      alert("LP Amount can't be negative!");
    }
  };

  const { data: nativeBal, isLoading: isLoadingNativeBal } = useBalance({
    address,
    chainId: chain?.id,
    enabled: !!address,
  });

  const GAS_FEES = 0.0014; // In STELLA

  // Check if already approved
  const { data: isLpApprovedData, isLoading: isLpApprovedLoading } =
    useIsApprovedToken(
      {
        symbol: farm?.asset.symbol!,
        address: farm?.asset.address!,
        decimals: 18,
      },
      farm?.router!
    );

  // Check if already approved
  // const { data: isLpApprovedData, isLoading: isLpApprovedLoading } =
  //   useContractRead({
  //     address: farm?.asset.address,
  //     abi: parseAbi(tokenAbi),
  //     functionName: "allowance" as any,
  //     args: [
  //       address, // owner
  //       farm?.router, // spender
  //     ],
  //     enabled: !!address && !!farm?.router,
  //   });

  // Approve LP token
  const {
    data: approveLpData,
    isLoading: approveLpLoading,
    writeAsync: approveLpToken,
  } = useContractWrite({
    address: farm?.asset.address,
    abi: parseAbi(tokenAbi),
    functionName: "approve" as any,
    chainId: chain?.id,
  });

  // Waiting for Txns
  const { isLoading: approveLpLoadingTxn, isSuccess: approveLpSuccessTxn } =
    useWaitForTransaction({
      hash: approveLpData?.hash,
    });

  // Remove Liquidity
  const {
    data: removeLiqData,
    isLoading: removeLiqLoading,
    isError: isErrorRemoveLiqCall,
    isSuccess: removeLiqSuccess,
    writeAsync: removeLiquidity,
  } = useContractWrite({
    address: farm?.router,
    abi: getAbi(
      farm?.protocol as string,
      farm?.chain as string,
      getLpTokenSymbol(tokenNames)
    ),
    functionName: getRemoveLiquidFunctionName(farm?.protocol ?? ""),
    chainId: chain?.id,
  });

  // Wait removeLiquidity Txn
  const {
    data: removeLiqTxnData,
    isLoading: isLoadingRemoveLiqTxn,
    isError: isErrorRemoveLiqTxn,
    isSuccess: isSuccessRemoveLiqTxn,
  } = useWaitForTransaction({
    hash: removeLiqData?.hash,
  });

  useEffect(() => {
    if (!isLpApprovedLoading) {
      console.log("isTokenLpApproved", !!Number(isLpApprovedData));
    }
  }, [isLpApprovedLoading]);

  useEffect(() => {
    if (removeLiqLoading) {
      console.log("removeliq method loading... sign the txn");
    } else if (isLoadingRemoveLiqTxn) {
      console.log("removeliq txn loading...", isLoadingRemoveLiqTxn);
    }
  }, [removeLiqLoading, isLoadingRemoveLiqTxn]);

  useEffect(() => {
    if (isSuccessRemoveLiqTxn) {
      console.log("liquidity removed successfully");
      console.log("removeLiqTxnData", removeLiqTxnData);
    }
  }, [isSuccessRemoveLiqTxn]);

  const handleRemoveLiquidity = async () => {
    try {
      // Fetch latest block's timestamp
      const block = await publicClient.getBlock();
      const blocktimestamp = Number(block.timestamp.toString() + "000") + 60000; // Adding 60 seconds
      console.log("timestamp fetched //", blocktimestamp);

      console.log("calling removeliquidity method...");
      const txnRes = await removeLiquidity?.({
        args: [
          farmAsset0?.address, // tokenA Address
          farmAsset1?.address, // tokenB Address
          methodId == 0
            ? parseUnits(
                `${
                  (parseFloat(lpBalance!) *
                    parseFloat(percentage == "" ? "0" : percentage)) /
                  100
                }`,
                18
              )
            : parseUnits(`${parseFloat(lpTokens)}`, 18), // Liquidity
          parseUnits(`${minUnderlyingAsset0}`, farmAsset0?.decimals), // amountAMin
          parseUnits(`${minUnderlyingAsset1}`, farmAsset1?.decimals), // amountBMin
          address, // to
          blocktimestamp, // deadline (uint256)
        ],
      });
      console.log("called removeliquidity method.", txnRes);
    } catch (error) {
      console.error(error);
    }
  };

  const InputStep = () => {
    return (
      <div className="w-full flex mt-8 flex-col gap-y-8">
        <div className="flex flex-col gap-y-3">
          <ChosenMethod
            farm={farm!}
            percentage={percentage.toString()}
            setPercentage={setPercentage}
            handlePercChange={handlePercChange}
            lpBal={lpBalance!}
            lpBalLoading={lpBalanceLoading}
            lpTokens={lpTokens.toString()}
            setLpTokens={setLpTokens}
            handleLpTokensChange={handleLpTokensChange}
            methodId={methodId}
          />
          <div className="inline-flex gap-2 items-center justify-start">
            {["Percentage", "LP Tokens"].map((method, index) => (
              <button
                key={index}
                className={clsx(
                  "text-sm font-bold leading-5",
                  methodId !== index && "opacity-40"
                )}
                onClick={() => setMethodId(index)}
              >
                {method}
              </button>
            ))}
          </div>
        </div>
        {/* Tokens to receive */}
        <div className="text-[#344054] text-left">
          <p className="text-base font-medium leading-5">You receive:</p>
          <div className="inline-flex gap-x-4 mt-3">
            {farm?.asset.underlyingAssets.map((token, index) => (
              <div
                key={index}
                className="inline-flex items-center space-x-3 rounded-xl bg-[#F1F1F1] px-6 py-3"
              >
                <Image
                  src={farm.asset.logos[index]}
                  alt={token?.address}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="inline-flex text-lg font-medium leading-5 gap-x-2">
                  40 {token?.symbol}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Estimate Gas and Slippage Tolerance */}
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
              <button onClick={() => {}}>
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
              {nativeBal?.formatted} {nativeBal?.symbol}
            </span>
          </div>
        </div>
        <div className="flex flex-row mt-6 gap-2">
          {!isLpApprovedData && !approveLpSuccessTxn && (
            <MButton
              type="secondary"
              isLoading={approveLpLoading || approveLpLoadingTxn}
              text={
                approveLpLoadingTxn
                  ? "Waiting for Approval"
                  : approveLpLoading
                  ? "Sign the Txn in Wallet"
                  : `Approve ${getLpTokenSymbol(tokenNames)}`
              }
              disabled={
                approveLpSuccessTxn ||
                approveLpLoading ||
                approveLpLoadingTxn ||
                typeof approveLpToken == "undefined" ||
                parseFloat(nativeBal?.formatted ?? "0") <= GAS_FEES
              }
              onClick={async () => {
                const txn = await approveLpToken?.({
                  args: [farm?.router, BigInt("0")],
                });
                console.log("Approve0 Result", txn);
              }}
            />
          )}
          <MButton
            type="primary"
            isLoading={false}
            disabled={
              (methodId == 0
                ? percentage == "" || percentage == "0"
                : lpTokens == "" || lpTokens == "0") ||
              !approveLpSuccessTxn ||
              parseFloat(nativeBal?.formatted ?? "0") <= GAS_FEES
            }
            text="Confirm Removing Liquidity"
            onClick={() => {
              setIsConfirmStep(true);
            }}
          />
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
        <div className="p-6 border border-[#BEBEBE] rounded-lg">
          <div className="inline-flex gap-x-4">
            {farm?.asset.underlyingAssets.map((token, index) => (
              <div
                key={index}
                className="inline-flex items-center space-x-3 rounded-xl bg-[#F1F1F1] px-6 py-[14px]"
              >
                <Image
                  src={farm.asset.logos[index]}
                  alt={token?.address}
                  width={24}
                  height={24}
                />
                <span className="inline-flex text-lg font-medium leading-5 gap-x-2">
                  40 {token?.symbol}
                </span>
              </div>
            ))}
          </div>
        </div>
        <MButton
          type="primary"
          isLoading={false}
          text="Confirm Withdrawal"
          onClick={() => {
            console.log("Remove Liquidity setting args:", {
              tokenA: farmAsset0?.address, // tokenA Address
              tokenB: farmAsset1?.address, // tokenB Address
              liquidity:
                methodId == 0
                  ? parseUnits(
                      `${
                        (parseFloat(lpBalance!) *
                          parseFloat(percentage == "" ? "0" : percentage)) /
                        100
                      }`,
                      18
                    )
                  : parseUnits(`${parseFloat(lpTokens)}`, 18), // Liquidity
              amountAMin: parseUnits(
                `${minUnderlyingAsset1}`,
                farmAsset0?.decimals
              ), // amountAMin, // amountAMin
              amountBMin: parseUnits(
                `${minUnderlyingAsset1}`,
                farmAsset1?.decimals
              ), // amountAMin, // amountBMin
              to: address, // to
              timestamp: "calc at runtime", // deadline (uint256)
            });
            handleRemoveLiquidity();
            setIsProcessStep(true);
          }}
        />
      </div>
    );
  };

  const ProcessStep = () => {
    return (
      <div className="flex flex-col items-center gap-y-8 text-left font-semibold leading-5">
        {isSuccessRemoveLiqTxn ? (
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
                // href={`https://moonscan.io/tx/${removeLiqTxnData?.hash}}`}
                href="#"
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
        ) : !isErrorRemoveLiqTxn && !isErrorRemoveLiqCall ? (
          <>
            <h3 className="text-base">Waiting For Confirmation</h3>
            <h2 className="text-xl">Withdrawing 50 STELLA/GLMR LP Tokens</h2>
            <hr className="border-t border-[#E3E3E3] min-w-full" />
            <p className="text-base text-[#373738]">
              {isLoadingRemoveLiqTxn
                ? "Waiting for Completion"
                : approveLpLoadingTxn
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
        open={isOpen}
        setOpen={setIsOpen}
        title="Remove Liquidity"
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

// ChosenMethod returns the type of input field
const ChosenMethod: FC<ChosenMethodProps> = ({
  farm,
  percentage,
  setPercentage,
  handlePercChange,
  lpBal,
  lpBalLoading,
  lpTokens,
  setLpTokens,
  handleLpTokensChange,
  methodId,
}) => {
  return methodId === 0 ? (
    <div className="relative flex flex-row justify-between px-6 py-[14px] border border-[#D0D5DD] rounded-lg">
      <div className="absolute text-[#344054 text-base font-medium leading-5 left-0 -top-9 flex flex-row gap-x-[6px] items-center">
        <span>Enter</span>
        <div className="inline-flex items-center justify-center -space-x-2">
          {farm?.asset.logos.map((logo, index) => (
            <div key={index} className="flex z-0 overflow-hidden rounded-full">
              <Image src={logo} alt={logo} width={24} height={24} />
            </div>
          ))}
        </div>
        <span className="font-bold">{farm?.asset?.symbol}</span>{" "}
        <span>percentage of tokens to Remove</span>
      </div>
      <input
        placeholder="0"
        className={clsx(
          "text-base text-[#4E4C4C] font-bold leading-6 text-left bg-transparent focus:outline-none"
        )}
        onChange={handlePercChange}
        value={percentage}
        autoFocus
      />
      <div className="inline-flex items-center gap-x-2">
        <p className="flex flex-col items-end text-[#667085] text-sm font-bold leading-5 opacity-50">
          {lpBalLoading ? (
            <span>loading...</span>
          ) : (
            !!lpBal && (
              <div className="flex flex-col items-end">
                <span>Balance</span>
                <span>
                  {parseFloat(lpBal).toLocaleString("en-US")}{" "}
                  {farm?.asset.symbol}
                </span>
              </div>
            )
          )}
        </p>
        <button
          className="p-2 bg-[#F1F1F1] rounded-lg text-[#8B8B8B] text-[14px] font-bold leading-5"
          onClick={() => {
            setPercentage("100");
          }}
        >
          MAX
        </button>
      </div>
    </div>
  ) : (
    <div className="relative flex flex-row justify-between px-6 py-[14px] border border-[#D0D5DD] rounded-lg">
      <div className="absolute text-[#344054 text-base font-medium leading-5 left-0 -top-9 flex flex-row gap-x-[6px] items-center">
        <span>Enter</span>
        <div className="inline-flex items-center justify-center -space-x-2">
          {farm?.asset.logos.map((logo, index) => (
            <div key={index} className="flex z-0 overflow-hidden rounded-full">
              <Image src={logo} alt={logo} width={24} height={24} />
            </div>
          ))}
        </div>
        <span className="font-bold">{farm?.asset?.symbol}</span>{" "}
        <span>Tokens to Remove</span>
      </div>
      <input
        placeholder="0"
        className={clsx(
          "text-base text-[#4E4C4C] font-bold leading-6 text-left bg-transparent focus:outline-none"
        )}
        onChange={handleLpTokensChange}
        value={lpTokens}
        autoFocus
      />
      <div className="inline-flex items-center gap-x-2">
        <p className="flex flex-col items-end text-[#667085] text-sm font-bold leading-5 opacity-50">
          {lpBalLoading ? (
            <span>loading...</span>
          ) : (
            !!lpBal && (
              <div className="flex flex-col items-end">
                <span>Balance</span>
                <span>
                  {parseFloat(lpBal).toLocaleString("en-US")}{" "}
                  {farm?.asset.symbol}
                </span>
              </div>
            )
          )}
        </p>
        <button
          className="p-2 bg-[#F1F1F1] rounded-lg text-[#8B8B8B] text-[14px] font-bold leading-5"
          onClick={() => {
            setLpTokens(lpBal!);
          }}
        >
          MAX
        </button>
      </div>
    </div>
  );
};

export default RemoveLiquidityModal;

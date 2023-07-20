import { FC, useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import {
  removeLiqModalOpenAtom,
  slippageModalOpenAtom,
} from "@store/commonAtoms";
import { formatTokenSymbols, getLpTokenSymbol } from "@utils/farmListMethods";
import {
  useAccount,
  useBalance,
  useContractRead,
  // useContractRead,
  useContractWrite,
  useNetwork,
  usePublicClient,
  useWaitForTransaction,
} from "wagmi";
import MButton from "../MButton";
import { selectedFarmAtom, slippageAtom } from "@store/atoms";
import { Address, parseAbi, parseUnits } from "viem";
import {
  getRemoveLiqStableFunctionName,
  getRouterAbi,
} from "@utils/abis/contract-helper-methods";
import { FarmType, UnderlyingAssets } from "@utils/types";
import useLPBalance from "@hooks/useLPBalance";
import LiquidityModalWrapper from "../LiquidityModalWrapper";
import Image from "next/image";
import Spinner from "../Spinner";
import { useApproveToken, useIsApprovedToken } from "@hooks/useApprovalHooks";
import Link from "next/link";
import { CogIcon } from "@heroicons/react/solid";
import useCalcMinAmount from "@utils/useCalcMinAmount";
import toUnits from "@utils/toUnits";
import WrongNetworkModal from "../WrongNetworkModal";

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

enum RemoveMethod {
  ALL = 0,
  INDIVIDUAL = 1,
}

enum Method {
  PERCENTAGE = 0,
  LP = 1,
}

const RemoveSectionStable = () => {
  const [isOpen, setIsOpen] = useAtom(removeLiqModalOpenAtom);
  const [farm] = useAtom(selectedFarmAtom);
  const [isSlippageModalOpen, setIsSlippageModalOpen] = useAtom(
    slippageModalOpenAtom
  );
  const [SLIPPAGE] = useAtom(slippageAtom);

  const { chain } = useNetwork();
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const [txnHash, setTxnHash] = useState<string>("");

  useEffect(() => console.log("farm @removeliq", farm), [farm]);

  // const { data: tokensSeqArr } = useContractRead({
  //   address:
  //     farm?.protocol.toLowerCase() == "curve"
  //       ? farm?.asset.address
  //       : farm?.router,
  //   abi: parseAbi(
  //     getRouterAbi(
  //       farm?.protocol!,
  //       farm?.farmType == "StandardAmm" ? false : true
  //     )
  //   ),
  //   functionName: "getTokens",
  //   chainId: chain?.id,
  //   enabled: !!chain && !!farm,
  // });
  // const tokensSeq = tokensSeqArr as Address[];

  // Balance of LP Token
  const { lpBalance, lpBalanceLoading } = useLPBalance(farm?.asset.address!);

  const [percentage, setPercentage] = useState("");
  const [lpTokens, setLpTokens] = useState("");
  const [methodId, setMethodId] = useState<Method>(Method.PERCENTAGE);
  const [removeMethodId, setRemoveMethodId] = useState<RemoveMethod>(
    RemoveMethod.ALL
  );
  const [indiTokenId, setIndiTokenId] = useState<number>(0);

  const tokenNames = formatTokenSymbols(farm?.asset.symbol ?? "");

  const tokensArr = farm?.asset.underlyingAssets ?? [];
  const tokens = useMemo(() => {
    // if (farm?.protocol.toLowerCase() == "curve") return tokensArr;
    // if (!tokensArr || !tokensSeq) return new Array<UnderlyingAssets>();
    if (!tokensArr) return new Array<UnderlyingAssets>();
    // return tokensSeq.map(
    //   (address) => tokensArr.find((token) => token.address == address)!
    // );
    return tokensArr;
  }, [tokensArr]);

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
  const {
    data: isLpApprovedData,
    isLoading: isLpApprovedLoading,
    isSuccess: isLpApprovedSuccess,
  } = useIsApprovedToken(farm?.asset.address!, farm?.router!);

  // Approve LP token
  const {
    isLoadingApproveCall: approveLpLoading,
    isLoadingApproveTxn: approveLpLoadingTxn,
    isSuccessApproveTxn: approveLpSuccessTxn,
    writeAsync: approveLpToken,
  } = useApproveToken(farm?.asset.address!, farm?.router!);

  const { minAmount, isLoadingMinAmount } = useCalcMinAmount(
    tokens,
    methodId == Method.PERCENTAGE
      ? parseFloat(
          percentage !== "" ? (parseFloat(percentage) / 100).toString() : "0"
        ) * parseFloat(lpBalance ?? "0")
      : parseFloat(lpTokens !== "" ? lpTokens : "0"),
    farm!,
    removeMethodId,
    indiTokenId
  );

  useEffect(() => {
    if (!isLoadingMinAmount) {
      console.log("minamoutdata removeliq stable", minAmount);
    }
  }, [isLoadingMinAmount]);

  // Remove Liquidity Call
  const {
    data: removeLiqData,
    isLoading: isLoadingRemoveLiqCall,
    isError: isErrorRemoveLiqCall,
    writeAsync: removeLiquidity,
  } = useContractWrite({
    address: farm?.router,
    abi: parseAbi(
      getRouterAbi(
        farm?.protocol!,
        farm?.farmType == "StandardAmm" ? false : true
      )
    ),
    functionName: getRemoveLiqStableFunctionName(
      removeMethodId,
      farm?.protocol!
    ) as any,
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
    if (isLoadingRemoveLiqCall) {
      console.log("removeliq method loading... sign the txn");
    } else if (isLoadingRemoveLiqTxn) {
      console.log("removeliq txn loading...", isLoadingRemoveLiqTxn);
    }
  }, [isLoadingRemoveLiqCall, isLoadingRemoveLiqTxn]);

  useEffect(() => {
    if (isSuccessRemoveLiqTxn) {
      console.log("liquidity removed successfully");
      console.log("removeLiqTxnData", removeLiqTxnData);
    }
  }, [isSuccessRemoveLiqTxn]);

  const getArgs = (
    removalId: number,
    protocol: string,
    tokenIndex: number,
    timestamp: number
  ) => {
    const tokenAmount =
      methodId == Method.PERCENTAGE
        ? parseUnits(
            `${
              (parseFloat(lpBalance!) *
                parseFloat(percentage == "" ? "0" : percentage)) /
              100
            }`,
            18
          )
        : parseUnits(`${parseFloat(lpTokens)}`, 18); // Liquidity

    if (removalId === 1) {
      const parsedMinAmount = parseUnits(
        `${minAmount as number}`,
        tokens[tokenIndex]?.decimals
      );
      if (protocol.toLowerCase() == "curve") {
        return [tokenAmount, tokenIndex, parsedMinAmount];
      } else {
        return [tokenAmount, tokenIndex, parsedMinAmount, timestamp];
      }
    } else {
      const parsedMinAmountList = (minAmount as number[]).map((amount) => {
        return parseUnits(`${amount}`, tokens[tokenIndex]?.decimals);
      });
      return [tokenAmount, parsedMinAmountList, timestamp];
    }
  };

  const handleRemoveLiquidity = async () => {
    try {
      // Fetch latest block's timestamp
      const block = await publicClient.getBlock();
      const blocktimestamp =
        Number(block.timestamp.toString() + "000") + 60000 * 30; // Adding 30 minutes
      console.log("timestamp fetched //", blocktimestamp);

      console.log("calling removeliquidity method...");

      const args_to_pass = getArgs(
        removeMethodId,
        farm?.protocol!,
        indiTokenId,
        blocktimestamp
      );
      console.log("removal_args_to_pass", args_to_pass);

      const txnRes = await removeLiquidity?.({
        args: args_to_pass,
      });
      if (!!txnRes) {
        setTxnHash(txnRes.hash);
      }
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
          <div className="flex flex-col space-y-3 mt-3">
            {tokens.map((token, index) => (
              <button
                key={index}
                className={clsx(
                  "inline-flex items-center space-x-3 hover:-translate-y-[2px] active:translate-y-0 hover:shadow-sm transition-all duration-200 rounded-xl px-6 py-3",
                  removeMethodId == RemoveMethod.INDIVIDUAL &&
                    indiTokenId == index
                    ? "border border-[#8F8FFC] bg-[#ECECFF]"
                    : "bg-[#FAFAFA]"
                )}
                onClick={() => {
                  setRemoveMethodId(RemoveMethod.INDIVIDUAL);
                  setIndiTokenId(index);
                }}
              >
                <Image
                  src={farm!.asset.logos[index]}
                  alt={token?.address}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="inline-flex text-lg font-medium leading-5 gap-x-2">
                  {removeMethodId == RemoveMethod.INDIVIDUAL &&
                  indiTokenId == index
                    ? toUnits(
                        Array.isArray(minAmount) ? minAmount[index] : minAmount,
                        3
                      )
                    : 0}{" "}
                  {token?.symbol}
                </span>
              </button>
            ))}
            {farm?.protocol !== "curve" ? (
              <button
                className={clsx(
                  "mt-3 inline-flex items-center space-x-3 hover:-translate-y-[2px] active:translate-y-0 hover:shadow-sm transition-all duration-200 rounded-xl px-6 py-3",
                  removeMethodId == RemoveMethod.ALL
                    ? "border border-[#8F8FFC] bg-[#ECECFF]"
                    : "bg-[#FAFAFA]"
                )}
                disabled={farm?.protocol.toLowerCase() == "curve"}
                onClick={() => setRemoveMethodId(RemoveMethod.ALL)}
              >
                {tokens.map((token, index) => (
                  <p key={index} className="inline-flex items-center space-x-3">
                    <Image
                      src={farm!.asset.logos[index]}
                      alt={token?.address}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="inline-flex text-lg font-medium leading-5 gap-x-2">
                      {removeMethodId === RemoveMethod.ALL
                        ? toUnits((minAmount as number[])[index], 3)
                        : 0}{" "}
                      {token?.symbol}
                    </span>
                    {index !== tokens.length - 1 && (
                      <span className="text-lg font-medium leading-5">+</span>
                    )}
                  </p>
                ))}
              </button>
            ) : (
              ""
            )}
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
        <div className="flex flex-row mt-6 gap-2">
          {!isLpApprovedSuccess && !approveLpSuccessTxn && (
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
                const txn = await approveLpToken?.();
                console.log("Approve0 Result", txn);
              }}
            />
          )}
          <MButton
            type="primary"
            isLoading={false}
            disabled={
              (methodId == Method.PERCENTAGE
                ? percentage == "" || percentage == "0"
                : lpTokens == "" || lpTokens == "0") ||
              (!isLpApprovedSuccess && !approveLpSuccessTxn) ||
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
          <div className="grid grid-cols-2 gap-4">
            {removeMethodId == RemoveMethod.ALL ? (
              <>
                {tokens.map((token, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center space-x-3 rounded-xl bg-[#F1F1F1] px-6 py-[14px]"
                  >
                    <Image
                      src={farm!.asset.logos[index]}
                      alt={token?.address}
                      width={24}
                      height={24}
                    />
                    <span className="inline-flex text-lg font-medium leading-5 gap-x-2">
                      {toUnits((minAmount as number[])[index], 3)}{" "}
                      {token.symbol}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <div className="inline-flex items-center space-x-3 rounded-xl bg-[#F1F1F1] px-6 py-[14px]">
                <Image
                  src={farm!.asset.logos[indiTokenId]}
                  alt={tokens[indiTokenId]?.address}
                  width={24}
                  height={24}
                />
                <span className="inline-flex text-lg font-medium leading-5 gap-x-2">
                  {toUnits(minAmount as number, 3)}{" "}
                  {tokens[indiTokenId]?.symbol}
                </span>
              </div>
            )}
          </div>
        </div>
        <MButton
          type="primary"
          isLoading={false}
          text="Confirm Withdrawal"
          onClick={() => {
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
                href={`https://moonscan.io/tx/${txnHash}}`}
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
            <h2 className="text-xl">
              Withdrawing{" "}
              {methodId == Method.PERCENTAGE
                ? toUnits(
                    parseFloat(
                      percentage !== ""
                        ? (parseFloat(percentage) / 100).toString()
                        : "0"
                    ) * parseFloat(lpBalance ?? "0"),
                    3
                  )
                : toUnits(parseFloat(lpTokens !== "" ? lpTokens : "0"), 3)}{" "}
              {farm?.asset.symbol} Tokens
            </h2>
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

  const isOpenModalCondition =
    approveLpLoading ||
    approveLpLoadingTxn ||
    isLoadingRemoveLiqCall ||
    isLoadingRemoveLiqTxn ||
    isSlippageModalOpen;

  if (farm?.chain.toLowerCase() !== chain?.name.toLowerCase()) {
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
        open={isOpen || !isOpenModalCondition}
        setOpen={isOpenModalCondition ? () => {} : setIsOpen}
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
        <div className="flex flex-col items-end text-[#667085] text-sm font-bold leading-5 opacity-50">
          {lpBalLoading ? (
            <span>loading...</span>
          ) : (
            !!lpBal && (
              <p className="flex flex-col items-end">
                <span>Balance</span>
                <span>{parseFloat(lpBal).toLocaleString("en-US")}</span>
              </p>
            )
          )}
        </div>
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

export default RemoveSectionStable;

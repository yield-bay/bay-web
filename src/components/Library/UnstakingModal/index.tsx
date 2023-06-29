import { FC, useEffect, useState } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import { unstakingModalOpenAtom } from "@store/commonAtoms";
import { formatTokenSymbols, getLpTokenSymbol } from "@utils/farmListMethods";
import {
  useAccount,
  useBalance,
  useContractWrite,
  useNetwork,
  useWaitForTransaction,
} from "wagmi";
import MButton from "../MButton";
import { selectedFarmAtom } from "@store/atoms";
import ModalWrapper from "../ModalWrapper";
import {
  stellaswapV1ChefAbi,
  tokenAbi,
} from "@components/Common/Layout/evmUtils";
import { parseAbi, parseUnits } from "viem";
import { getContractAddress } from "@utils/abis/contract-helper-methods";

interface ChosenMethodProps {
  percentage: string;
  handlePercChange: (event: any) => void;
  lpBalance: number | null;
  lpTokens: string;
  handleLpTokensChange: (event: any) => void;
  methodId: number;
}

const UnstakingModal = () => {
  const { address } = useAccount();
  const [isOpen, setIsOpen] = useAtom(unstakingModalOpenAtom);
  const [farm] = useAtom(selectedFarmAtom);

  const [percentage, setPercentage] = useState<string>("");
  const [lpTokens, setLpTokens] = useState<string>("");
  const [methodId, setMethodId] = useState<number>(0);

  const { chain } = useNetwork();

  const SLIPPAGE = 0.5;

  const tokenNames = formatTokenSymbols(farm?.asset.symbol ?? "");
  const [token0, token1] = tokenNames;

  useEffect(() => {
    console.log("selectedFarm", farm);
  }, [farm]);

  // When InputType.Percentage
  const handlePercChange = (event: any) => {
    event.preventDefault();
    setPercentage(event.target.value);
  };

  // When InputType.Token
  const handleLpTokensChange = (event: any) => {
    event.preventDefault();
    setLpTokens(event.target.value);
  };

  // Balance of LP Tokens
  const { data: lpBalance, isLoading: lpBalanceLoading } = useBalance({
    address,
    chainId: chain?.id,
    token: farm?.asset.address,
    enabled: !!farm,
  });
  const lpBalanceNum = lpBalance ? parseFloat(lpBalance.formatted) : 0;

  useEffect(() => {
    if (lpBalanceLoading) {
      console.log("lpBalance loading...");
    } else if (lpBalance) {
      console.log("lpbalance", `${lpBalanceNum} ${token0}-${token1}`);
    }
  }, [lpBalanceLoading, lpBalance]);

  // Unstake LP Tokens
  const {
    data: unstakingData,
    isLoading: unstakingCallLoading,
    isSuccess: unstakingCallSuccess,
    writeAsync: unstaking,
  } = useContractWrite({
    address: farm?.chef,
    abi: [...parseAbi(stellaswapV1ChefAbi)],
    functionName: "withdraw" as any,
    chainId: chain?.id,
    args: [
      farm?.id, // pid
      methodId == 0
        ? parseUnits(`${(lpBalanceNum * parseFloat(percentage)) / 100}`, 18)
        : parseUnits(`${parseFloat(lpTokens)}`, 18), // amount
    ],
  });

  // Wait unstaking Txn
  const { isLoading: isLoadingUnstakingTxn, isSuccess: isSuccessUnstakingTxn } =
    useWaitForTransaction({
      hash: unstakingData?.hash,
    });

  useEffect(() => {
    if (unstakingCallLoading) {
      console.log("unstaking method loading... sign the txn");
    } else if (isLoadingUnstakingTxn) {
      console.log("unstaking txn loading...", isLoadingUnstakingTxn);
    }
  }, [unstakingCallLoading, isLoadingUnstakingTxn]);

  const handleUnstaking = async () => {
    try {
      const txnRes = await unstaking?.();
      console.log("txnResult", txnRes);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ModalWrapper open={isOpen} setOpen={setIsOpen}>
      <div className="w-full flex flex-col gap-y-10 mt-10 text-base">
        {/* Input Box based on the chosen method to enter tokens amount */}
        <h1 className="text-left font-semibold text-lg -mb-5">
          Unstake LP Tokens
        </h1>
        <div className="flex flex-col gap-y-5">
          <ChosenMethod
            percentage={percentage?.toString() ?? ""}
            handlePercChange={handlePercChange}
            lpBalance={lpBalanceNum}
            lpTokens={lpTokens?.toString() ?? ""}
            handleLpTokensChange={handleLpTokensChange}
            methodId={methodId}
          />
          <div className="inline-flex gap-6 items-center justify-start">
            {["Percentage", "LP Tokens"].map((method, index) => (
              <button
                key={index}
                className={clsx(
                  "text-base leading-[21.6px]",
                  methodId !== index && "opacity-60"
                )}
                onClick={() => setMethodId(index)}
              >
                {method}
              </button>
            ))}
          </div>
          {/* <p
            className={clsx(
              methodId == 0 ? !percentage : !lpTokens && "hidden"
            )}
          >
            {methodId == 0
              ? `${(lpBalanceNum * percentage) / 100} Tokens`
              : `${(lpTokens / lpBalanceNum) * 100}%`}
          </p> */}
        </div>
        {/* Estimate Gas and Slippage Tolerance */}
        <div className="flex flex-col gap-y-2 p-4 bg-gray-100 rounded-lg">
          <p className="w-full inline-flex justify-between">
            <span>Estimate Gas:</span>
            <span>30 GLMR</span>
          </p>
          <p className="w-full inline-flex justify-between">
            <span>Slippage Tolerance:</span>
            <span>{SLIPPAGE}%</span>
          </p>
          <p className="w-full inline-flex justify-between">
            <span>Sufficient Balance:</span>
            <span>89 STELLA</span>
          </p>
        </div>
        <div>
          <MButton
            className="w-full"
            type="secondary"
            text={
              isSuccessUnstakingTxn
                ? "Transaction Submitted"
                : unstakingCallLoading
                ? "Waiting for Confirmation..."
                : isLoadingUnstakingTxn
                ? "Waiting for txn to complete..."
                : "Confirm Unstaking"
            }
            disabled={
              isSuccessUnstakingTxn ||
              unstakingCallLoading ||
              isLoadingUnstakingTxn ||
              (methodId == 0
                ? isNaN(parseFloat(percentage))
                : isNaN(parseFloat(lpTokens))) ||
              typeof unstaking == "undefined"
            }
            onClick={() => {
              console.log("Unstaking args:", {
                pid: farm?.id,
                amount:
                  methodId == 0
                    ? (lpBalanceNum * parseFloat(percentage)) / 100
                    : lpTokens,
              });
              handleUnstaking();
            }}
          />
        </div>
        {isSuccessUnstakingTxn && <p>✅ Successfully Unstaked LP Tokens</p>}
      </div>
    </ModalWrapper>
  );
};

// ChosenMethod returns the type of input field
const ChosenMethod: FC<ChosenMethodProps> = ({
  percentage,
  handlePercChange,
  lpBalance,
  lpTokens,
  handleLpTokensChange,
  methodId,
}) => {
  return methodId === 0 ? (
    <div className="relative flex flex-col gap-y-5">
      <input
        className="text-2xl bg-transparent text-left pb-12 focus:outline-none w-full border-0 ring-1 ring-[#727272] focus:ring-primaryGreen rounded-lg p-4 number-input"
        autoFocus={true}
        min={0}
        max={100}
        value={percentage}
        placeholder={"0"}
        onChange={handlePercChange}
        type="number"
      />
      <div className="absolute bottom-4 left-4">
        <span className="text-base text-[#898989] leading-[21.6px]">
          {parseFloat(percentage) > 0
            ? ((parseFloat(percentage) * (lpBalance as number)) / 100).toFixed(
                2
              )
            : "0"}{" "}
          Tokens
        </span>
      </div>
      <div className="absolute right-4 top-[21px] bottom-0 text-base leading-[21.6px] text-[#727272]">
        %
      </div>
      <p className="absolute right-0 -top-10">Balance: {lpBalance ?? 0}</p>
    </div>
  ) : (
    <div className="relative flex flex-col gap-y-5">
      <input
        className="text-2xl bg-transparent text-left pb-12 focus:outline-none w-full border-0 ring-1 ring-[#727272] focus:ring-primaryGreen rounded-lg p-4 number-input"
        autoFocus={true}
        value={lpTokens}
        placeholder={"0"}
        onChange={handleLpTokensChange}
        type="number"
      />
      <div className="absolute bottom-4 left-4">
        <span className="text-base text-[#898989] leading-[21.6px]">
          {parseFloat(lpTokens) > 0
            ? ((parseFloat(lpTokens) * 100) / (lpBalance as number)).toFixed(2)
            : 0}
          %
        </span>
      </div>
      <div className="absolute right-4 top-[21px] bottom-0 text-base leading-[21.6px] text-[#727272]">
        Tokens
      </div>
    </div>
  );
};

export default UnstakingModal;

import { FC, useEffect, useState } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import { stakingModalOpenAtom } from "@store/commonAtoms";
import { formatTokenSymbols, getLpTokenSymbol } from "@utils/farmListMethods";
import {
  useAccount,
  useBalance,
  useContractWrite,
  useNetwork,
  usePublicClient,
  useWaitForTransaction,
} from "wagmi";
import MButton from "../MButton";
import { selectedFarmAtom } from "@store/atoms";
import ModalWrapper from "../ModalWrapper";
import {
  stellaswapV1ChefAbi,
  tokenAbi,
} from "@components/Common/Layout/evmUtils";
import { parseAbi, parseAbiItem, parseUnits } from "viem";
import { getContractAddress } from "@utils/abis/contract-helper-methods";
import useBlockTimestamp from "@hooks/useBlockTimestamp";
import { UnderlyingAssets } from "@utils/types";

interface ChosenMethodProps {
  percentage: string;
  handlePercChange: (event: any) => void;
  lpBalance: number | null;
  lpTokens: string;
  handleLpTokensChange: (event: any) => void;
  methodId: number;
}

const StakingModal = () => {
  const { address } = useAccount();
  const [isOpen, setIsOpen] = useAtom(stakingModalOpenAtom);
  const [farm] = useAtom(selectedFarmAtom);
  const publicClient = usePublicClient();

  // const [lpBalanceNum, setLpBalanceNum] = useState<number | null>(0);
  const [percentage, setPercentage]: [any, any] = useState<any>("");
  const [lpTokens, setLpTokens]: [any, any] = useState<any>("");
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

  useEffect(() => {
    setPercentage("");
    setLpTokens("");
  }, [isOpen]);

  // Balance of LP Tokens
  const { data: lpBalance, isLoading: lpBalanceLoading } = useBalance({
    address,
    chainId: chain?.id,
    token: farm?.asset.address,
    enabled: !!farm,
  });
  const lpBalanceNum: any = lpBalance ? parseFloat(lpBalance.formatted) : 0;

  useEffect(() => {
    console.log("lpBalance", lpBalance);
    if (lpBalanceLoading) {
      console.log("lpBalance loading...");
    } else if (lpBalance) {
      console.log("lpbalance", `${lpBalanceNum} ${token0}-${token1}`);
    }
  }, [lpBalanceLoading, lpBalanceNum]);

  // Approve LP token
  const { data: dataLpApprove, writeAsync: approveLpToken } = useContractWrite({
    address: farm?.asset.address,
    abi: [parseAbiItem(tokenAbi)],
    functionName: "approve" as any,
    chainId: chain?.id,
  });
  // Waiting for Txns
  const { isLoading: isLoadingLpApprove, isSuccess: isSuccessLpApprove } =
    useWaitForTransaction({
      hash: dataLpApprove?.hash,
    });

  // Stake LP Tokens
  const {
    data: stakingData,
    isLoading: stakingLoading,
    isSuccess: stakingSuccess,
    writeAsync: staking,
  } = useContractWrite({
    address: farm?.chef,
    abi: [...parseAbi(stellaswapV1ChefAbi)],
    functionName: "deposit" as any,
    chainId: chain?.id,
    args: [
      farm?.id, // pid
      methodId == 0
        ? parseUnits(
            (
              (lpBalanceNum * parseFloat(percentage == "" ? "0" : percentage)) /
              100
            ).toString() as any,
            18
          )
        : lpTokens, // amount
    ],
  });

  // Wait staking Txn
  const { isLoading: isLoadingStaking, isSuccess: isSuccessStaking } =
    useWaitForTransaction({
      hash: stakingData?.hash,
    });

  useEffect(() => {
    if (stakingLoading) {
      console.log("staking method loading... sign the txn");
    } else if (isLoadingStaking) {
      console.log("staking txn loading...", isLoadingStaking);
    }
  }, [stakingLoading, isLoadingStaking]);

  const handleStaking = async () => {
    try {
      const txnRes = await staking?.();
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
          Stake LP Tokens
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
        <div className="flex flex-row gap-2">
          <MButton
            type="secondary"
            className="w-1/2"
            text={
              isSuccessLpApprove
                ? "Approved"
                : isLoadingLpApprove
                ? "Approving..."
                : `Approve Token`
            }
            disabled={
              isSuccessLpApprove ||
              (methodId == 0
                ? isNaN(parseFloat(percentage))
                : isNaN(parseFloat(lpTokens))) ||
              isLoadingLpApprove ||
              typeof approveLpToken == "undefined"
            }
            onClick={async () => {
              const txn = await approveLpToken?.({
                args: [
                  farm?.chef,
                  BigInt(
                    "115792089237316195423570985008687907853269984665640564039457584007913129639935"
                  ),
                ],
              });
              console.log("Approve LP Token txn", txn);
            }}
          />
          <MButton
            className="w-1/2"
            type="secondary"
            text="Confirm Staking"
            disabled={
              !isSuccessLpApprove ||
              (methodId == 0
                ? isNaN(parseFloat(percentage))
                : isNaN(parseFloat(lpTokens))) ||
              typeof staking == "undefined"
            }
            onClick={() => {
              console.log("Staking args:", {
                pid: farm?.id,
                amount:
                  methodId == 0
                    ? (lpBalanceNum * parseFloat(percentage)) / 100
                    : lpTokens,
              });
              handleStaking();
            }}
          />
        </div>
        {isSuccessStaking && <p>✅ Successfully Staked LP Tokens</p>}
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

export default StakingModal;

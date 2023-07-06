import { FC, useEffect, useState } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import { removeLiqModalOpenAtom } from "@store/commonAtoms";
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
import { tokenAbi } from "@components/Common/Layout/evmUtils";
import { parseAbiItem, parseUnits } from "viem";
import { getRemoveLiquidFunctionName } from "@utils/abis/contract-helper-methods";
import { getAbi } from "@utils/abis/contract-helper-methods";
import { UnderlyingAssets } from "@utils/types";
import useMinimumUnderlyingTokens from "./useMinUnderlyingTokens";
import useLPBalance from "@hooks/useLPBalance";

interface ChosenMethodProps {
  percentage: string;
  handlePercChange: (event: any) => void;
  lpBalance: number | null;
  lpTokens: string;
  handleLpTokensChange: (event: any) => void;
  methodId: number;
}

const RemoveLiquidityModal = () => {
  const { address } = useAccount();
  const [isOpen, setIsOpen] = useAtom(removeLiqModalOpenAtom);
  const [farm] = useAtom(selectedFarmAtom);
  const publicClient = usePublicClient();

  useEffect(() => console.log("selectedfarm @removeliq", farm), [farm]);

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
    methodId == 0
      ? (parseFloat(lpBalance!) *
          parseFloat(percentage == "" ? "0" : percentage)) /
          100
      : parseFloat(lpTokens),
    SLIPPAGE
  );

  useEffect(() => {
    console.log("selectedFarm", farm);
  }, [farm]);

  // When InputType.Percentage
  const handlePercChange = (event: any) => {
    event.preventDefault();
    const value = parseFloat(event.target.value);

    setPercentage(event.target.value);
  };

  // When InputType.Token
  const handleLpTokensChange = (event: any) => {
    event.preventDefault();
    setLpTokens(event.target.value);
  };

  // Conditions for disabling the Confirm button
  // const lpTokensDisabled =
  //   parseFloat(lpTokens) > (lpBalanceNum as number) ||
  //   parseFloat(lpTokens) <= 0;
  // const percentageDisabled =
  //   parseFloat(percentage) <= 0 || parseFloat(percentage) > 100;

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

  // Remove Liquidity
  const {
    data: removeLiquidityData,
    isLoading: removeLiquidityLoading,
    isSuccess: removeLiquiditySuccess,
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
  const { isLoading: isLoadingRemoveLiq, isSuccess: isSuccessRemoveLiq } =
    useWaitForTransaction({
      hash: removeLiquidityData?.hash,
    });

  useEffect(() => {
    if (removeLiquidityLoading) {
      console.log("addliq method loading... sign the txn");
    } else if (isLoadingRemoveLiq) {
      console.log("addliq txn loading...", isLoadingRemoveLiq);
    }
  }, [removeLiquidityLoading, isLoadingRemoveLiq]);

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

  return (
    <ModalWrapper open={isOpen} setOpen={setIsOpen}>
      <div className="w-full flex flex-col gap-y-10 mt-10 text-base">
        <h1 className="text-left font-semibold text-lg -mb-5">Remove Tokens</h1>
        {/* Input Box based on the chosen method to enter tokens amount */}
        <p>
          Balance:{" "}
          {lpBalanceLoading
            ? "loading..."
            : `${parseFloat(lpBalance!).toFixed(5)} ${farm?.asset.symbol}`}
        </p>
        <div className="flex flex-col gap-y-5">
          <ChosenMethod
            percentage={percentage.toString()}
            handlePercChange={handlePercChange}
            lpBalance={parseFloat(lpBalance ?? "0")}
            lpTokens={lpTokens.toString()}
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
        {/* Tokens to receive */}
        <div className="text-left">
          <p>You receive:</p>
          <div className="w-full inline-flex gap-x-4 mt-3">
            <div className="rounded-md bg-gray-200 px-4 py-2">
              <div className="inline-flex gap-x-2">40 {token0}</div>
            </div>
            <div className="rounded-md bg-gray-200 px-4 py-2">
              <div className="inline-flex gap-x-2">20 {token1}</div>
            </div>
          </div>
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
            isLoading={isLoadingLpApprove}
            className="w-1/2"
            text={
              isSuccessLpApprove
                ? "Approved"
                : isLoadingLpApprove
                ? "Approving..."
                : `Approve ${getLpTokenSymbol(tokenNames)} Token`
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
                args: [farm?.router, BigInt("0")],
              });
              console.log("Approve0 Result", txn);
            }}
          />
          <MButton
            isLoading={isLoadingRemoveLiq}
            className="w-1/2"
            type="secondary"
            text="Confirm Withdrawl"
            // disabled={lpTokensDisabled || percentageDisabled}
            disabled={
              !isSuccessLpApprove ||
              (methodId == 0
                ? isNaN(parseFloat(percentage))
                : isNaN(parseFloat(lpTokens))) ||
              typeof removeLiquidity == "undefined"
            }
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
            }}
          />
        </div>
        {isSuccessRemoveLiq && <p>Successfully removed liquidity</p>}
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

export default RemoveLiquidityModal;

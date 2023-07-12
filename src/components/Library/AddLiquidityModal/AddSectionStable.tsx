import { type FC, useState, useCallback, useMemo } from "react";
import {
  useAccount,
  useBalance,
  useContractWrite,
  useNetwork,
  usePublicClient,
  useWaitForTransaction,
} from "wagmi";
import { useAtom } from "jotai";
import ModalWrapper from "../ModalWrapper";
import { addLiqModalOpenAtom } from "@store/commonAtoms";
import { selectedFarmAtom } from "@store/atoms";
import MButton from "../MButton";
import { UnderlyingAssets } from "@utils/types";
import {
  getAddLiqFunctionName,
  getStableFarmAbi,
} from "@utils/abis/contract-helper-methods";
import TokenInput from "./TokenInput";
import TokenButton from "./TokenButton";
import { parseAbi, parseUnits } from "viem";
import useTokenReserves from "@hooks/useTokenReserves";
import LiquidityModalWrapper from "../LiquidityModalWrapper";
import { CogIcon } from "@heroicons/react/solid";
import clsx from "clsx";

const SLIPPAGE = 0.5; // In percentage

const AddSectionStable: FC = () => {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { chain } = useNetwork();

  // Transaction Process Steps
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [isProcessStep, setIsProcessStep] = useState(false);

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

  const GAS_FEES = 0.0014; // In STELLA

  const tokens = farm?.asset.underlyingAssets ?? [];

  const { reserve0, reserve1 } = useTokenReserves(
    farm?.asset.address!,
    farm?.protocol!
  );

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

  const {
    data: addLiquidityData,
    isLoading: isLoadingAddLiqCall,
    isError: isErrorAddLiqCall,
    isSuccess: isSuccessAddLiqCall,
    writeAsync: addLiquidity,
  } = useContractWrite({
    address:
      farm?.protocol.toLowerCase() == "curve"
        ? farm?.asset.address
        : farm?.router,
    abi: parseAbi(getStableFarmAbi(farm?.protocol!)),
    functionName: getAddLiqFunctionName(farm?.protocol!) as any,
    chainId: chain?.id,
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
              {parseFloat(nativeBal?.formatted!).toLocaleString("en-US")}{" "}
              {nativeBal?.symbol}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-y-2">
          {tokens.map((token, index) => (
            <TokenButton
              key={`${token?.symbol}-${index}`}
              token={token}
              selectedFarm={farm!}
              setApprovalMap={setApprovalMap}
            />
          ))}
          {approvalArray.length === tokens.length && (
            <MButton
              type="secondary"
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
          )}
        </div>
      </div>
    );
  };

  const isOpenModalCondition =
    isLoadingAddLiqCall ||
    isLoadingAddLiqTxn ||
    isLoadingAddLiqCall ||
    isLoadingAddLiqTxn;

  const ConfirmStep = () => {
    return <></>;
  };

  const ProcessStep = () => {
    return <></>;
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

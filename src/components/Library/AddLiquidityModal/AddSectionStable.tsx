import { type FC, useState, useCallback, useMemo } from "react";
import {
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

const SLIPPAGE = 0.5; // In percentage

const AddSectionStable: FC = () => {
  const publicClient = usePublicClient();
  const { chain } = useNetwork();

  const [isOpen, setIsOpen] = useAtom(addLiqModalOpenAtom);
  const [farm] = useAtom(selectedFarmAtom);
  const [approvalMap, setApprovalMap] = useState<{
    [address: `0x${string}`]: boolean;
  }>({});
  const [inputMap, setInputMap] = useState<{
    [address: `0x${string}`]: string;
  }>({});

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
    isLoading: addLiquidityLoading,
    isSuccess: addLiquiditySuccess,
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
  const { isLoading: isLoadingAddLiq, isSuccess: isSuccessAddLiq } =
    useWaitForTransaction({
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

  return (
    <ModalWrapper open={isOpen} setOpen={setIsOpen}>
      <p className="font-semibold text-lg text-left">Add Liquidity</p>
      <div className="w-full flex flex-col gap-y-4">
        {/* First token Container */}
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
              isLoading={addLiquidityLoading}
              disabled={
                amounts.length < 1 ||
                typeof addLiquidity == "undefined" ||
                isLoadingAddLiq ||
                isSuccessAddLiq
              }
              text={isLoadingAddLiq ? "Processing..." : "Confirm"}
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
        {/* {isSuccessAddLiq && <div>Liquidity Added successfully</div>} */}
      </div>
    </ModalWrapper>
  );
};

export default AddSectionStable;

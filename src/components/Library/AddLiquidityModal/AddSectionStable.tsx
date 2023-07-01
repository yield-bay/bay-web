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
  getAbi,
  getAddLiqFunctionName,
} from "@utils/abis/contract-helper-methods";
import { formatTokenSymbols, getLpTokenSymbol } from "@utils/farmListMethods";
import TokenInput from "./TokenInput";
import TokenButton from "./TokenButton";

const SLIPPAGE = 0.5; // In percentage

const AddSectionStable: FC = () => {
  const publicClient = usePublicClient();
  const { chain } = useNetwork();

  const [isOpen, setIsOpen] = useAtom(addLiqModalOpenAtom);
  const [selectedFarm, setSelectedFarm] = useAtom(selectedFarmAtom);
  const [approvalMap, setApprovalMap] = useState<{
    [address: `0x${string}`]: boolean;
  }>({});
  const [inputMap, setInputMap] = useState<{
    [address: `0x${string}`]: string;
  }>({});

  const tokenNames = formatTokenSymbols(selectedFarm?.asset.symbol ?? "");
  const tokens = selectedFarm?.asset.underlyingAssets ?? [];

  const handleInput = useCallback((token: UnderlyingAssets, value: string) => {
    setInputMap((pre) => ({
      ...pre,
      [token.address]: value,
    }));
  }, []);

  // Array of input amounts
  const amounts = useMemo(() => {
    return tokens
      .map((token) => parseFloat(inputMap[token.address]) ?? 0)
      .filter((amount) => {
        return !isNaN(amount) && amount > 0;
      });
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
    address: selectedFarm?.router,
    abi: getAbi(
      selectedFarm?.protocol!,
      selectedFarm?.chain!,
      getLpTokenSymbol(tokenNames)
    ),
    functionName: getAddLiqFunctionName(selectedFarm?.protocol!),
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

      console.log("calling addliquidity method...");
      const txnRes = await addLiquidity?.({
        args: [
          amounts, // amounts (uint256[])
          1, // minToMint (uint256)
          blocktimestamp, // deadline (uint256)
        ],
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
            selectedFarm={selectedFarm}
            tokensLength={tokens.length}
          />
        ))}

        {/* Buttons */}
        <div className="flex flex-col gap-y-2">
          {tokens.map((token, index) => (
            <TokenButton
              key={`${token?.symbol}-${index}`}
              token={token}
              selectedFarm={selectedFarm!}
              setApprovalMap={setApprovalMap}
            />
          ))}
          {approvalArray.length === tokens.length && (
            <MButton
              type="secondary"
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
          <MButton
            type="transparent"
            text="Go Back"
            onClick={() => {
              setIsOpen(false);
            }}
          />
        </div>
        {/* {isSuccessAddLiq && <div>Liquidity Added successfully</div>} */}
      </div>
    </ModalWrapper>
  );
};

export default AddSectionStable;

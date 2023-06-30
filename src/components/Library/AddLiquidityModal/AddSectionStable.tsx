import { type FC, useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  useAccount,
  useBalance,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePublicClient,
  useWaitForTransaction,
} from "wagmi";
import { parseAbi } from "viem";
import clsx from "clsx";
import { useAtom } from "jotai";
import ModalWrapper from "../ModalWrapper";
import { addLiqModalOpenAtom } from "@store/commonAtoms";
import { selectedFarmAtom } from "@store/atoms";
import MButton from "../MButton";
import { FarmType, UnderlyingAssets } from "@utils/types";
import { tokenAbi } from "@components/Common/Layout/evmUtils";
import {
  getAbi,
  getAddLiqFunctionName,
} from "@utils/abis/contract-helper-methods";
import { formatTokenSymbols, getLpTokenSymbol } from "@utils/farmListMethods";

const SLIPPAGE = 0.5; // In percentage

interface TokenInputProps {
  token: UnderlyingAssets;
  index: number;
  handleInput: (token: UnderlyingAssets, value: string) => void;
  inputMap: {
    [address: `0x${string}`]: string;
  };
  selectedFarm: any;
  tokensLength: number;
}

interface ApproveBtnProps {
  token: UnderlyingAssets;
  selectedFarm: FarmType;
  setApprovalMap: React.Dispatch<
    React.SetStateAction<{
      [address: `0x${string}`]: boolean;
    }>
  >;
}

const TokenInput: FC<TokenInputProps> = ({
  token,
  index,
  handleInput,
  inputMap,
  selectedFarm,
  tokensLength,
}) => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  // Balance Token1
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
    chainId: chain?.id,
    token: token?.address,
    enabled: !!address && !!selectedFarm,
  });

  return (
    <div>
      <div className="flex flex-col gap-y-3">
        <div className="text-left text-base">
          {balanceLoading ? (
            <p>loading...</p>
          ) : !!balance ? (
            <p>
              Balance: {balance?.formatted} {token?.symbol}
            </p>
          ) : (
            <p className="text-red-500">
              ⚠️ Unable to fetch balance of {token.symbol}
            </p>
          )}
        </div>
        <div
          className={clsx(
            "flex flex-row justify-between p-4 border border-[#727272] rounded-lg"
          )}
        >
          <div className="flex flex-row gap-x-5 items-center">
            <div className="z-10 flex overflow-hidden rounded-full">
              <Image
                src={selectedFarm?.asset.logos[index]!}
                alt={selectedFarm?.asset.symbol as string}
                width={32}
                height={32}
              />
            </div>
            <span>{token?.symbol}</span>
          </div>
          <div className="flex flex-col gap-y-3">
            <div className="flex flex-row justify-end items-center gap-x-3">
              <p className="flex flex-col items-end text-sm leading-[19px] opacity-50">
                <span>Balance</span>
              </p>
            </div>
            <div className="text-right">
              <input
                placeholder="0"
                className={clsx(
                  "text-xl leading-[27px] bg-transparent text-right focus:outline-none"
                  // token0BalNotAvailable && "text-[#FF8787]"
                )}
                min={0}
                value={inputMap[token?.address] ?? ""}
                onChange={(event) => {
                  event.preventDefault();
                  handleInput(token, event.target.value);
                }}
                // value={firstTokenAmount}
                autoFocus
              />
            </div>
          </div>
        </div>
      </div>
      {index !== tokensLength - 1 && (
        <div className="py-3 px-4 mt-4 bg-[#E0DCDC] rounded-full max-w-fit mx-auto select-none">
          +
        </div>
      )}
    </div>
  );
};

const TokenButton: FC<ApproveBtnProps> = ({
  token,
  selectedFarm,
  setApprovalMap,
}) => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  // Check Approval Token0
  const { data: isApproved, isLoading: isApprovedLoading } = useContractRead({
    address: token?.address,
    abi: parseAbi(tokenAbi),
    functionName: "allowance" as any,
    args: [
      address, // owner
      selectedFarm?.router, // spender
    ],
    enabled: !!address && !!selectedFarm,
  });

  // Approve token0
  const {
    data: approveTokenData,
    isLoading: approveIsLoading,
    writeAsync: approveToken,
  } = useContractWrite({
    address: token?.address,
    abi: parseAbi(tokenAbi),
    functionName: "approve" as any,
    chainId: chain?.id,
    onError: (error) => {
      console.log(`Approve Error in ${token?.symbol}`, error);
    },
  });

  const { isLoading: isLoadingApprove, isSuccess: isSuccessApprove } =
    useWaitForTransaction({
      hash: approveTokenData?.hash,
    });

  useEffect(() => {
    // Either already approved or approved after transaction
    if (isSuccessApprove || !!Number(isApproved)) {
      setApprovalMap((pre) => ({
        ...pre,
        [token?.address]: true,
      }));
    }
  }, [isSuccessApprove, isApproved]);

  return (
    !Number(isApproved) &&
    !isSuccessApprove && (
      <MButton
        type="secondary"
        text={
          approveIsLoading
            ? "Sign the Transaction..."
            : isLoadingApprove
            ? "Approving..."
            : `Approve ${token.symbol} Token`
        }
        disabled={
          isSuccessApprove ||
          isLoadingApprove ||
          typeof approveToken == "undefined" ||
          !!Number(isApproved)
        }
        onClick={async () => {
          const txn = await approveToken?.({
            args: [
              selectedFarm?.router,
              BigInt(
                "115792089237316195423570985008687907853269984665640564039457584007913129639935"
              ),
            ],
          });
          console.log("Approve Result", txn);
        }}
      />
    )
  );
};

const AddSectionStable: FC = () => {
  const publicClient = usePublicClient();
  const { chain } = useNetwork();

  const [isOpen, setIsOpen] = useAtom(addLiqModalOpenAtom);
  const [selectedFarm, setSelectedFarm] = useAtom(selectedFarmAtom);
  // const [inputAmountMap, setInputAmountMap] = useState<{
  //   [address: `0x${string}`]: string;
  // }>({});
  const [approvalMap, setApprovalMap] = useState<{
    [address: `0x${string}`]: boolean;
  }>({});
  const [inputMap, setInputMap] = useState<{
    [address: `0x${string}`]: string;
  }>({});
  // const [tokenApprovals, setTokenApprovals] = useState<boolean[]>([]);

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

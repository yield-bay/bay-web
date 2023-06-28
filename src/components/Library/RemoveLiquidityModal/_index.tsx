import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { removeLiqModalOpenAtom } from "@store/commonAtoms";
import { selectedFarmAtom } from "@store/atoms";
import MButton from "../MButton";
import ModalWrapper from "../ModalWrapper";
import { formatTokenSymbols, getLpTokenSymbol } from "@utils/farmListMethods";
import clsx from "clsx";
// import useMinimumUnderlyingTokens from "./useMinUnderlyingTokens";
import {
  useAccount,
  usePrepareContractWrite,
  useNetwork,
  useContractWrite,
  usePublicClient,
} from "wagmi";
// import getTimestamp from "@utils/getTimestamp";
import {
  getAbi,
  getContractAddress,
  getAddLiqFunctionName,
  getRemoveLiquidFunctionName,
} from "@utils/abis/contract-helper-methods";
import { useDebounce } from "usehooks-ts";
import { Block } from "viem";
import { UnderlyingAssets } from "@utils/types";

const RemoveLiquidityModal = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const publicClient = usePublicClient();
  const [isOpen, setIsOpen] = useAtom(removeLiqModalOpenAtom);
  const [selectedFarm, setSelectedFarm] = useAtom(selectedFarmAtom);
  // Amount States
  const [lpTokenAmount, setLpTokenAmount] = useState("");
  // Debounced value
  const debouncedLpTokenAmount = useDebounce(lpTokenAmount, 500);

  const [isTokenApproved, setIsTokenApproved] = useState(false);
  const [minUnderlyingToken, setMinUnderlyingToken] = useState([0, 0]);

  const [block, setBlock] = useState<Block | null>(null);

  const tokenNames = formatTokenSymbols(selectedFarm?.asset.symbol ?? "");
  const [token0, token1] = tokenNames;
  const [farmAsset0, farmAsset1] =
    selectedFarm?.asset.underlyingAssets ?? new Array<UnderlyingAssets>();

  // States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const SLIPPAGE = 0.5;

  const handleLpTokensChange = (event: any) => {
    event.preventDefault();
    setLpTokenAmount(event.target.value);
  };

  useEffect(() => {
    publicClient
      .getBlock()
      .then((x) => {
        setBlock(x);
        console.log("block", x.timestamp, typeof x.timestamp);
        console.log("block.timestamp in integer", Number(x.timestamp));
      })
      .catch((error) => console.log("getBlock error", error));
  }, [publicClient]);

  // Write contract
  const { config } = usePrepareContractWrite({
    address: selectedFarm?.router,
    abi: getAbi(
      selectedFarm?.protocol as string,
      selectedFarm?.chain as string,
      getLpTokenSymbol(tokenNames)
    ),
    functionName: getRemoveLiquidFunctionName(selectedFarm?.protocol as string),
    chainId: chain?.id,
    args: [
      farmAsset0?.address,
      farmAsset1?.address,
      parseFloat(debouncedLpTokenAmount),
      1,
      1,
      address,
      Number(block?.timestamp),
    ],
    enabled: Boolean(debouncedLpTokenAmount),
  });

  const {
    data: removeLiquidityData,
    isLoading: removeLiquidityLoading,
    isSuccess: removeLiquiditySuccess,
    writeAsync: removeLiquidityAsync,
  } = useContractWrite(config);

  const handleAddLiquidity = async () => {
    try {
      const txnRes = await removeLiquidityAsync?.();
      console.log("txnResult", txnRes);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ModalWrapper open={isOpen} setOpen={setIsOpen}>
      <p className="font-semibold text-lg text-left">Remove Liquidity</p>
      <div className="w-full flex flex-col gap-y-10">
        <div className="flex flex-col gap-y-5">
          <div className="relative flex flex-col gap-y-5">
            <p className="text-sm text-left">
              Enter {token0}-{token1} LP Tokens to remove
            </p>
            <input
              className="text-2xl bg-transparent text-left pb-12 focus:outline-none w-full border-0 ring-1 ring-[#727272] focus:ring-primaryGreen rounded-lg p-4 number-input"
              autoFocus={true}
              value={lpTokenAmount}
              placeholder={"0"}
              onChange={handleLpTokensChange}
              type="number"
            />
          </div>
          <div className="text-base text-left flex flex-col gap-y-2">
            <p>You receive:</p>
            <div className="flex flex-row gap-x-3">
              <p className="p-2 bg-gray-100 rounded-xl py-3 px-6">
                {minUnderlyingToken[0]} {token0}
              </p>
              <p className="p-2 bg-gray-100 rounded-xl py-3 px-6">
                {minUnderlyingToken[1]} {token1}
              </p>
            </div>
            <p className="inline-flex w-full justify-between">
              <span>Estimated Gas Fees:</span>
              <span>$1234</span>
            </p>
            <p className="inline-flex w-full justify-between">
              <span>Slippage Tolerance:</span>
              <span>{SLIPPAGE}%</span>
            </p>
          </div>
        </div>
        <div className="flex flex-row gap-x-3">
          <MButton
            type="primary"
            text={
              isTokenApproved
                ? `${token0}-${token1} Approved`
                : `Approve ${token0}-${token1}`
            }
            className={clsx(
              "w-1/2",
              isTokenApproved ? `bg-[#afffaf]` : "bg-gray-200 hover:bg-gray-300"
            )}
            disabled={
              parseFloat(lpTokenAmount) <= 0 ||
              isNaN(parseFloat(lpTokenAmount)) ||
              isTokenApproved
            }
            onClick={() => {
              setIsTokenApproved(true);
            }}
          />
          <MButton
            type="secondary"
            text="Confirm"
            className="w-1/2"
            disabled={
              !isTokenApproved ||
              parseFloat(lpTokenAmount) <= 0 ||
              isNaN(parseFloat(lpTokenAmount))
            }
            onClick={() => {
              if (
                parseFloat(lpTokenAmount) <= 0 ||
                isNaN(parseFloat(lpTokenAmount))
              ) {
                console.log("token amount can't be zero");
              } else {
                console.log("router.removeLiquidity @params", {
                  address_token0: farmAsset0?.address,
                  address_token1: farmAsset1?.address,
                  lpAmount: parseFloat(lpTokenAmount),
                  minToken0Amount: minUnderlyingToken[0],
                  minToken1Amount: minUnderlyingToken[1],
                  msg_sender: address,
                  block_timestamp: Number(block?.timestamp),
                });
                // Handler of Add Liquidity
                // handleRemoveLiquidity();
              }
            }}
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default RemoveLiquidityModal;

import { useContractRead, useContractReads, useNetwork, useToken } from "wagmi";
import { FarmType, UnderlyingAssets } from "./types/common";
import { parseAbi, parseUnits } from "viem";
import { getRouterAbi } from "./abis/contract-helper-methods";
import { useMemo } from "react";
import { slippageAtom } from "@store/atoms";
import { useAtom } from "jotai";

const useCalcMinAmount = (
  tokens: UnderlyingAssets[],
  amount: number,
  farm: FarmType,
  removalId: number,
  singleTokenIndex: number,
  isEnable: boolean = false
) => {
  const { chain } = useNetwork();
  const [SLIPPAGE] = useAtom(slippageAtom);

  const { data: lpToken } = useToken({
    address: farm?.asset.address,
    enabled: !!farm && isEnable,
  });

  // console.log("ridddd", removalId);

  const functionNames = useMemo(() => {
    if (farm?.protocol.toLowerCase() == "curve") {
      return "calc_withdraw_one_coin";
    } else if (removalId === 1) {
      // SINGLE TOKEN
      return "calculateRemoveLiquidityOneToken";
    } else {
      // MULTIPLE TOKENS
      return "calculateRemoveLiquidity";
    }
  }, [removalId]);

  const argsToPass = useMemo(() => {
    if (removalId === 1) {
      // SINGLE TOKEN
      return [parseUnits(`${amount}`, 18), singleTokenIndex];
    } else {
      // MULTIPLE TOKENS
      return [parseUnits(`${amount}`, 18)];
    }
  }, [removalId, amount, singleTokenIndex]);

  const { data: minAmountData, isLoading: isLoadingMinAmount } =
    useContractRead({
      address: farm.router,
      abi: parseAbi(
        getRouterAbi(
          farm?.protocol!,
          farm?.farmType == "StandardAmm" ? false : true
        )
      ),
      functionName: functionNames,
      chainId: chain?.id,
      args: argsToPass,
      enabled: !!farm && !!lpToken && !!amount,
    });

  // console.log("rssminamtdata", minAmountData, amount, tokens);

  const minAmountBigInt = minAmountData as bigint[];

  const minAmount = useMemo(() => {
    if (!!minAmountBigInt && minAmountBigInt !== undefined) {
      if (removalId === 1) {
        return (
          ((Number(minAmountBigInt) / 10 ** tokens[singleTokenIndex].decimals) *
            (100 - SLIPPAGE)) /
          100
        );
      } else {
        return minAmountBigInt.map((amt, index) => {
          // // console.log(
          //   `${tokens[index].symbol} decimals:`,
          //   tokens[index].decimals,
          //   "\nminAmount:",
          //   Number(amt) / 10 ** tokens[index].decimals
          // );
          return (
            ((Number(amt) / 10 ** tokens[index].decimals) * (100 - SLIPPAGE)) /
            100
          );
        });
      }
    }
    return removalId == 1 ? 0 : tokens.map((token) => 0);
  }, [minAmountBigInt, amount]);

  return { minAmount, isLoadingMinAmount };
};

export default useCalcMinAmount;

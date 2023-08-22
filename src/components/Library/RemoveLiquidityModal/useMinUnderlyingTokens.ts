import { curveLpAbi, lpAbi } from "@components/Common/Layout/evmUtils";
import { ethers } from "ethers";
import { useMemo } from "react";
import { Address, parseAbi } from "viem";
import { useContractRead } from "wagmi";

/**
 *
 * @param pair - LP Pair Address
 * @param lpAmount - Amount of LP Tokens to be removed
 * @param slippage - Slippage Amount
 * @returns Minimum amount of underlying tokens to be removed
 */
export default function useMinimumUnderlyingTokens(
  pair: Address,
  protocol: string,
  lpAmount: number,
  slippage: number,
  d0: number,
  d1: number
): number[] {
  const { data: reserves } = useContractRead({
    address: pair,
    abi: parseAbi(lpAbi),
    functionName: "getReserves",
    enabled: !!pair && !!protocol && protocol !== "curve",
  });

  const totalReserves = reserves as bigint[];
  const [reserve0, reserve1] = !!totalReserves
    ? totalReserves.map((r) => r.toString())
    : ["0", "0"];

  const { data: totalSupply } = useContractRead({
    address: pair,
    abi: parseAbi(lpAbi),
    functionName: "totalSupply",
  });

  const minunderlyingtokens = useMemo(() => {
    const lpAmountAdjusted = !!lpAmount
      ? (lpAmount * (100 - slippage)) / 100
      : 0;
    // console.log(
    //   "lpAmountAdjusted",
    //   lpAmountAdjusted,
    //   parseFloat(ethers.formatUnits(reserve0, d0)),
    //   parseFloat(ethers.formatUnits(reserve1, d1)),
    //   Number(totalSupply)
    // );
    const amount0 =
      ((lpAmountAdjusted * parseFloat(ethers.formatUnits(reserve0, d0))) /
        Number(totalSupply)) *
      10 ** 18;
    const amount1 =
      ((lpAmountAdjusted * parseFloat(ethers.formatUnits(reserve1, d1))) /
        Number(totalSupply)) *
      10 ** 18;

    // console.log("minunderlyingtokens:\namount0", amount0, "\namount1", amount1);
    return [amount0, amount1];
  }, [lpAmount]);

  return minunderlyingtokens;
}

import { lpAbi } from "@components/Common/Layout/evmUtils";
import { parseAbi } from "viem";
import { useContractRead } from "wagmi";

/**
 *
 * @param pair - LP Pair Address
 * @param lpAmount - Amount of LP Tokens to be removed
 * @param slippage - Slippage Amount
 * @returns Minimum amount of underlying tokens to be removed
 */
export default function useMinimumUnderlyingTokens(
  pair: `0x${string}`,
  lpAmount: number,
  slippage: number
) {
  const { data: reserves } = useContractRead({
    address: pair,
    abi: parseAbi(lpAbi),
    functionName: "getReserves",
    enabled: !!pair,
  });
  const totalReserves = reserves as bigint[];
  const [reserve0, reserve1] = !!totalReserves
    ? totalReserves.map((r) => Number(r))
    : [0, 0];

  const { data: totalSupply } = useContractRead({
    address: pair,
    abi: parseAbi(lpAbi),
    functionName: "totalSupply",
  });

  const lpAmountAdjusted = !!lpAmount ? (lpAmount * (100 - slippage)) / 100 : 0;
  const amount0 = (lpAmountAdjusted * reserve0) / Number(totalSupply);
  const amount1 = (lpAmountAdjusted * reserve1) / Number(totalSupply);

  console.log("amount0", amount0, "\namount1", amount1);
  return [amount0, amount1];
}

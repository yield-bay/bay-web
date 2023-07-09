import { useMemo } from "react";
import { parseAbi } from "viem";
import { useToken, useContractRead } from "wagmi";
import { lpAbi } from "@components/Common/Layout/evmUtils";

const useMinimumLPTokens = (
  pair: `0x${string}`,
  slippage: number,
  reserve0: number,
  reserve1: number,
  amount0: number,
  amount1: number
) => {
  /**
   * LP Tokens received ->
   * Minimum of the following -
   *  1. (amount0 * totalSupply) / reserve0
   *  2. (amount1 * totalSupply) / reserve1
   */
  const { data: totalSupply } = useContractRead({
    address: pair,
    abi: parseAbi(lpAbi),
    functionName: "totalSupply",
    enabled: !!pair,
  });

  const { data: tokenInfo } = useToken({
    address: pair,
    enabled: !!pair,
  });

  const minLpToken = useMemo(() => {
    if (!totalSupply || !tokenInfo) return BigInt(0);

    const _totalSupply =
      BigInt(Number(totalSupply)) * BigInt(10 ** tokenInfo?.decimals!);

    const value0 =
      (BigInt(amount0) * _totalSupply) / (BigInt(reserve0) * BigInt(10 ** 18));
    const value1 =
      (BigInt(amount1) * _totalSupply) / (BigInt(reserve1) * BigInt(10 ** 18));

    const minLP = value0 < value1 ? value0 : value1;

    // `slippage` should be a number between 0 & 100.
    return (minLP * BigInt(Math.floor(100 - slippage))) / BigInt(100);
  }, [totalSupply, tokenInfo, reserve0, reserve1, amount0, amount1, slippage]);

  return Number(minLpToken);
};

export default useMinimumLPTokens;

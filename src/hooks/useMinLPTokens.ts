import { useMemo } from "react";
import { Address, parseAbi } from "viem";
import { useContractRead } from "wagmi";
import { lpAbi } from "@components/Common/Layout/evmUtils";
import { ethers } from "ethers";

const useMinimumLPTokens = (
  pair: Address,
  slippage: number,
  reserve0: string,
  reserve1: string,
  amount0: number,
  amount1: number,
  d0: number,
  d1: number
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

  const minLpToken = useMemo(() => {
    if (!totalSupply) return BigInt(0);
    const r0 = ethers.formatUnits(reserve0, d0);
    const r1 = ethers.formatUnits(reserve1, d1);
    // console.log("d0", ethers.parseUnits(r0, d0));
    // console.log("d1", ethers.parseUnits(r1, d1));
    // console.log(
    //   "totalsupply lp:",
    //   Number(totalSupply),
    //   "\namount0:",
    //   amount0,
    //   "\namount1:",
    //   amount1,
    //   "\nreserve0:",
    //   reserve0,
    //   r0,
    //   "\nreserve1:",
    //   reserve1,
    //   r1,
    //   "\ndecimals:",
    //   d0,
    //   d1,
    //   "\nbigtt",
    //   (amount0 * Number(totalSupply)) / parseFloat(r0),
    //   (amount1 * Number(totalSupply)) / parseFloat(r1)
    // );

    const _totalSupply = BigInt(Number(totalSupply));

    // const value0 = (BigInt(amount0) * _totalSupply) / BigInt(reserve0);
    // const value1 = (BigInt(amount1) * _totalSupply) / BigInt(reserve1);
    const value0 = (amount0 * Number(totalSupply)) / parseFloat(r0);
    const value1 = (amount1 * Number(totalSupply)) / parseFloat(r1);

    const minLP = value0 < value1 ? value0 : value1;
    // console.log("minLPhere", minLP, value0, value1);

    // `slippage` should be a number between 0 & 100.
    return (minLP * (100 - slippage)) / 100;
  }, [totalSupply, reserve0, reserve1, amount0, amount1, slippage]);

  return {
    minLpTokens: Number(minLpToken),
    totalSupply: Number(totalSupply), // / 10 ** 18,
  };
};

export default useMinimumLPTokens;

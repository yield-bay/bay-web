/**
 *
 * @param pair - Pair Contract
 * @param lpAmount - Amount of LP Tokens to be removed
 * @param slippage - Slippage Amount
 * @returns Minimum amount of underlying tokens to be removed
 */
export default function useMinimumUnderlyingTokens() {
  // pair,
  // lpAmount,
  // slippage
  // const { reserve0, reserve1 } = await pair.getReserves();
  // const totalSupply = await pair.totalSupply();
  // const lpAmountAdjusted = (lpAmount * (100 - slippage)) / 100;
  // amount0 = (lpAmountAdjusted * reserve0) / totalSupply;
  // amount1 = (lpAmountAdjusted * reserve1) / totalSupply;
  // return amount0, amount1;
  return [10, 12]; // hardcoded deafult returning value 10 and 12
}

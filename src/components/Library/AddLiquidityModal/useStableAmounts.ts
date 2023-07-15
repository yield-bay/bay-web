import { UnderlyingAssets } from "@utils/types";
import { useMemo } from "react";
import { parseUnits } from "viem";

const useStableAmounts = (
  inputMapAmount: { [address: `0x${string}`]: number },
  tokens: UnderlyingAssets[]
) => {
  console.log("inputMap", inputMapAmount);

  const updatedTokens = useMemo(() => {
    const newtokens = tokens
      .map((token) => {
        // console.log("waota", token);
        const inputAmount = !isNaN(inputMapAmount[token.address])
          ? inputMapAmount[token.address]
          : 0;
        return parseUnits(`${inputAmount}`, token.decimals);
      })
      .filter((amount) => {
        return !isNaN(Number(amount));
      });
    return newtokens;
  }, [inputMapAmount]);
  console.log("updated tokens", updatedTokens);
  return updatedTokens;
};

export default useStableAmounts;

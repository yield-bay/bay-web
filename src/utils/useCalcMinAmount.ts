import { useContractRead, useContractReads, useNetwork, useToken } from "wagmi";
import { FarmType } from "./types";
import { parseAbi, parseUnits } from "viem";
import { getRouterAbi } from "./abis/contract-helper-methods";
import { useMemo } from "react";

const useCalcMinAmount = (amount: number, farm: FarmType) => {
  const { chain } = useNetwork();

  const { data: lpToken } = useToken({
    address: farm?.asset.address,
    enabled: !!farm,
  });

  const { data: tokensArr } = useContractRead({
    address:
      farm?.protocol.toLowerCase() == "curve"
        ? farm?.asset.address
        : farm?.router,
    abi: parseAbi(
      getRouterAbi(
        farm?.protocol!,
        farm?.farmType == "StandardAmm" ? false : true
      )
    ),
    functionName:
      farm?.protocol.toLowerCase() == "curve"
        ? "get_balances" // todo: change
        : "getTokens",
    chainId: chain?.id,
    enabled: !!chain && !!farm,
  });

  const { data: minAmountData, isLoading: isLoadingMinAmount } =
    useContractRead({
      address:
        farm?.protocol.toLowerCase() == "curve"
          ? farm?.asset.address
          : farm?.router,
      abi: parseAbi(
        getRouterAbi(
          farm?.protocol!,
          farm?.farmType == "StandardAmm" ? false : true
        )
      ),
      functionName:
        farm?.protocol.toLowerCase() == "curve"
          ? "get_balances"
          : "calculateRemoveLiquidity",
      chainId: chain?.id,
      args: [
        parseUnits(`${amount}`, lpToken?.decimals!), // Amount to be removed
      ],
      enabled: !!farm && !!lpToken && !!amount,
    });

  const minAmountBigInt = minAmountData as bigint[];
  const tokens = tokensArr as `0x${string}`[];

  const minAmount = useMemo(() => {
    if (!!minAmountBigInt) {
      console.log("minamountbigint", minAmountBigInt);
      console.log("tokens", tokens);
      return minAmountBigInt.map((amt, index) => {
        // there will always be only one token in array
        const currToken = farm?.asset.underlyingAssets.filter(
          (asset) => tokens[index] == asset.address
        );
        console.log(
          `${currToken[0].symbol} decimals:`,
          currToken[0].decimals,
          "\nminAmount:",
          Number(amt) / 10 ** currToken[0].decimals
        );
        return Number(amt) / 10 ** currToken[0].decimals;
      });
    }
    return [0, 0];
  }, [minAmountBigInt, amount]);

  return { minAmount, isLoadingMinAmount };
};

export default useCalcMinAmount;

import { Address, parseAbi } from "viem";
import { useContractRead } from "wagmi";
import { getRouterAbi } from "@utils/abis/contract-helper-methods";

const useMinLPTokensStable = (
  router: Address,
  protocol: string,
  amounts: bigint[],
  isEnable: boolean = false
) => {
  const { data: lpAmount } = useContractRead({
    address: router,
    abi: parseAbi(getRouterAbi(protocol, true)),
    functionName:
      protocol == "curve" ? "calc_token_amount" : "calculateTokenAmount",
    enabled: !!router && !!protocol && isEnable,
    args: [amounts, 1],
  });
  return Number(lpAmount) / 10 ** 18;
};

export default useMinLPTokensStable;

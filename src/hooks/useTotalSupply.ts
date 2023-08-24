import { curveLpAbi, lpAbi } from "@components/Common/Layout/evmUtils";
import { Address, parseAbi } from "viem";
import { useContractRead } from "wagmi";

const useTotalSupply = (
  pair: Address,
  protocol: string,
  isEnable: boolean = false
) => {
  const { data: totalSupply } = useContractRead({
    address: pair,
    abi: parseAbi(protocol.toLowerCase() === "curve" ? curveLpAbi : lpAbi),
    functionName: "totalSupply",
    enabled: !!pair && !!protocol && isEnable,
  });
  return Number(totalSupply) / 10 ** 18;
};

export default useTotalSupply;

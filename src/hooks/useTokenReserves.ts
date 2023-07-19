import { curveLpAbi, lpAbi } from "@components/Common/Layout/evmUtils";
import { Address, parseAbi } from "viem";
import { useContractRead } from "wagmi";

const useTokenReserves = (pair: Address, protocol: string) => {
  const { data: reserves } = useContractRead({
    address: pair,
    abi: parseAbi(protocol.toLowerCase() == "curve" ? curveLpAbi : lpAbi),
    functionName:
      protocol.toLowerCase() == "curve" ? "get_balances" : "getReserves",
    enabled: !!pair && !!protocol,
  });
  const totalReserves = reserves as bigint[];
  const [reserve0, reserve1] = !!totalReserves
    ? totalReserves.map((r) => r.toString())
    : ["0", "0"];
  return { reserve0, reserve1 };
};

export default useTokenReserves;

import { curveLpAbi, lpAbi } from "@components/Common/Layout/evmUtils";
import { parseAbi } from "viem";
import { useContractRead } from "wagmi";

const useTokenReserves = (pair: `0x${string}`, protocol: string) => {
  const { data: reserves } = useContractRead({
    address: pair,
    abi: parseAbi(protocol.toLowerCase() == "curve" ? curveLpAbi : lpAbi),
    functionName:
      protocol.toLowerCase() == "curve" ? "get_balances" : "getReserves",
    enabled: !!pair && !!protocol,
  });
  const totalReserves = reserves as bigint[];
  const [reserve0, reserve1] = !!totalReserves
    ? totalReserves.map((r) => Number(r))
    : [0, 0];
  return { reserve0, reserve1 };
};

export default useTokenReserves;

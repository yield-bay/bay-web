import {
  curveLpAbi,
  lpAbi,
  siriusRouterAbi,
} from "@components/Common/Layout/evmUtils";
import { Address, parseAbi } from "viem";
import { useContractRead } from "wagmi";

const useTokenReserves = (
  pair: Address,
  protocol: string,
  router: Address,
  isEnable: boolean = false
) => {
  const { data: d } = useContractRead({
    address: protocol.toLowerCase() == "sirius" ? router : pair,
    abi: parseAbi(
      protocol.toLowerCase() == "curve"
        ? curveLpAbi
        : protocol.toLowerCase() == "sirius"
        ? siriusRouterAbi
        : lpAbi
    ),
    functionName:
      protocol.toLowerCase() == "curve"
        ? "get_balances"
        : protocol.toLowerCase() == "sirius"
        ? "getTokenBalance"
        : "getReserves",
    args: protocol.toLowerCase() == "sirius" ? [0] : [],
    enabled: !!protocol && isEnable,
  });
  const { data: bal1 } = useContractRead({
    address: router,
    abi: siriusRouterAbi,
    functionName: "getTokenBalance",
    args: [1],
    enabled: !!protocol && !!router && protocol.toLowerCase() == "sirius",
  });
  if (protocol.toLowerCase() == "sirius") {
    return { reserve0: d as string, reserve1: bal1 as string };
  } else {
    const totalReserves = d as bigint[];
    const [reserve0, reserve1] = !!totalReserves
      ? totalReserves.map((r) => r.toString())
      : ["0", "0"];
    return { reserve0, reserve1 };
  }
};

export default useTokenReserves;

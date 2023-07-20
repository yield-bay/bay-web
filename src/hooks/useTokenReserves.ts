import {
  curveLpAbi,
  lpAbi,
  siriusRouterAbi,
} from "@components/Common/Layout/evmUtils";
import { Address, parseAbi } from "viem";
import { useContractRead } from "wagmi";

const useTokenReserves = (pair: Address, protocol: string, router: Address) => {
  // if (protocol.toLowerCase() == "sirius") {
  //   // "function getTokenBalance(uint8 index) view returns (uint256)",
  //   // eslint-disable-next-line react-hooks/rules-of-hooks
  //   const { data: bal0 } = useContractRead({
  //     address: router,
  //     abi: parseAbi(siriusRouterAbi),
  //     functionName: "getTokenBalance",
  //     args: [0],
  //     enabled: !!protocol && !!router,
  //   });
  //   // eslint-disable-next-line react-hooks/rules-of-hooks
  //   const { data: bal1 } = useContractRead({
  //     address: router,
  //     abi: parseAbi(siriusRouterAbi),
  //     functionName: "getTokenBalance",
  //     args: [1],
  //     enabled: !!protocol && !!router,
  //   });
  //   console.log("sirbal", bal0, bal1, router, protocol);
  //   // return {
  //   //   reserve0: (bal0 as bigint).toString(),
  //   //   reserve1: (bal1 as bigint).toString(),
  //   // };
  //   return { reserve0: "0", reserve1: "0" };
  // } else {
  // eslint-disable-next-line react-hooks/rules-of-hooks
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
  // }
};

export default useTokenReserves;

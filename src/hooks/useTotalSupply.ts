import { curveLpAbi, lpAbi } from "@components/Common/Layout/evmUtils";
import { parseAbi } from "viem";
import { useContractRead } from "wagmi";

const useTotalSupply = (pair: `0x${string}`, protocol: string) => {
  const { data: totalSupply } = useContractRead({
    address: pair,
    abi: parseAbi(protocol.toLowerCase() === "curve" ? curveLpAbi : lpAbi),
    functionName: "totalSupply",
    enabled: !!pair && !!protocol,
  });
  console.log("totalsupply @hook", Number(totalSupply) / 10 ** 18);
  return Number(totalSupply) / 10 ** 18;
};

export default useTotalSupply;

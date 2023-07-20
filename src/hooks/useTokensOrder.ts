import {
  curveLpAbi,
  lpAbi,
  siriusRouterAbi,
} from "@components/Common/Layout/evmUtils";
import { getRouterAbi } from "@utils/abis/contract-helper-methods";
import { FarmType, UnderlyingAssets } from "@utils/types";
import { Address, parseAbi } from "viem";
import { useContractRead, useNetwork } from "wagmi";

export default function useTokensOrder(farm: FarmType) {
  const { chain } = useNetwork();

  if (farm?.protocol == "arthswap") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: tokensSeqArr } = useContractRead({
      address: farm?.asset.address,
      abi: parseAbi(lpAbi),
      functionName: "token0",
      chainId: chain?.id,
      enabled: !!chain && !!farm,
    });
    console.log("arthswaptokensSeqArr", tokensSeqArr);
    const tokensSeq: UnderlyingAssets[] = [
      tokensSeqArr,
      tokensSeqArr,
    ] as UnderlyingAssets[]; // as Address[];
    // const tokensSeq = tokensSeqArr as Address[];
    return tokensSeq;
  } else {
    return farm?.asset.underlyingAssets ?? new Array<UnderlyingAssets>();
    // return farm?.asset.underlyingAssets.map(
    //   (ua: UnderlyingAssets) => ua.address
    // );
  }
}

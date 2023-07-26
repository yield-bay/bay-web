import { lpAbi } from "@components/Common/Layout/evmUtils";
import { FarmType, UnderlyingAssets } from "@utils/types/common";
import { parseAbi } from "viem";
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
  }
}

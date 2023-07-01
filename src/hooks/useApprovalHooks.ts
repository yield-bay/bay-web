import { parseAbi } from "viem";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
} from "wagmi";
import { tokenAbi } from "@components/Common/Layout/evmUtils";
import { UnderlyingAssets } from "@utils/types";

const useIsApprovedToken = (token: UnderlyingAssets, router: `0x${string}`) => {
  const { address } = useAccount();
  const { data, isLoading, isError, isSuccess } = useContractRead({
    address: token?.address,
    abi: parseAbi(tokenAbi),
    functionName: "allowance" as any,
    args: [
      address, // owner
      router, // spender
    ],
    enabled: !!address && !!router,
  });
  return { data, isLoading, isError, isSuccess };
};

const useApproveToken = (token: UnderlyingAssets, router: `0x${string}`) => {
  const { chain } = useNetwork();
  const { data, isLoading, isError, isSuccess, writeAsync } = useContractWrite({
    address: token?.address,
    abi: parseAbi(tokenAbi),
    functionName: "approve" as any,
    chainId: chain?.id,
    args: [
      router,
      BigInt(
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
    onError: (error) => {
      console.log(`Approve Error in ${token?.symbol}`, error);
    },
  });
  return { data, isLoading, isError, isSuccess, writeAsync };
};

export { useIsApprovedToken, useApproveToken };

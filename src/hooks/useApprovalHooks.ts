import { parseAbi } from "viem";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  useWaitForTransaction,
} from "wagmi";
import { tokenAbi } from "@components/Common/Layout/evmUtils";
import { UnderlyingAssets } from "@utils/types";

/**
 *
 * @param token Underlying Asset
 * @param router Router Contract Address
 * @returns data, isLoading, isError, isSuccess
 */
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

/**
 *
 * @param token Underlying Asset
 * @param router Router Contract Address
 * @returns data, isLoading, isError, isSuccess, writeAsync
 */
const useApproveToken = (token: UnderlyingAssets, router: `0x${string}`) => {
  const { chain } = useNetwork();
  const {
    data,
    isLoading: isLoadingApproveCall,
    isError,
    isSuccess: isSuccessApproveCall,
    writeAsync,
  } = useContractWrite({
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

  // Waiting for Txns
  const { isLoading: isLoadingApproveTxn, isSuccess: isSuccessApproveTxn } =
    useWaitForTransaction({
      hash: data?.hash,
    });

  return {
    data,
    isLoadingApproveCall,
    isLoadingApproveTxn,
    isError,
    isSuccessApproveCall,
    isSuccessApproveTxn,
    writeAsync,
  };
};

export { useIsApprovedToken, useApproveToken };

import { Address, parseAbi } from "viem";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  useWaitForTransaction,
} from "wagmi";
import { tokenAbi } from "@components/Common/Layout/evmUtils";
import { useMemo } from "react";

/**
 *
 * @param token Underlying Asset
 * @param spender spender Contract Address
 * @returns data, isLoading, isError, isSuccess
 */
const useIsApprovedToken = (tokenAddress: Address, spender: Address) => {
  const { address } = useAccount();
  const { data, isLoading, isError } = useContractRead({
    address: tokenAddress,
    abi: parseAbi(tokenAbi),
    functionName: "allowance" as any,
    args: [
      address, // owner
      spender, // spender
    ],
    enabled: !!address && !!spender,
  });

  const isSuccess = useMemo(() => {
    return (
      Number(data) ==
      115792089237316195423570985008687907853269984665640564039457584007913129639935
    );
  }, [data]);

  return { data, isLoading, isError, isSuccess };
};

/**
 *
 * @param token Underlying Asset
 * @param spender spender Contract Address
 * @returns data, isLoading, isError, isSuccess, writeAsync
 */
const useApproveToken = (tokenAddress: Address, spender: Address) => {
  const { chain } = useNetwork();
  const {
    data,
    isLoading: isLoadingApproveCall,
    isError,
    isSuccess: isSuccessApproveCall,
    writeAsync,
  } = useContractWrite({
    address: tokenAddress,
    abi: parseAbi(tokenAbi),
    functionName: "approve" as any,
    chainId: chain?.id,
    args: [
      spender, // spender
      BigInt(
        // value
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
      ),
    ],
    onError: (error) => {
      console.log(`Error while Approving:`, error);
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

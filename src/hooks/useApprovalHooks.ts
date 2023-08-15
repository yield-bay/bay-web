import { Address, parseAbi } from "viem";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  useWaitForTransaction,
} from "wagmi";
import { tokenAbi } from "@components/Common/Layout/evmUtils";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";

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
    console.log(
      "appdata",
      tokenAddress,
      data,
      Number(data) ==
        parseInt(
          (
            BigInt(
              2 **
                (tokenAddress == "0xFFFFFFfFea09FB06d082fd1275CD48b191cbCD1d" ||
                tokenAddress == "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080"
                  ? 128
                  : tokenAddress == "0x511aB53F793683763E5a8829738301368a2411E3"
                  ? 96
                  : 256)
            ) - BigInt(1)
          ).toString()
        )
    );
    return (
      Number(data) ==
      parseInt(
        (
          BigInt(
            2 **
              (tokenAddress == "0xFFFFFFfFea09FB06d082fd1275CD48b191cbCD1d" ||
              tokenAddress == "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080"
                ? 128
                : tokenAddress == "0x511aB53F793683763E5a8829738301368a2411E3"
                ? 96
                : 256)
          ) - BigInt(1)
        ).toString()
      )
    );
  }, [data]);

  return { data, isLoading, isError, isSuccess };
};

/**
 *
 * @param token Underlying Asset
 * @param spender spender Contract Address
 * @returns data, isLoadingApproveCall, isLoadingApproveTxn, isError, isSuccessApproveCall, isSuccessApproveTxn, writeAsync
 */
const useApproveToken = (
  tokenAddress: Address,
  spender: Address,
  tokenSymbol: string
) => {
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
      (
        BigInt(
          2 **
            (tokenAddress == "0xFFFFFFfFea09FB06d082fd1275CD48b191cbCD1d" ||
            tokenAddress == "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080"
              ? 128
              : tokenAddress == "0x511aB53F793683763E5a8829738301368a2411E3"
              ? 96
              : 256)
        ) - BigInt(1)
      ).toString(),
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

  useEffect(() => {
    if (isSuccessApproveTxn) {
      toast(`${tokenSymbol} Approved!`);
    }
  }, [isSuccessApproveTxn]);

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

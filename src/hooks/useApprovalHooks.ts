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
const useIsApprovedToken = (
  tokenAddress: Address,
  spender: Address,
  tokenBalance: string | undefined
) => {
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
      Number(data),
      !tokenBalance ? false : Number(data) >= parseInt(tokenBalance)
      // Number(data) ==
      //   parseInt(
      //     (
      //       BigInt(
      //         2 **
      //           (tokenAddress == "0xFFFFFFfFea09FB06d082fd1275CD48b191cbCD1d" ||
      //           tokenAddress == "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080"
      //             ? 128
      //             : tokenAddress == "0x511aB53F793683763E5a8829738301368a2411E3"
      //             ? 96
      //             : 256)
      //       ) - BigInt(1)
      //     ).toString()
      //   )
    );
    // allowed tokens >= token balance
    if (!tokenBalance) return false; // if balance not fetched yet show false
    return Number(data) >= parseInt(tokenBalance);

    // Allowed tokens are equal to MaxInt
    // return (
    //   Number(data) ==
    //   parseInt(
    //     (
    //       BigInt(
    //         2 **
    //           (tokenAddress == "0xFFFFFFfFea09FB06d082fd1275CD48b191cbCD1d" ||
    //           tokenAddress == "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080"
    //             ? 128
    //             : tokenAddress == "0x511aB53F793683763E5a8829738301368a2411E3"
    //             ? 96
    //             : 256)
    //       ) - BigInt(1)
    //     ).toString()
    //   )
    // );
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
  tokenSymbol: string,
  tokenBalance: string | undefined
) => {
  const { chain } = useNetwork();
  console.log("token", tokenSymbol, "\ntokenBalance", tokenBalance);
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
      tokenBalance,
      // (
      //   BigInt(
      //     2 **
      //       (tokenAddress == "0xFFFFFFfFea09FB06d082fd1275CD48b191cbCD1d" ||
      //       tokenAddress == "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080"
      //         ? 128
      //         : tokenAddress == "0x511aB53F793683763E5a8829738301368a2411E3"
      //         ? 96
      //         : 256)
      //   ) - BigInt(1)
      // ).toString(),
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

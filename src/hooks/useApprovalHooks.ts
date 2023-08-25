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
import BigNumber from "bignumber.js";

// Define known structure for tokenBalance (Modify as needed)
interface TokenBalance {
  decimals: number;
  formatted: string;
  symbol: string;
  value: bigint;
}

/**
 * Check if a token is approved.
 *
 * @param tokenAddress Address of the token
 * @param spender Contract address of the spender
 * @param tokenBalance Balance of the token
 * @param input Input value
 * @returns Object containing data, isLoading, isError, and isSuccess
 */
const useIsApprovedToken = (
  tokenAddress: Address,
  spender: Address,
  tokenBalance: TokenBalance | undefined,
  input: number,
  isEnable: boolean = false
) => {
  const { address } = useAccount();

  const { data, isLoading, isError } = useContractRead({
    address: tokenAddress,
    abi: parseAbi(tokenAbi),
    functionName: "allowance",
    args: [address, spender], // owner, spender
    enabled: !!address && !!spender && isEnable,
  });

  const allowanceRaw = data as bigint;

  const allowance = BigNumber(allowanceRaw?.toString() ?? "0").decimalPlaces(
    0,
    1
  );
  // console.log("allowance bigint", allowance);
  console.log("allowance", allowanceRaw);
  console.log("address", address);
  console.log("spender", spender);
  console.log("tokenBalance", tokenBalance);
  console.log("input", input);
  console.log("tokenAddress", tokenAddress);
  console.log("isEnable", isEnable);

  const inputAmount = useMemo(() => {
    if (tokenBalance?.decimals && input) {
      return BigNumber(input.toString())
        .multipliedBy(BigNumber(10).pow(tokenBalance.decimals))
        .decimalPlaces(0, 1);
    }
    return BigNumber(0);
  }, [tokenBalance, input]);

  // console.log("input", input);

  const compare =
    input == undefined || input == 0
      ? false
      : inputAmount.isLessThanOrEqualTo(allowance);
  // console.log("compare", compare);
  // const isSuccess = useMemo(() => {
  //   // return !tokenBalance
  //   //   ? false
  //   //   : numdata >= formatData(parseFloat(tokenBalance));
  //   return compare;
  return { data, isLoading, isError, isSuccess: compare };
};

/**
 * Approve a token.
 *
 * @param tokenAddress Address of the token
 * @param spender Contract address of the spender
 * @param tokenSymbol Symbol of the token
 * @param tokenBalance Balance of the token
 * @returns Object containing various states and the writeAsync function
 */
const useApproveToken = (
  tokenAddress: Address,
  spender: Address,
  tokenSymbol: string,
  tokenBalance: TokenBalance | undefined
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
      spender,
      BigNumber(tokenBalance?.formatted ?? "0")
        .multipliedBy(BigNumber(10).pow(tokenBalance?.decimals ?? 0))
        .decimalPlaces(0, 1)
        .toString(),
    ],
    onError: (error) => {
      // This is just logging the error. Depending on your needs, you might want to show this to the user or take corrective action.
      console.error(`Error while Approving:`, error);
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
      // console.log(
      //   `${tokenSymbol} Approved by ${tokenBalance?.formatted} Amount`
      // );
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

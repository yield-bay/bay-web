import { Address, parseAbi } from "viem";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  useWaitForTransaction,
} from "wagmi";
import { tokenAbi } from "@components/Common/Layout/evmUtils";
import { useEffect } from "react";
import toast from "react-hot-toast";
import BigNumber from "bignumber.js";

/**
 *
 * @param token Underlying Asset
 * @param spender spender Contract Address
 * @returns data, isLoading, isError, isSuccess
 */
const useIsApprovedToken = (
  tokenAddress: Address,
  spender: Address,
  tokenBalance: any | undefined,
  input: number
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

  const allow = data as bigint;

  const allowance = BigNumber(allow?.toString() ?? "0", 10)
    // .multipliedBy(BigNumber(10).pow(tokenBalance?.decimals))
    .decimalPlaces(0, 1);
  // console.log("allowance bigint", allow);
  console.log("allowance", allowance.toString());

  console.log("rawinput", input);
  console.log("tokenbalance", tokenBalance);

  const inputAmount = BigNumber(input.toString(), 10)
    .multipliedBy(BigNumber(10).pow(tokenBalance?.decimals))
    .decimalPlaces(0, 1);
  console.log("inputAmount", inputAmount.toString());

  const compare = inputAmount.isLessThanOrEqualTo(allowance);
  console.log("compare", compare);

  // const isSuccess = useMemo(() => {
  //   const numdata = Number(data) / 10 ** 12;
  //   // console.log(
  //   //   "token_address",
  //   //   tokenAddress,
  //   //   "\ndata",
  //   //   data,
  //   //   "\nnumber_data",
  //   //   numdata,
  //   //   "\ntokenBalance",
  //   //   parseFloat(tokenBalance ?? "0"),
  //   //   "\nisApproved: should be true if data >= tokenBalance"
  //   //   // !tokenBalance ? false : numdata >= formatData(parseFloat(tokenBalance))
  //   //   // !input ? false : numdata >= formatData(parseFloat(tokenBalance))
  //   // );

  //   // allowed tokens >= token balance
  //   // return !tokenBalance
  //   //   ? false
  //   //   : numdata >= formatData(parseFloat(tokenBalance));
  //   return compare;
  return { data, isLoading, isError, isSuccess: compare };
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
  tokenBalance: any | undefined
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
      BigNumber(tokenBalance?.formatted, 10)
        .multipliedBy(BigNumber(10).pow(tokenBalance?.decimals))
        .decimalPlaces(0, 1)
        .toString(),
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

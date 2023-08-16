import { useState } from "react";
import { usePublicClient } from "wagmi";
import { Address, PublicClient, parseAbi } from "viem";
import { getChefAbi, getRouterAbi } from "@utils/abis/contract-helper-methods";
import { FarmType, PortfolioPositionType } from "@utils/types/common";

const estimateGas = async (
  publicClient: PublicClient,
  address: Address,
  contractType: number, // 0: chef, 1: router, 2: lp
  functionType: number, // 0: addliq, 1: removeliq, 2: stake, 3: unstake, 4: claimrewards
  functionName: string,
  farmition: FarmType | PortfolioPositionType,
  account: Address,
  args: Array<any>
) => {
  console.log(
    "estimateGas @params",
    address,
    contractType,
    functionType,
    functionName,
    farmition,
    account,
    args,
    contractType == 0
      ? parseAbi(getChefAbi(farmition?.protocol!, farmition?.chef))
      : parseAbi(
          getRouterAbi(
            farmition?.protocol!,
            farmition?.farmType == "StandardAmm" ? false : true
          )
        )
  );

  let gasEstimate = BigInt(0);
  try {
    gasEstimate = await publicClient.estimateContractGas({
      address,
      abi:
        contractType == 0
          ? parseAbi(getChefAbi(farmition.protocol!, farmition.chef))
          : parseAbi(
              getRouterAbi(
                farmition.protocol!,
                farmition.farmType == "StandardAmm" ? false : true
              )
            ),
      functionName,
      args: args,
      account,
    });
  } catch (error) {
    console.log("estimateContractGas error:", error);
  }
  console.log("gas estimate", gasEstimate);
  return gasEstimate;
};

const getGasPrice = async (publicClient: PublicClient): Promise<bigint> => {
  return await publicClient.getGasPrice();
};

const useGasEstimation = (
  address: Address,
  contractType: number, // 0: chef, 1: router, 2: lp
  functionType: number, // 0: addliq, 1: removeliq, 2: stake, 3: unstake, 4: claimrewards
  functionName: string,
  farmition: FarmType | PortfolioPositionType,
  account: Address,
  args: Array<any>
): {
  gasEstimate: number;
  // isLoading: boolean;
  isError: boolean;
} => {
  // const { chain } = useNetwork();
  // const publicClient = usePublicClient({ chainId: 1284 });
  const publicClient = usePublicClient();
  // const publicClient = createPublicClient({
  //   chain: moonbeam,
  //   transport: http(),
  // });
  const [gasEstimateAmount, setGasEstimateAmount] = useState<number>(0);
  const [gasPrice, setGasPrice] = useState<number>(0);
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  // if any arg is 0
  if (
    args.some(
      (a) =>
        (a == 0 || a == BigInt(0)) &&
        functionName != "removeLiquidityOneToken" &&
        functionName != "remove_liquidity_one_coin"
    )
  ) {
    console.log("arg0");
    return {
      gasEstimate: 0,
      // isLoading: false,
      isError: false,
    };
  } else if (
    farmition.farmType == "StableAmm" &&
    functionType == 0 && // addliquidity
    args[0].every((a: any) => a == 0 || a == BigInt(0)) // at least 1 amounts arg should be non zero
  ) {
    // if (functionType == 0 &&
    //   args.every((a) => a == 0)) {
    console.log("arg0");
    return {
      gasEstimate: 0,
      // isLoading: false,
      isError: false,
    };
    // } else {
  } else {
    try {
      estimateGas(
        publicClient,
        address,
        contractType,
        functionType,
        functionName,
        farmition,
        account,
        args
      ).then((res) => {
        setGasEstimateAmount(Number(res));
      });
    } catch (error) {
      setIsError(true);
      setGasEstimateAmount(0);
      console.log("Error: Estimating Gas", error);
    }
    // const eg = estimateGas()

    try {
      getGasPrice(publicClient).then((res) => {
        setGasPrice(Number(res));
      });
    } catch (error) {
      setGasPrice(0);
      setIsError(true);
      console.log("Error: Getting Gas Price", error);
    }

    console.log(
      "gasEstimateAmount",
      gasEstimateAmount,
      "gasPrice",
      gasPrice,
      "gas",
      (gasEstimateAmount * gasPrice) / 10 ** 18
    );
    return {
      gasEstimate: (gasEstimateAmount * gasPrice) / 10 ** 18,
      // isLoading,
      isError,
    };
  }
};

export default useGasEstimation;

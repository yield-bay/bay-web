import { useState } from "react";
import { usePublicClient } from "wagmi";
import { Address, PublicClient, parseAbi } from "viem";
import { getChefAbi, getRouterAbi } from "@utils/abis/contract-helper-methods";
import { FarmType, PortfolioPositionType } from "@utils/types/common";

const determineAbi = (
  contractType: number,
  farmition: FarmType | PortfolioPositionType
) => {
  if (contractType === 0) {
    return parseAbi(getChefAbi(farmition.protocol!, farmition.chef));
  } else {
    return parseAbi(
      getRouterAbi(farmition.protocol!, farmition.farmType !== "StandardAmm")
    );
  }
};

const estimateGas = async (
  publicClient: PublicClient,
  address: Address,
  contractType: number, // 0: chef, 1: router, 2: lp
  // functionType: number, // 0: addliq, 1: removeliq, 2: stake, 3: unstake, 4: claimrewards
  functionName: string,
  farmition: FarmType | PortfolioPositionType,
  account: Address,
  args: Array<any>
) => {
  const abi = determineAbi(contractType, farmition);
  // console.log("Estimating gas with parameters:");
  // console.log("Address:", address);
  // console.log("ABI:", abi);
  // console.log("Function Name:", functionName);
  // console.log("Arguments:", args);
  // console.log("Account:", account);

  try {
    return await publicClient.estimateContractGas({
      address,
      abi,
      functionName,
      args,
      account,
    });
  } catch (error) {
    console.error("Error estimating gas:", error);
    return BigInt(0);
  }
};

const getGasPrice = async (publicClient: PublicClient): Promise<bigint> => {
  try {
    return await publicClient.getGasPrice();
  } catch (error) {
    console.error("Error getting gas price:", error);
    return BigInt(0);
  }
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
  const publicClient = usePublicClient();
  const [gasEstimateAmount, setGasEstimateAmount] = useState(0);
  const [gasPrice, setGasPrice] = useState(0);
  const [isError, setIsError] = useState(false);

  const invalidArgs = args.some(
    (a) =>
      (a === 0 || a === BigInt(0)) &&
      !["removeLiquidityOneToken", "remove_liquidity_one_coin"].includes(
        functionName
      )
  );

  const invalidStableAmmArgs =
    farmition.farmType === "StableAmm" &&
    functionType === 0 &&
    args[0].every((a: any) => a === 0 || a === BigInt(0));

  if (invalidArgs || invalidStableAmmArgs) {
    return {
      gasEstimate: 0,
      isError: false,
    };
  } else {
    (async () => {
      const gasEstimate = await estimateGas(
        publicClient,
        address,
        contractType,
        functionName,
        farmition,
        account,
        args
      );
      const price = await getGasPrice(publicClient);

      setGasEstimateAmount(Number(gasEstimate));
      setGasPrice(Number(price));
    })().catch((error) => {
      setIsError(true);
      console.error("Error in gas estimation:", error);
    });

    // Todo: Handle BigInt properly
    const estimate = (gasEstimateAmount * gasPrice) / 10 ** 18;
    // console.log("estimate", estimate);

    return {
      gasEstimate: (gasEstimateAmount * gasPrice) / 10 ** 18,
      isError,
    };
  }
};

export default useGasEstimation;

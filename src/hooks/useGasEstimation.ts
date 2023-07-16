import { useState } from "react";
import { usePublicClient } from "wagmi";
import { PublicClient, parseAbi, parseUnits } from "viem";
import {
  getAddLiqFunctionName,
  getRouterAbi,
} from "@utils/abis/contract-helper-methods";
import { FarmType } from "@utils/types";

const estimateGas = async (
  publicClient: PublicClient,
  address: `0x${string}`,
  farm: FarmType,
  slippage: number,
  amountA: number,
  amountB: number
): Promise<bigint> => {
  const farmAsset0 = farm.asset.underlyingAssets[0];
  const farmAsset1 = farm.asset.underlyingAssets[1];

  const gasEstimate = await publicClient.estimateContractGas({
    address: farm?.router as any,
    abi: parseAbi(
      getRouterAbi(
        farm?.protocol!,
        farm?.farmType == "StandardAmm" ? false : true
      )
    ),
    functionName: getAddLiqFunctionName(farm?.protocol as string) as any,
    account: address as any,
    args: [
      farmAsset0?.address, // TokenA Address
      farmAsset1?.address, // TokenB Address
      parseUnits(`${amountA}`, farmAsset0?.decimals),
      parseUnits(`${amountB}`, farmAsset1?.decimals),
      parseUnits(`${(amountA * (100 - slippage)) / 100}`, farmAsset0?.decimals), // amountAMin
      parseUnits(`${(amountB * (100 - slippage)) / 100}`, farmAsset1?.decimals), // amountBMin
      address, // To
      1784096161000, // deadline (uint256)
    ],
  });
  return gasEstimate;
};

const getGasPrice = async (publicClient: PublicClient): Promise<bigint> => {
  const gasPrice = await publicClient.getGasPrice();
  return gasPrice;
};

const useGasEstimation = (
  address: `0x${string}`,
  slippage: number,
  farm: FarmType,
  amountA: number,
  amountB: number
) => {
  const publicClient = usePublicClient();
  const [gasEstimateAmount, setGasEstimateAmount] = useState<number>(0);
  const [gasPrice, setGasPrice] = useState<number>(0);

  if (amountA == 0 || amountB == 0) return { gasEstimate: 0 };

  try {
    estimateGas(publicClient, address, farm, slippage, amountA, amountB).then(
      (res) => {
        setGasEstimateAmount(Number(res));
      }
    );
  } catch (error) {
    setGasEstimateAmount(0);
    console.log("Error: Estimating Gas", error);
  }

  try {
    getGasPrice(publicClient).then((res) => {
      setGasPrice(Number(res));
    });
  } catch (error) {
    setGasPrice(0);
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
  };
};

export default useGasEstimation;

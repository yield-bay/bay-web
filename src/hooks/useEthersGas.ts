// import { useState } from "react";
// import { useNetwork, usePublicClient } from "wagmi";
// import {
//   Address,
//   PublicClient,
//   parseAbi,
//   parseUnits,
//   createPublicClient,
//   http,
// } from "viem";
// import {
//   getAddLiqFunctionName,
//   getChefAbi,
//   getRouterAbi,
// } from "@utils/abis/contract-helper-methods";
// import { FarmType } from "@utils/types";
// import { mainnet, moonbeam, moonriver } from "viem/chains";
// import { ethers } from "ethers";

// export default async function estimateGas(
//   iface: any,
//   fdata: any,
//   address: any,
//   account: any
// ) {
//   // Initialize an ethers instance
//   const provider = new ethers.JsonRpcProvider(
//     process.env.NEXT_PUBLIC_MOONBEAM_URL!
//   );
//   // console.log("ethers prov", provider);
//   const currentBlock = await provider.getBlockNumber();
//   // console.log("cbb", currentBlock);
//   const timestamp = (await provider.getBlock(currentBlock))!.timestamp;
//   // console.log("currentblocktimestamp", timestamp, timestamp * 1000);
//   // Query the blockchain (replace example parameters)
//   const gp = (await provider.getFeeData()).gasPrice;
//   // console.log("gpis", gp);

//   const estGas = await provider.estimateGas({
//     from: account,
//     to: address,
//     data: fdata,
//     gasPrice: gp,
//   });

//   // Print the output to console
//   // console.log("estGas", estGas);
//   return 0;
// }

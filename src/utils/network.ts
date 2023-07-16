import { RPC_URL } from "./constants";
import { ChainId, Network } from "./types";

const moonbeamRpcUrl = RPC_URL.moonbeam;
const moonriverRpcUrl = RPC_URL.moonriver;
const astarRpcUrl = RPC_URL.astar;
const hardhartRpcUrl = RPC_URL.hardhat;

export const getChainIdForNetwork = (network: Network): ChainId => {
  let chainId = ChainId.MOONBEAM;
  switch (network) {
    case "moonbeam":
      chainId = ChainId.MOONBEAM;
      break;
    case "moonriver":
      chainId = ChainId.MOONRIVER;
      break;
    case "astar":
      chainId = ChainId.ASTAR;
      break;
    case "hardhat":
      chainId = ChainId.ASTAR;
    default:
      break;
  }
  return chainId;
};

export const getRpcUrlForNetwork = (network: string) => {
  let rpcUrl = moonbeamRpcUrl;
  switch (network) {
    case "moonbeam":
      rpcUrl = moonbeamRpcUrl;
      break;
    case "moonriver":
      rpcUrl = moonriverRpcUrl;
      break;
    case "astar":
      rpcUrl = astarRpcUrl;
      break;
    case "hardhat":
      rpcUrl = hardhartRpcUrl;
    default:
      break;
  }
  return rpcUrl;
};

export const getSupportedChains = () => {
  return [
    {
      id: ChainId.MOONBEAM,
      name: "Moonbeam",
    },
    {
      id: ChainId.MOONRIVER,
      name: "Moonriver",
    },
    {
      id: ChainId.ASTAR,
      name: "Astar",
    },
    // For dev
    {
      id: ChainId.HARDHAT,
      name: "Hardhat",
    },
  ];
};

export const getNativeTokenAddress = (
  network: string
): { tokenSymbol: string; tokenAddress: `0x${string}` } => {
  const chain = network.toLowerCase();
  switch (chain) {
    case "moonbeam": // GLMR
      return {
        tokenSymbol: "WGLMR",
        tokenAddress: "0xAcc15dC74880C9944775448304B263D191c6077F",
      };
    case "moonriver": // MOVR
      return {
        tokenSymbol: "WMOVR",
        tokenAddress: "0x98878B06940aE243284CA214f92Bb71a2b032B8A", // MOVR,
      };
    case "astar": // ASTR
      return {
        tokenSymbol: "WASTR",
        tokenAddress: "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720", // MOVR,
      };
    default:
      return {
        tokenSymbol: "WASTR",
        tokenAddress: "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720", // MOVR,
      };
  }
};

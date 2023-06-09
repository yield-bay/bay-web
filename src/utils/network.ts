import { RPC_URL } from "./constants";
import { ChainId, Network } from "./types";

const moonbeamRpcUrl = RPC_URL.moonbeam;
const moonriverRpcUrl = RPC_URL.moonriver;
const astarRpcUrl = RPC_URL.astar;

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
    default:
      break;
  }
  return rpcUrl;
};

// Astar Network Configuration
export const astar = {
  id: ChainId.ASTAR,
  name: "Astar",
  network: Network.ASTAR,
  nativeCurrency: {
    decimals: 18,
    name: "MOVR",
    symbol: "MOVR",
  },
  rpcUrls: {
    public: {
      http: [RPC_URL.astar],
      webSocket: ["wss://moonriver.public.blastapi.io"],
    },
    default: {
      http: [RPC_URL.astar],
      webSocket: ["wss://moonriver.public.blastapi.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Moonscan",
      url: "https://moonriver.moonscan.io",
    },
    etherscan: {
      name: "Moonscan",
      url: "https://moonriver.moonscan.io",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11" as `0x${string}`,
      blockCreated: 1597904,
    },
  },
  testnet: false,
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
  ];
};

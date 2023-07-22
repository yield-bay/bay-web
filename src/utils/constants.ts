// STATE
export const IS_PRODUCTION =
  process.env.NEXT_PUBLIC_IS_PRODUCTION === "production";

// API URLS
export const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

// KEYS
export const FATHOM_CODE = process.env.NEXT_PUBLIC_FATHOM_CODE as string;
export const WALLET_CONNECT_PROJECT_ID = process.env
  .NEXT_PUBLIC_WALLETCONNECT_ID as string;

// APPLICATION
export const SITE_NAME = "list.yieldbay.io";
export const APP_NAME = "YieldBay";
export const DESCRIPTION =
  "Discover and earn yield from polkadot and kusama paraverse";
export const DOMAIN = "https://list.yieldbay.io";
export const IMAGE = "https://list.yieldbay.io/twitter-cover.png"; // OG like twitter card generally needs full path of image, not relative
export const USERNAME = "yield_bay";

export const RPC_URL = {
  moonbeam: "https://rpc.api.moonbeam.network",
  moonriver: "https://rpc.api.moonriver.moonbeam.network",
  astar: "https://evm.astar.network",
  hardhat: "http://localhost:8545",
};

export const MANGATA_EXPLORER_URL = "https://mangatax.subscan.io/block";

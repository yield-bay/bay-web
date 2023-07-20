import { createClient, defaultExchanges, gql } from "@urql/core";
import { API_URL } from "./constants";
import { FarmType, TokenPriceType, WalletConnectEventType } from "./types";

const client = createClient({
  url: API_URL,
  exchanges: defaultExchanges,
});

/**
 * @returns list of farms
 */
export const fetchListicleFarms = async (): Promise<{
  farms: FarmType[];
}> => {
  const farmObj = await client
    .query(
      gql`
        query Farms {
          farms {
            id
            chef
            chain
            protocol
            router
            farmType
            farmImpl
            asset {
              symbol
              address
              price
              logos
              underlyingAssets {
                symbol
                address
                decimals
              }
            }
            tvl
            rewards {
              amount
              asset
              valueUSD
              freq
            }
            apr {
              reward
              base
            }
            allocPoint
            lastUpdatedAtUTC
            safetyScore
          }
        }
      `
    )
    .toPromise();

  const farms = farmObj?.data?.farms;

  return {
    farms,
  };
};

export const fetchLpTokenPrices = async (): Promise<{
  lpTokenPrices: TokenPriceType[];
}> => {
  const lptokenPricesObj = await client
    .query(
      gql`
        query LpTokenPrices($protocols: [Protocol!]!) {
          lpTokenPrices(protocols: $protocols) {
            chain
            protocol
            symbol
            address
            price
            underlyingAssets {
              symbol
              address
              decimals
            }
          }
        }
      `,
      {
        protocols: [
          { chain: "moonbeam", protocol: "stellaswap" },
          { chain: "moonbeam", protocol: "curve" },
          { chain: "moonbeam", protocol: "zenlink" },
          { chain: "moonriver", protocol: "solarbeam" },
          { chain: "moonriver", protocol: "zenlink" },
          { chain: "astar", protocol: "zenlink" },
          { chain: "moonbeam", protocol: "beamswap" },
          { chain: "moonbeam", protocol: "solarflare" },
          { chain: "moonriver", protocol: "sushiswap" },
          { chain: "astar", protocol: "arthswap" },
          { chain: "astar", protocol: "Sirius" },
        ],
      }
    )
    .toPromise();

  const lpTokenPrices = lptokenPricesObj?.data?.lpTokenPrices;

  return {
    lpTokenPrices,
  };
};

export const fetchTokenPrices = async (): Promise<{
  tokenPrices: TokenPriceType[];
}> => {
  const tokenPricesObj = await client
    .query(
      gql`
        query TokenPrices($protocols: [Protocol!]!) {
          tokenPrices(protocols: $protocols) {
            chain
            protocol
            symbol
            address
            price
            underlyingAssets {
              symbol
              address
              decimals
            }
          }
        }
      `,
      {
        protocols: [
          { chain: "moonbeam", protocol: "stellaswap" },
          { chain: "moonbeam", protocol: "curve" },
          { chain: "moonriver", protocol: "solarbeam" },
          { chain: "moonbeam", protocol: "zenlink" },
          { chain: "moonriver", protocol: "zenlink" },
          { chain: "astar", protocol: "zenlink" },
          { chain: "moonbeam", protocol: "beamswap" },
          { chain: "moonbeam", protocol: "solarflare" },
          { chain: "moonriver", protocol: "sushiswap" },
          { chain: "astar", protocol: "arthswap" },
          { chain: "astar", protocol: "Sirius" },
        ],
      }
    )
    .toPromise();

  const tokenPrices = tokenPricesObj?.data?.tokenPrices;

  return {
    tokenPrices,
  };
};

export const createWalletConnectEvent = async (
  userAddress: string,
  walletType: string,
  walletProvider: string,
  timestamp: string
): Promise<{
  walletConnectEvent: WalletConnectEventType;
}> => {
  const walletConnectObj = await client
    .mutation(
      gql`
        mutation CreateWalletConnectEvent(
          $userAddress: String!
          $walletType: String!
          $walletProvider: String!
          $timestamp: String!
        ) {
          createWalletConnectEvent(
            userAddress: $userAddress
            walletType: $walletType
            walletProvider: $walletProvider
            timestamp: $timestamp
          ) {
            userAddress
            walletType
            walletProvider
            timestamp
          }
        }
      `,
      {
        // variables
        userAddress,
        walletType,
        walletProvider,
        timestamp,
      }
    )
    .toPromise();

  const walletConnectEvent = walletConnectObj?.data?.createWalletConnectEvent;

  return { walletConnectEvent };
};

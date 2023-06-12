import { createClient, defaultExchanges, gql } from "@urql/core";
import { API_URL } from "./constants";
import { TokenPriceType } from "./types";

const client = createClient({
  url: API_URL,
  exchanges: defaultExchanges,
});

/**
 * @returns list of farms
 */
export const fetchListicleFarms = async () => {
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
        ],
      }
    )
    .toPromise();

  const tokenPrices = tokenPricesObj?.data?.tokenPrices;

  return {
    tokenPrices,
  };
};

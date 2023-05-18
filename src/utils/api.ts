import { createClient, defaultExchanges, gql } from "@urql/core";
import { API_URL } from "./constants";

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
            farmType
            farmImpl
            asset {
              symbol
              address
              price
              logos
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

export const fetchLpTokenPrices = async () => {
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

export const fetchTokenPrices = async () => {
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

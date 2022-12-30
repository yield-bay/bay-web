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

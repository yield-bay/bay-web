import { createClient, defaultExchanges, gql } from "@urql/core";

const client = createClient({
  url: process.env.NEXT_PUBLIC_API_URL as string,
  exchanges: defaultExchanges,
});

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

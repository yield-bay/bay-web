import { FarmType } from "@utils/types/common";
import { Mangata } from "@mangata-finance/sdk";
import { WalletAccount } from "@talismn/connect-wallets";
import { fetchTokenPricesMangata } from "@utils/fetch-prices";

interface EmptyPositionsProps {
  farms: FarmType[];
  positions: { [key: string]: any };
  setPositions: (value: { [key: string]: any }) => void;
}

interface FetchPositionsProps {
  farms: FarmType[];
  positions: { [key: string]: any };
  setPositions: (value: { [key: string]: any }) => void;
  setIsSubPosLoading: (value: boolean) => void;
  account: WalletAccount | null;
}

// method to empty substrate positions when wallet disconnected
export const emptySubstratePositions = ({
  farms,
  positions,
  setPositions,
}: EmptyPositionsProps) => {
  let positionKeysToRemove = new Array<string>();
  farms.forEach((ff) => {
    if (
      ff.protocol == "Mangata X" &&
      ff.chain == "Mangata Kusama" &&
      ff.chef == ("xyk" as any)
    ) {
      const name = `${ff.chain}-${ff.protocol}-${ff.chef}-${ff.id}-${ff.asset.symbol}`;
      if (positions[name] !== undefined) {
        positionKeysToRemove.push(name);
      }
    }
  });
  const tempPositions = Object.fromEntries(
    Object.entries(positions).filter(
      ([key]) => !positionKeysToRemove.includes(key)
    )
  );
  setPositions(tempPositions);
};

export const updateSubstratePositions = async ({
  farm,
  positions,
  account,
}: any) => {
  // emptySubstratePositions({
  //   farms,
  //   positions,
  //   setPositions,
  // });
  console.log("substrate setup initialised");
  // setIsSubPosLoading(true);
  // Filter Mangata X Farms
  // const filteredFarms = farms.filter((f: any) => {
  //   return (
  //     f.protocol == "Mangata X" &&
  //     f.chain == "Mangata Kusama" &&
  //     f.chef == "xyk"
  //   );
  // });

  const mangata = Mangata.getInstance([
    process.env.NEXT_PUBLIC_MANGATA_KUSAMA_URL!,
  ]);
  // const mangataApi = await mangata.getApi();

  // const unsubscribe = await mangataApi.rpc.chain.subscribeNewHeads(
  // async (header: any) => {
  // console.log(`Chain is at block: #${header.number}`);

  let assetsInfo = await mangata.getAssetsInfo();
  console.log("assetsInfo", assetsInfo);
  let mangataAsset: any = {};
  const balances = await mangata.getBalances();
  console.log("mangatabalances", balances);
  for (const key in balances) {
    if (Object.hasOwnProperty.call(balances, key)) {
      const element = balances[key];
      console.log("element", element, key);
      if (assetsInfo[key] !== undefined) {
        const e = // todo: try parseBigInt here instead of parseFloat
          parseFloat(BigInt(element.toString()).toString(10)) /
          10 ** assetsInfo[key]["decimals"];
        mangataAsset[key] = e;
        console.log("mgeee", e);
      }
    }
  }

  const ff = farm;

  // const promises = filteredFarms.map(
  // async (
  //   ff: {
  //     chain: string;
  //     protocol: string;
  //     chef: string;
  //     id: any;
  //     asset: { symbol: string; address: string };
  //     tvl: number;
  //     farmType: string;
  //   },
  //   index: number
  // ) => {
  // users balance
  const bal: any = await mangata.getTokenBalance(
    ff.id, // token id
    account?.address as string // user's address
  );
  const freeBal =
    parseFloat(BigInt(bal.free).toString(10)) /
    10 ** assetsInfo[`${ff.id}`]["decimals"];
  const reservedBal =
    parseFloat(BigInt(bal.reserved).toString(10)) /
    10 ** assetsInfo[`${ff.id}`]["decimals"];

  const rewardsAmount = await mangata.calculateRewardsAmount(
    account?.address as string,
    ff.id
  );
  const tokenPrices = await fetchTokenPricesMangata();
  console.log("mangatatokenprices", tokenPrices);

  console.log(
    "Reward Amount ---",
    Number(rewardsAmount.toString()) / 10 ** 18,
    (tokenPrices.get("mgx")! * Number(rewardsAmount.toString())) / 10 ** 18
  );

  // Position key
  const name = `${ff.chain}-${ff.protocol}-${ff.chef}-${ff.id}-${ff.asset.symbol}`;

  // if (freeBal > 0 || reservedBal > 0) {
  const tempPositions = { ...positions };
  const newPosition = {
    unstaked: {
      amount: freeBal,
      amountUSD: (freeBal * ff.tvl) / mangataAsset[ff.id],
    },
    staked: {
      amount: reservedBal,
      amountUSD: (reservedBal * ff.tvl) / mangataAsset[ff.id],
    },
    unclaimedRewards: [
      {
        token: "MGX",
        amount: Number(rewardsAmount.toString()) / 10 ** 18,
        amountUSD:
          (tokenPrices.get("mgx")! * Number(rewardsAmount.toString())) /
          10 ** 18,
      },
    ],
    farmType: ff.farmType,
    lpSymbol: ff.asset.symbol,
    lpAddress: ff.asset.address,
  };
  tempPositions[name] = newPosition;
  return { name: name, position: newPosition };
  console.log(`positions now ---\n`, tempPositions);
  // setPositions((prevState: any) => ({
  //   ...prevState,
  //   ...tempPositions,
  // }));
  // }
  // }
  // );
};
/**
 * Substrate Chains Setup
 * Chains -- Mangata Kusama
 * Protocols -- Mangata X
 */
export const fetchSubstratePositions = async ({
  farms,
  positions,
  setPositions,
  setIsSubPosLoading,
  account,
}: FetchPositionsProps) => {
  emptySubstratePositions({
    farms,
    positions,
    setPositions,
  });
  console.log("substrate setup initialised");
  setIsSubPosLoading(true);
  // Filter Mangata X Farms
  const filteredFarms = farms.filter((f: any) => {
    return (
      f.protocol == "Mangata X" &&
      f.chain == "Mangata Kusama" &&
      f.chef == "xyk"
    );
  });

  const mangata = Mangata.getInstance([
    process.env.NEXT_PUBLIC_MANGATA_KUSAMA_URL!,
  ]);
  // const mangataApi = await mangata.getApi();

  // const unsubscribe = await mangataApi.rpc.chain.subscribeNewHeads(
  // async (header: any) => {
  // console.log(`Chain is at block: #${header.number}`);

  let assetsInfo = await mangata.getAssetsInfo();
  console.log("assetsInfo", assetsInfo);
  let mangataAsset: any = {};
  const balances = await mangata.getBalances();
  for (const key in balances) {
    if (Object.hasOwnProperty.call(balances, key)) {
      const element = balances[key];
      if (assetsInfo[key] !== undefined) {
        const e = // todo: try parseBigInt here instead of parseFloat
          parseFloat(BigInt(element.toString()).toString(10)) /
          10 ** assetsInfo[key]["decimals"];
        mangataAsset[key] = e;
        // console.log("mgeee", e);
      }
    }
  }

  const promises = filteredFarms.map(
    async (
      ff: {
        chain: string;
        protocol: string;
        chef: string;
        id: any;
        asset: { symbol: string; address: string };
        tvl: number;
        farmType: string;
      },
      index: number
    ) => {
      // users balance
      const bal: any = await mangata.getTokenBalance(
        ff.id, // token id
        account?.address as string // user's address
      );
      const freeBal =
        parseFloat(BigInt(bal.free).toString(10)) /
        10 ** assetsInfo[`${ff.id}`]["decimals"];
      const reservedBal =
        parseFloat(BigInt(bal.reserved).toString(10)) /
        10 ** assetsInfo[`${ff.id}`]["decimals"];

      const rewardsAmount = await mangata.calculateRewardsAmount(
        account?.address as string,
        ff.id
      );
      const tokenPrices = await fetchTokenPricesMangata();
      // console.log("MGX price", tokenPrices.get("mgx"));

      console.log(
        "Reward Amount ---",
        Number(rewardsAmount.toString()) / 10 ** 18,
        (tokenPrices.get("mgx")! * Number(rewardsAmount.toString())) / 10 ** 18
      );

      // Position key
      const name = `${ff.chain}-${ff.protocol}-${ff.chef}-${ff.id}-${ff.asset.symbol}`;

      if (freeBal > 0 || reservedBal > 0) {
        const tempPositions = { ...positions };
        tempPositions[name] = {
          unstaked: {
            amount: freeBal,
            amountUSD: (freeBal * ff.tvl) / mangataAsset[ff.id],
          },
          staked: {
            amount: reservedBal,
            amountUSD: (reservedBal * ff.tvl) / mangataAsset[ff.id],
          },
          unclaimedRewards: [
            {
              token: "MGX",
              amount: Number(rewardsAmount.toString()) / 10 ** 18,
              amountUSD:
                (tokenPrices.get("mgx")! * Number(rewardsAmount.toString())) /
                10 ** 18,
            },
          ],
          farmType: ff.farmType,
          lpSymbol: ff.asset.symbol,
          lpAddress: ff.asset.address,
        };
        console.log(`positions now ---\n`, tempPositions);
        setPositions((prevState: any) => ({
          ...prevState,
          ...tempPositions,
        }));
      }
    }
  );

  // await to check if all promises are resolved
  await Promise.allSettled(promises);
  setIsSubPosLoading(false);
  // }
  // );
};

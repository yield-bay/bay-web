import { TTokenId, Mangata, BN, TTokenInfo } from "@mangata-finance/sdk";
import axios from "axios";

/* GENERAL HELPERS */
export async function fetchKSMPrice(): Promise<number> {
  const resp = await axios.get(
    "https://api.coingecko.com/api/v3/simple/price?ids=kusama&vs_currencies=usd"
  );

  return resp.data.kusama.usd;
}

export function decimalsToAmount(amount: number, decimals: number): number {
  return amount * 10 ** decimals;
}

/* MANGATA HELPERS */
export async function calculatePriceInTarget(
  tokenIdToPrice: TTokenId,
  tokenToPriceDecimals: number,
  targetTokenID: TTokenId,
  targetDecimals: number,
  poolID: TTokenId,
  mangata: Mangata
): Promise<BN> {
  const pool = (await mangata.getLiquidityPool(poolID)).map((tokenID) =>
    tokenID.toString(10)
  );

  const targetPoolPosition = pool[0] === targetTokenID ? 0 : 1;
  const tokenPoolPosition = pool[0] === targetTokenID ? 1 : 0;

  const amountOfTokenInPoolArgs = ["0", "0"];
  amountOfTokenInPoolArgs[targetPoolPosition] = targetTokenID;
  amountOfTokenInPoolArgs[tokenPoolPosition] = tokenIdToPrice;
  const amountsInPool = await mangata.getAmountOfTokenIdInPool(
    amountOfTokenInPoolArgs[0],
    amountOfTokenInPoolArgs[1]
  );

  const tokenToPriceReserve = amountsInPool[tokenPoolPosition];
  const targetTokenReserve = amountsInPool[targetPoolPosition];
  const buyPriceArgs = [
    targetTokenReserve,
    tokenToPriceReserve,
    new BN(decimalsToAmount(1, tokenToPriceDecimals).toString()),
  ]; // inputReserve, outputReserve, inputAmountOne

  const buyPrice = await mangata.calculateBuyPrice(
    buyPriceArgs[0],
    buyPriceArgs[1],
    buyPriceArgs[2]
  );

  return buyPrice;
}

export async function getAssets(
  mangata: Mangata
): Promise<Record<string, Array<TTokenInfo>>> {
  const allAssets = await mangata.getAssetsInfo();

  const tokens: Array<TTokenInfo> = [];
  const liquidity: Array<TTokenInfo> = [];

  Object.keys(allAssets).forEach((ID) => {
    if (allAssets[ID].name.includes("Liquidity")) {
      liquidity.push(allAssets[ID]);
    } else {
      tokens.push(allAssets[ID]);
    }
  });

  return {
    tokens,
    liquidity,
  };
}

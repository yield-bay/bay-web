import { BN, Mangata, TTokenId } from "@mangata-finance/sdk";
import { calculatePriceInTarget, decimalsToAmount } from "./mangata-helpers";
import Tokens from "./tokens.json";

export async function fetchTokenPricesMangata() {
  const mangata = Mangata.getInstance([
    process.env.NEXT_PUBLIC_MANGATA_KUSAMA_URL!,
  ]);

  const tokenPrices: Map<string, number> = new Map();
  tokenPrices.set("ksm", 29.08);

  for (let token of Tokens) {
    console.log("------------");
    console.log("Calculating for", token.symbol);
    const sources = token.priceSource;
    let price = 1;
    for (let i = 0; i < sources.length; i++) {
      // Source for liquidity pool is structured: liquidity-<poolID>-<targetTokenID>
      if (sources[i].includes("liquidity")) {
        const sourceSplit = sources[i].split("-");
        const targetTokenID = sourceSplit[2];
        const targetDecimals = Tokens.find(
          (t) => t.id === targetTokenID
        )?.decimals;
        if (targetDecimals == undefined) process.exit(1);

        const poolID: TTokenId = sourceSplit[1];
        const priceInTarget = await calculatePriceInTarget(
          token.id as TTokenId,
          token.decimals,
          targetTokenID,
          targetDecimals,
          poolID,
          mangata
        );

        const targetOne = decimalsToAmount(1, targetDecimals);

        let priceInTargetNormalised;

        if (priceInTarget.gte(new BN(Number.MAX_SAFE_INTEGER.toString()))) {
          priceInTargetNormalised = priceInTarget
            .div(new BN(targetOne.toString()))
            .toNumber();
        } else {
          priceInTargetNormalised = priceInTarget.toNumber() / targetOne;
        }

        price *= priceInTargetNormalised;
      } else if (sources[i].includes("usd")) {
        const token = sources[i].split("-")[1];
        price *= tokenPrices?.get(token) || 0;
      }
    }
    tokenPrices.set(token.symbol.toLowerCase(), price);
  }

  console.log("tokenPrices", tokenPrices);

  return tokenPrices;
}

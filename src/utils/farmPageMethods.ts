type RewardType = {
  amount: number;
  asset: string;
  freq: string;
  valueUSD: number;
};

/**
 *
 * @param rewards - Array of rewards of a Farm
 * @returns - Total amount of Rewards
 */
export function calcTotalRewardValue(rewards: RewardType[]) {
  return rewards.reduce((acc, current) => acc + current.valueUSD, 0);
}

/**
 *
 * @param reward - Any particular rewards of a Farm
 * @param totalValue - Total values of Rewards
 * @returns Percentage of that reward's value in total value
 */
export function calcAssetPercentage(reward: RewardType, totalValue: number) {
  return ((reward.valueUSD * 100) / totalValue).toFixed(2);
}

/**
 *
 * @param protocolName - Protocol whose URL is needed
 * @returns Protocol URL
 */
export function protocolURL(protocolName: string): string {
  switch (protocolName.toLowerCase()) {
    case "stellaswap":
      return "https://stellaswap.com/";
    case "stellaswap pulsar":
      return "https://stellaswap.com/";
    case "solarbeam":
      return "https://solarbeam.io/";
    case "beamswap":
      return "https://beamswap.io/";
    case "sushi":
      return "https://sushi.com/";
    case "taiga":
      return "https://www.taigaprotocol.io/";
    case "curve":
      return "https://moonbeam.curve.fi/";
    case "zenlink":
      return "https://zenlink.pro/en/";
    case "solarflare":
      return "https://solarflare.io";
    case "arthswap":
      return "https://app.arthswap.org/";
    case "tapio":
      return "https://www.tapioprotocol.io/";
    case "karura dex":
      return "https://apps.karura.network/";
    case "mangata x":
      return "https://x.mangata.finance/";
    case "sirius":
      return "https://www.sirius.finance/";
    case "demeter":
      return "https://ceres-token.s3.eu-central-1.amazonaws.com/docs/Ceres%2BToken%2B-%2BDemeter%2BLitepaper%2B09.12.2021.pdf";
    case "kintsugi":
      return "https://www.interlay.io/kintsugi";
    default:
      return "";
  }
}

/**
 *
 * @param chainName - Chain whose URL is needed
 * @returns Chain URL
 */
export function chainURL(chainName: string): string {
  switch (chainName.toLowerCase()) {
    case "moonbeam":
      return "https://moonbeam.network/";
    case "moonriver":
      return "https://moonbeam.network/networks/moonriver/";
    case "astar":
      return "https://astar.network/";
    case "acala":
      return "https://acala.network/";
    case "karura":
      return "https://acala.network/karura";
    case "mangata kusama":
      return "https://www.mangata.finance/";
    case "sora":
      return "https://sora.org/";
    case "kintsugi kusama":
      return "https://www.interlay.io/kintsugi";
    default:
      return "";
  }
}

/**
 *
 * @param farmType - Type of farm
 * @returns Copy content of that farm type
 */
export function farmTypeDesc(farmType: string) {
  switch (farmType.toLowerCase()) {
    case "stableamm":
      return "Minimum to no impermanent loss thanks to the design of Stable AMMs.";
    case "standardamm":
      return "High impermanent loss risk unless the assets in the LP token are pegged to the same price. For example, GLMR-ETH LP has high IL risk, while USDC-BUSD LP has very low IL risk.";
    case "singlestaking":
      return "Impermanent loss is not a factor as an individual token is staked.";
    case "concentratedliquidity":
      return "Earn more fees with less liquidity with the most efficient AMM on Moonbeam.";
    default:
      return "";
  }
}

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
  let totalValueUSD = 0;
  rewards.forEach((reward: any) => {
    totalValueUSD += reward.valueUSD;
  });
  return totalValueUSD;
}

/**
 *
 * @param reward - Any particular rewards of a Farm
 * @param totalValue - Total values of Rewards
 * @returns - Percentage of that reward's value in total value
 */
export function calcAssetPercentage(reward: RewardType, totalValue: number) {
  return ((reward.valueUSD * 100) / totalValue).toFixed(2);
}

/**
 *
 * @param protocolName - Protocol whose URL is required
 * @returns - Protocol URL
 */
export function protocolURL(protocolName: string): string {
  const protocol = protocolName.toLowerCase();
  if (protocol == "stellaswap") return "https://stellaswap.com/";
  else if (protocol == "solarbeam") return "https://solarbeam.io/";
  else if (protocol == "beamswap") return "https://beamswap.io/";
  else if (protocol == "sushi") return "https://sushi.com/";
  else if (protocol == "taiga") return "https://www.taigaprotocol.io/";
  else if (protocol == "curve") return "https://moonbeam.curve.fi/";
  else if (protocol == "zenlink") return "https://zenlink.pro/en/";
  else if (protocol == "solarflare") return "https://solarflare.io";
  else if (protocol == "arthswap") return "https://app.arthswap.org/";
  else if (protocol == "tapio") return "https://www.tapioprotocol.io/";
  else if (protocol == "karura dex") return "https://apps.karura.network/";
  else if (protocol == "mangata x") return "https://x.mangata.finance/";
  else if (protocol == "sirius") return "https://www.sirius.finance/";
  return "";
}

/**
 *
 * @param protocolName - Chain whose URL is required
 * @returns - Chain URL
 */
export function chainURL(chainName: any): string {
  const chain = chainName.toLowerCase();
  if (chain == "moonbeam") return "https://moonbeam.network/";
  else if (chain == "moonriver")
    return "https://moonbeam.network/networks/moonriver/";
  else if (chain == "astar") return "https://astar.network/";
  else if (chain == "acala") return "https://acala.network/";
  else if (chain == "karura") return "https://acala.network/karura";
  else if (chain == "mangata kusama") return "https://www.mangata.finance/";
  return "";
}

/**
 *
 * @param farmType - Type of farm
 * @returns - Copy of that Farm type
 */
export function farmTypeDesc(farmType: string): string {
  if (farmType.toLowerCase() == "stableamm") {
    return "Minimum to no impermanent loss thanks to the design of Stable AMMs.";
  } else if (farmType.toLowerCase() == "standardamm") {
    return "High impermanent loss risk unless the assets in the LP token are pegged to the same price. For example, GLMR-ETH LP has high IL risk, while USDC-BUSD LP has very low IL risk.";
  } else if (farmType.toLowerCase() == "singlestaking") {
    return "Impermanent loss is not a factor as an individual token is staked.";
  }
  return "";
}

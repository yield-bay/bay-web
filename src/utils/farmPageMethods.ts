type RewardType = {
  amount: number;
  asset: string;
  freq: string;
  valueUSD: number;
};

export function calcTotalRewardValue(rewards: RewardType[]) {
  let totalValueUSD = 0;
  rewards.forEach((reward: any) => {
    totalValueUSD += reward.valueUSD;
  });
  return totalValueUSD;
}

export function calcAssetPercentage(reward: RewardType, totalValue: number) {
  return ((reward.valueUSD * 100) / totalValue).toFixed(2);
}

export function protocolURL(protocol: any): string {
  if (protocol == "stellaswap") return "https://stellaswap.com/";
  else if (protocol == "solarbeam") return "https://solarbeam.io/";
  else if (protocol == "beamswap") return "https://beamswap.io/";
  else if (protocol == "sushi") return "https://sushi.com/";
  else if (protocol == "taiga") return "https://acala.network/karura";
  else if (protocol == "curve") return "https://moonbeam.curve.fi/";
  else if (protocol == "zenlink") return "https://zenlink.pro/en/";
  else if (protocol == "solarflare") return "https://solarflare.io";
  else if (protocol == "arthswap") return "https://app.arthswap.org/";
  else if (protocol == "tapio") return "https://www.tapioprotocol.io/";
  return "";
}

export function chainURL(chain: any): string {
  if (chain == "moonbeam") return "https://moonbeam.network/";
  else if (chain == "moonriver")
    return "https://moonbeam.network/networks/moonriver/";
  else if (chain == "astar") return "https://astar.network/";
  else if (chain == "acala") return "https://acala.network/";
  else if (chain == "karura") return "https://acala.network/karura";
  return "";
}

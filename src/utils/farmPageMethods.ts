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
};

export function calcAssetPercentage(reward: RewardType, totalValue: number) {
  return ((reward.valueUSD * 100) / totalValue).toFixed(2);
};
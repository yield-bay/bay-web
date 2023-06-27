interface SupportedPoolsType {
  [pool: string]: string[];
}

// Pools which are supported for interacting in current version
export const supportedPools: SupportedPoolsType = {
  moonriver: ["zenlink", "solarbeam"],
  moonbeam: ["curve", "zenlink", "stellaswap"],
  astar: ["zenlink"],
  "mangata kusama": ["mangata x"],
};

// Chains metadata -- name, url, protocols
export const chains = [
  {
    name: "moonriver",
    url: process.env.NEXT_PUBLIC_MOONRIVER_URL,
    protocols: [
      {
        name: "zenlink",
        chef: "0xf4Ec122d32F2117674Ce127b72c40506c52A72F8",
      },
      {
        name: "solarbeam",
        chef: "0x0329867a8c457e9F75e25b0685011291CD30904F",
      },
    ],
  },
  {
    name: "moonbeam",
    url: process.env.NEXT_PUBLIC_MOONBEAM_URL,
    protocols: [
      {
        name: "curve",
        chef: "0xC106C836771B0B4f4a0612Bd68163Ca93be1D340",
      },
      {
        name: "curve",
        chef: "0x4efb9942e50aB8bBA4953F71d8Bebd7B2dcdE657",
      },
      {
        name: "zenlink",
        chef: "0xD6708344553cd975189cf45AAe2AB3cd749661f4",
      },
      {
        name: "stellaswap", // v1
        chef: "0xEDFB330F5FA216C9D2039B99C8cE9dA85Ea91c1E",
      },
      {
        name: "stellaswap", // v2
        chef: "0xF3a5454496E26ac57da879bf3285Fa85DEBF0388",
      },
    ],
  },
  {
    name: "astar",
    url: process.env.NEXT_PUBLIC_ASTAR_URL,
    protocols: [
      {
        name: "zenlink",
        chef: "0x460ee9DBc82B2Be84ADE50629dDB09f6A1746545",
      },
    ],
  },
];

// ABIs
export const solarbeamChefAbi = [
  "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTimestamp, uint256 accSolarPerShare, uint16 depositFeeBP, uint256 harvestInterval, uint256 totalLp)",
  // "struct UserInfo { uint256 amount, uint256 rewardDebt, uint256 rewardLockedUp, uint256 nextHarvestUntil }",
  "function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt, uint256 rewardLockedUp, uint256 nextHarvestUntil)",
  "function pendingTokens(uint256, address) view returns (address[] addresses, string[] symbols, uint256[] decimals, uint256[] amounts)",
];

export const stellaswapChefAbi = [
  "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTimestamp, uint256 accStellaPerShare, uint16 depositFeeBP, uint256 harvestInterval, uint256 totalLp)",
  // "struct UserInfo { uint256 amount, uint256 rewardDebt, uint256 rewardLockedUp, uint256 nextHarvestUntil }",
  "function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt, uint256 rewardLockedUp, uint256 nextHarvestUntil)",
  "function pendingTokens(uint256, address) view returns (address[] addresses, string[] symbols, uint256[] decimals, uint256[] amounts)",
];

export const stellaswapV1ChefAbi = [
  "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accStellaPerShare, uint16 depositFeeBP, uint256 harvestInterval, uint256 totalLp)",
  "function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt, uint256 rewardLockedUp, uint256 nextHarvestUntil)",
  "function pendingStella(uint256, address) view returns (uint256 amount)",
  "function deposit(uint256, uint256) public",
  "function withdraw(uint256, uint256) public",
];

export const zenlinkChefAbi = [
  "function getPoolInfo(uint256) view returns (address farmingToken, uint256 amount, address[] rewardTokens, uint256[] rewardPerBlock, uint256[] accRewardPerShare, uint256 lastRewardBlock, uint256 startBlock, uint16 depositFeeBP, uint256 claimableInterval)",
  // "struct UserInfo { uint256 amount, uint256 rewardDebt, uint256 rewardLockedUp, uint256 nextHarvestUntil }",
  "function getUserInfo(uint256, address) view returns (uint256 amount, uint256[] pending, uint256[] rewardDebt, uint256 nextClaimableBlock)",
  "function pendingRewards(uint256, address) view returns (uint256[] rewards, uint256 nextClaimableBlock)",
];

export const curveChefAbi = [
  "function claimable_reward(address, address) view returns (uint256)",
  "function reward_count() view returns (uint256)",
  "function reward_tokens(uint256) view returns (address)",
  "function balanceOf(address) view returns (uint256)",
  "function lp_token() view returns (address)",
];

export const lpAbi = [
  "function balanceOf(address) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function getReserves() view returns (uint112, uint112, uint32)",
  "function totalSupply() external view returns (uint256)",
];

export const tokenAbi = [
  "function approve(address, uint256) external returns (bool)",
];

// Pools which are supported for interacting in current version
export const supportedPools: {
  [pool: string]: string[];
} = {
  moonriver: ["zenlink", "solarbeam", "sushiswap"],
  moonbeam: ["curve", "zenlink", "stellaswap", "solarflare", "beamswap"],
  astar: ["zenlink", "sirius", "arthswap"],
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
      {
        name: "sushiswap",
        chef: "0x3dB01570D97631f69bbb0ba39796865456Cf89A5",
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
      {
        name: "beamswap",
        chef: "0xC6ca172FC8BDB803c5e12731109744fb0200587b",
      },
      {
        name: "solarflare",
        chef: "0x995da7dfB96B4dd1e2bd954bE384A1e66cBB4b8c",
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
      {
        name: "arthswap",
        chef: "0xc5b016c5597D298Fe9eD22922CE290A048aA5B75",
      },
      {
        name: "sirius",
        chef: "0xdCfFa5a92ef31DCc8979Ab44A0406859d7763c45",
      },
      {
        name: "sirius",
        chef: "0xCfd15008Df89D961611071BfC36e220204E9A3a8",
      },
      {
        name: "sirius",
        chef: "0xe1762b802Cf306C60b0C2C1af991646eFc8B5C6b",
      },
      {
        name: "sirius",
        chef: "0x8dBcd190e325d141E7698f0791792FFBb310A10e",
      },
      {
        name: "sirius",
        chef: "0x9e56b431AA4Bc8B8D04057977e3606A9110E479f",
      },
      {
        name: "sirius",
        chef: "0x5FF4735274b0C7ADf7de52768645aA08AE4bcB20",
      },
      {
        name: "sirius",
        chef: "0x7f2fbBa3dd14Ef24aFA22E92796791D9a38bFBE0",
      },
      {
        name: "sirius",
        chef: "0xa6B91ddDca40137B9442b4aD7076bF319eacC59E",
      },
      {
        name: "sirius",
        chef: "0xBbabf2184FbC4DFB17207E74cdB6B1587Dc158a4",
      },
      {
        name: "sirius",
        chef: "0x941e9BEF5b558D7Ca97aBC98e0664E804A9C4B7b",
      },
    ],
  },
];

// Chef ABIs

export const solarbeamChefAbi = [
  "function poolInfo(uint256) external view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTimestamp, uint256 accSolarPerShare, uint16 depositFeeBP, uint256 harvestInterval, uint256 totalLp)",
  "function userInfo(uint256, address) external view returns (uint256 amount, uint256 rewardDebt, uint256 rewardLockedUp, uint256 nextHarvestUntil)",
  "function pendingTokens(uint256, address) external view returns (address[] addresses, string[] symbols, uint256[] decimals, uint256[] amounts)",
  "function deposit(uint256, uint256) public",
  "function withdraw(uint256, uint256) public",
  "function harvestMany(uint256[]) public",
];

export const stellaswapChefAbi = [
  "function poolInfo(uint256) external view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTimestamp, uint256 accStellaPerShare, uint16 depositFeeBP, uint256 harvestInterval, uint256 totalLp)",
  "function userInfo(uint256, address) external view returns (uint256 amount, uint256 rewardDebt, uint256 rewardLockedUp, uint256 nextHarvestUntil)",
  "function pendingTokens(uint256, address) external view returns (address[] addresses, string[] symbols, uint256[] decimals, uint256[] amounts)",
  "function deposit(uint256, uint256) public",
  "function withdraw(uint256, uint256) public",
  "function harvestMany(uint256[]) public",
];

export const stellaswapV1ChefAbi = [
  "function poolInfo(uint256) external view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accStellaPerShare, uint16 depositFeeBP, uint256 harvestInterval, uint256 totalLp)",
  "function userInfo(uint256, address) external view returns (uint256 amount, uint256 rewardDebt, uint256 rewardLockedUp, uint256 nextHarvestUntil)",
  "function pendingStella(uint256, address) external view returns (uint256 amount)",
  "function deposit(uint256, uint256) public",
  "function withdraw(uint256, uint256) public",
  "function harvestMany(uint256[]) public",
];

export const zenlinkChefAbi = [
  "function getPoolInfo(uint256) external view returns (address farmingToken, uint256 amount, address[] rewardTokens, uint256[] rewardPerBlock, uint256[] accRewardPerShare, uint256 lastRewardBlock, uint256 startBlock, uint16 depositFeeBP, uint256 claimableInterval)",
  "function getUserInfo(uint256, address) external view returns (uint256 amount, uint256[] pending, uint256[] rewardDebt, uint256 nextClaimableBlock)",
  "function pendingRewards(uint256, address) external view returns (uint256[] rewards, uint256 nextClaimableBlock)",
  "function stake(uint256, address, uint256) external",
  "function redeem(uint256, address, uint256) external",
  "function claim(uint256) external",
];

export const curveChefAbi = [
  "function claimable_reward(address, address) external view returns (uint256)",
  "function reward_count() external view returns (uint256)",
  "function reward_tokens(uint256) external view returns (address)",
  "function balanceOf(address) external view returns (uint256)",
  "function lp_token() external view returns (address)",
  "function deposit(uint256) external",
  "function withdraw(uint256) external",
  "function claim_rewards() external",
];

export const beamswapChefAbi = [
  "function poolInfo(uint256) external view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTimestamp, uint256 accBeamPerShare, uint16 depositFeeBP, uint256 harvestInterval, uint256 totalLp)",
  "function userInfo(uint256, address) external view returns (uint256 amount, uint256 rewardDebt, uint256 rewardLockedUp, uint256 nextHarvestUntil)",
  "function pendingTokens(uint256, address) external view returns (address[] addresses, string[] symbols, uint256[] decimals, uint256[] amounts)",
  "function deposit(uint256, uint256) public",
  "function withdraw(uint256, uint256) public",
  "function harvestMany(uint256[]) public",
];

export const solarflareChefAbi = [
  "function poolInfo(uint256) external view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTimestamp, uint256 accFlarePerShare, uint16 depositFeeBP, uint256 harvestInterval, uint256 totalLp)",
  "function userInfo(uint256, address) external view returns (uint256 amount, uint256 rewardDebt, uint256 rewardLockedUp, uint256 nextHarvestUntil)",
  "function pendingTokens(uint256, address) external view returns (address[] addresses, string[] symbols, uint256[] decimals, uint256[] amounts)",
  "function deposit(uint256, uint256) public",
  "function withdraw(uint256, uint256) public",
  "function harvestMany(uint256[]) public",
];

export const sushiChefAbi = [
  "function lpToken(uint256) external view returns (address lpToken)",
  "function poolInfo(uint256) external view returns (uint128 accSushiPerShare, uint64 lastRewardTime, uint64 allocPoint)",
  "function userInfo(uint256, address) external view returns (uint256 amount, int256 rewardDebt)",
  "function pendingSushi(uint256, address) external view returns (uint256 pending)",
  "function deposit(uint256, uint256 amount, address) public",
  "function withdraw(uint256, uint256, address) public",
  "function harvest(uint256, address) public",
];

export const arthswapChefAbi = [
  "function lpTokens(uint256) external view returns (address lp)",
  "function poolInfos(uint256) external view returns (uint128 accARSWPerShare, uint64 lastRewardBlock, uint64 allocPoint)",
  "function userInfos(uint256, address) external view returns (uint256 amount, int256 rewardDebt)",
  "function pendingARSW(uint256, address) external view returns (uint256 pending)",
  "function deposit(uint256, uint256, address) external",
  "function withdraw(uint256, uint256, address) external",
  "function harvest(uint256, address) external",
];

// LiquidityGauge - sirius
export const siriusChefAbi = [
  // "function name() external view returns (string)",
  // "function owner() external view returns (address)",
  // "function decimals() external view returns (uint8)",
  // "function symbol() external view returns (string)",
  // "function totalSupply() external view returns (uint256)",

  "function lpToken() external view returns (address)",
  "function claimableTokens(address) external view returns (uint256)",
  "function claimableReward(address, address) external view returns (uint256)",
  "function rewardCount() external view returns (uint256)",
  "function rewardTokens(uint256) external view returns (address)",
  "function balanceOf(address) external view returns (uint256)",
  "function deposit(uint256, address, bool) external",
  "function withdraw(uint256, bool) external",
  "function claimRewards(address, address) external",
];

// standard router for stellaswap, solarbeam, solarflare, beamswap, sushiswap, arthswap, zenlink
export const standardRouterAbi = [
  "function addLiquidity(address, address, uint256, uint256, uint256, uint256, address, uint256) external returns (uint256, uint256, uint256)",
  "function removeLiquidity(address, address, uint256, uint256, uint256, address, uint256) external returns (uint256, uint256)",
  "function quote(uint256, uint256, uint256) external pure returns (uint256)",
  "function getAmountOut(uint256, uint256, uint256) external pure returns (uint256)",
  "function getAmountIn(uint256, uint256, uint256) external pure returns (uint256)",
  "function getAmountsOut(uint256, address[]) external view returns (uint256[])",
  "function getAmountsIn(uint256, address[]) external view returns (uint256[])",
];

// router and lp for curve
export const curveLpAbi = [
  "function coins(uint256) external view returns (address)",
  "function allowance(address, address) external view returns (uint256)",
  "function get_balances() external view returns (uint256, uint256)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address) external view returns (uint256)",
  "function calc_token_amount(uint256[2], bool) external view returns (uint256)",
  "function calc_withdraw_one_coin(uint256, int128) external view returns (uint256)",
  "function add_liquidity(uint256[2], uint256) external returns (uint256)",
  "function remove_liquidity(uint256, uint256[2]) external returns (uint256[])",
  "function remove_liquidity_one_coin(uint256, int128, uint256) external returns (uint256)",
];

// stable router for stellaswap, solarbeam, zenlink (4pool). (no stable farms for beamswap, sushiswap, solarflare, arthswap)
export const swapFlashLoanAbi = [
  "function getTokens() external view returns (address[])",
  "function calculateTokenAmount(uint256[], bool) external view returns (uint256)",
  "function calculateRemoveLiquidity(uint256) external view returns (uint256[])",
  "function calculateRemoveLiquidityOneToken(uint256, uint8) external view returns (uint256)",
  "function addLiquidity(uint256[], uint256, uint256) external returns (uint256)",
  "function removeLiquidity(uint256, uint256[], uint256) external returns (uint256[])",
  "function removeLiquidityOneToken(uint256, uint8, uint256, uint256) external returns (uint256)",
];

// metaSwap - sirius router
export const siriusRouterAbi = [
  "function getToken(uint8) external view returns (address)",
  "function getTokenBalance(uint8) external view returns (uint256)",
  "function calculateTokenAmount(uint256[], bool) external view returns (uint256)",
  "function calculateRemoveLiquidity(uint256) external view returns (uint256[])",
  "function calculateRemoveLiquidityOneToken(uint256, uint8) external view returns (uint256)",
  "function addLiquidity(uint256[], uint256, uint256) external returns (uint256)",
  "function removeLiquidity(uint256, uint256[], uint256) external returns (uint256[])",
  "function removeLiquidityOneToken(uint256, uint8, uint256, uint256) external returns (uint256)",
];

export const lpAbi = [
  "function balanceOf(address) external view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function getReserves() external view returns (uint112, uint112, uint32)",
  "function totalSupply() external view returns (uint256)",
  "function token0() external view returns (address)",
];

export const tokenAbi = [
  "function balanceOf(address) external view returns (uint256)",
  "function approve(address, uint256) external returns (bool)",
  "function allowance(address, address) external view returns (uint256)",
];

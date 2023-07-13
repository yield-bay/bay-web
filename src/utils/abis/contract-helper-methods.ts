import {
  // router
  curveLpAbi,
  swapFlashLoanAbi,
  standardRouterAbi,
  // chef
  solarbeamChefAbi,
  stellaswapChefAbi,
  stellaswapV1ChefAbi,
  zenlinkChefAbi,
  curveChefAbi,
  beamswapChefAbi,
  solarflareChefAbi,
  sushiChefAbi,
  arthswapChefAbi,
  siriusChefAbi,
} from "@components/Common/Layout/evmUtils";
import { PortfolioPositionType } from "@utils/types";

export function getChefAbi(protocol: string, chef: string): string[] {
  if (!protocol) return [""];
  switch (protocol.toLowerCase()) {
    case "solarbeam":
      return solarbeamChefAbi;
    case "stellaswap":
      return chef == "0xEDFB330F5FA216C9D2039B99C8cE9dA85Ea91c1E"
        ? stellaswapV1ChefAbi
        : stellaswapChefAbi;
    case "zenlink":
      return zenlinkChefAbi;
    case "curve":
      return curveChefAbi;
    case "beamswap":
      return beamswapChefAbi;
    case "solarflare":
      return solarflareChefAbi;
    case "sushiswap":
      return sushiChefAbi;
    case "arthswap":
      return arthswapChefAbi;
    case "sirius":
      return siriusChefAbi;
    default:
      return [""];
  }
}

export function getRouterAbi(protocol: string, isStable: boolean): string[] {
  if (isStable) {
    if (protocol.toLocaleLowerCase() == "curve") {
      return curveLpAbi;
    } else {
      return swapFlashLoanAbi;
    }
  } else {
    return standardRouterAbi;
  }
}

export function getAddLiqFunctionName(protocol: string) {
  if (!protocol) return "";
  switch (protocol.toLowerCase()) {
    case "curve":
      return "add_liquidity";
    case "solarbeam":
    case "stellaswap":
    case "zenlink":
    case "beamswap":
    case "solarflare":
    case "sushiswap":
    case "arthswap":
    case "sirius":
      return "addLiquidity";
    default:
      return "";
  }
}

export function getRemoveLiquidFunctionName(protocol: string) {
  if (!protocol) return "";
  switch (protocol.toLowerCase()) {
    case "curve":
      return "remove_liquidity";
    case "solarbeam":
    case "stellaswap":
    case "zenlink":
    case "beamswap":
    case "solarflare":
    case "sushiswap":
    case "arthswap":
    case "sirius":
      return "removeLiquidity";
    default:
      return "";
  }
}

export function getClaimRewardsFunctionName(protocol: string) {
  if (!protocol) return "";
  switch (protocol.toLowerCase()) {
    case "curve":
      return "claim_rewards"; // ()
    case "beamswap":
    case "solarbeam":
    case "stellaswap":
    case "solarflare":
      return "harvestMany"; // (pids[])
    case "zenlink":
      return "claim"; // (pid)
    case "arthswap":
    case "sushiswap":
      return "harvest"; // (pid, address)
    case "sirius":
      return "claimRewards"; // (farm.asset.address, address)
    default:
      return "";
  }
}

export function getClaimRewardsArgs(
  position: PortfolioPositionType,
  signer: `0x${string}`,
  lpAddress: `0x${string}`
) {
  if (!position) return [""];
  switch (position.protocol.toLowerCase()) {
    case "curve":
      return [];
    case "beamswap":
    case "solarbeam":
    case "stellaswap":
    case "solarflare":
      return [position.id];
    case "zenlink":
      return [position.id];
    case "arthswap":
    case "sushiswap":
      return [position.id, signer];
    case "sirius":
      return [lpAddress, signer];
    default:
      return [];
  }
}

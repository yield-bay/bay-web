import {
  curveChefAbi,
  curveLpAbi,
  siriusChefAbi,
  solarbeamRouterAbi,
  stellaswapV1ChefAbi,
  sushiswapChefAbi,
  zenlinkChefAbi,
} from "@components/Common/Layout/evmUtils";
import { PortfolioPositionType } from "@utils/types";

export function getStableFarmAbi(protocol: string): string[] {
  if (!protocol) return [""];
  switch (protocol.toLowerCase()) {
    case "curve":
      return curveLpAbi;
    case "solarbeam":
    case "stellaswap":
    case "zenlink":
    case "beamswap":
    case "solarflare":
    case "sushiswap":
    case "arthswap":
    case "sirius":
      return solarbeamRouterAbi;
    default:
      return [""];
  }
}

export function getStandardFarmAbi(protocol: string): string[] {
  if (!protocol) return [""];
  switch (protocol.toLowerCase()) {
    case "curve":
      return curveLpAbi;
    case "solarbeam":
    case "stellaswap":
    case "zenlink":
    case "beamswap":
    case "solarflare":
    case "sushiswap":
    case "arthswap":
      return solarbeamRouterAbi;
    case "sirius":
      return [""]; // TODO: Yet to findout
    default:
      return [""];
  }
}

export function getClaimRewardsAbi(protocol: string): string[] {
  if (!protocol) return [""];
  switch (protocol.toLowerCase()) {
    case "curve":
      return curveChefAbi; // ()
    case "beamswap":
    case "solarbeam":
    case "stellaswap":
    case "solarflare":
      return stellaswapV1ChefAbi; // (pids[])
    case "zenlink":
      return zenlinkChefAbi; // (pid)
    case "arthswap":
    case "sushiswap":
      return sushiswapChefAbi; // (pid, address)
    case "sirius":
      return siriusChefAbi; // (farm.asset.address, address)
    default:
      return [""];
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

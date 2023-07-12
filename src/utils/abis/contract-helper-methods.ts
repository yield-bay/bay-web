import {
  curveChefAbi,
  curveLpAbi,
  solarbeamRouterAbi,
} from "@components/Common/Layout/evmUtils";
import { PortfolioPositionType } from "@utils/types";
const solarbeamMoonriver = require("./solarbeam-moonriver-router.json");
const stellaswapMoonbeam = require("./stellaswap-moonbeam-router.json");
const zenlinkAstar = require("./zenlink-astar-router.json");
const zenlinkMoonriver = require("./zenlink-moonriver-router.json");
const zenlinkMoonbeam = require("./zenlink-moonbeam-router.json");
const curveMoonbeamD2oUsdt = require("./curve-moonbeam-d2o-usdt.json");
const curveMoonbeamStdot = require("./curve-moonbeam-stdot.json");
const beamswapMoonbeam = require("./beamswap-moonbeam-router.json");
const solarflareMoonbeam = require("./solarflare-moonbeam-router.json");
const sushiswapMoonriver = require("./sushiswap-moonriver-router.json");
const arthswapAstar = require("./arthswap-astar-router.json");
const siriusAstar = require("./sirius-astar-router.json");

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

export function getClaimAbi(protocol: string): string[] {
  if (!protocol) return [""];
  switch (protocol.toLowerCase()) {
    case "curve":
      return curveChefAbi;
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

export function getAbi(protocol: string, chain: string, lpToken: string) {
  if (protocol !== undefined && chain !== undefined && lpToken !== undefined) {
    switch (protocol.toLowerCase()) {
      case "solarbeam":
        if (chain.toLowerCase() == "moonriver") {
          return solarbeamMoonriver;
        }
      case "stellaswap":
        if (chain.toLowerCase() == "moonbeam") {
          return stellaswapMoonbeam;
        }
      case "zenlink":
        if (chain.toLowerCase() == "astar") {
          return zenlinkAstar;
        } else if (chain.toLowerCase() == "moonriver") {
          return zenlinkMoonriver;
        } else if (chain.toLowerCase() == "moonbeam") {
          return zenlinkMoonbeam;
        }
      case "curve":
        if (chain.toLowerCase() == "moonbeam") {
          if (lpToken.toLowerCase() == "d2o-usdt") {
            return curveMoonbeamD2oUsdt;
          } else if (lpToken.toLowerCase() == "stdot") {
            return curveMoonbeamStdot;
          }
        }
      case "beamswap":
        if (chain.toLowerCase() == "moonbeam") {
          return beamswapMoonbeam;
        }
      case "solarflare":
        if (chain.toLowerCase() == "moonbeam") {
          return solarflareMoonbeam;
        }
      case "sushiswap":
        if (chain.toLowerCase() == "moonriver") {
          return sushiswapMoonriver;
        }
      case "arthswap":
        if (chain.toLowerCase() == "astar") {
          return arthswapAstar;
        }
      case "sirius":
        if (chain.toLowerCase() == "astar") {
          return siriusAstar;
        }
      default:
        return [];
    }
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

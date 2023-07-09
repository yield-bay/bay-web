import {
  curveChefAbi,
  solarbeamRouterAbi,
} from "@components/Common/Layout/evmUtils";
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

export function getContractAddress(
  protocol: string,
  lpToken: string
): `0x${string}` {
  switch (protocol.toLowerCase()) {
    case "curve":
      if (lpToken.toLowerCase() == "stdot") {
        return "0xc6e37086d09ec2048f151d11cdb9f9bbbdb7d685";
      } else if (lpToken.toLowerCase() == "d2o-usdt") {
        return "0xff6dd348e6eecea2d81d4194b60c5157cd9e64f4";
      } else return "0x000000";
    default:
      return "0x000000";
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

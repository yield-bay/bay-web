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
import { Address } from "viem";

export function getChefAbi(protocol: string, chef: string): string[] {
  // console.log("this -- protocol", protocol, "\nchef", chef);
  if (!protocol) return solarbeamChefAbi;
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
      return stellaswapV1ChefAbi;
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

export const getRemoveLiqStableFunctionName = (
  removalId: number,
  protocol: string
) => {
  if (removalId === 1) {
    if (protocol.toLowerCase() == "curve") {
      return "remove_liquidity_one_coin";
    } else {
      return "removeLiquidityOneToken";
    }
  } else {
    return "removeLiquidity";
  }
};

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
  // position: PortfolioPositionType,
  farmId: number,
  protocol: string,
  signer: Address
  // lpAddress: Address
) {
  console.log("this -- farmid", [farmId], typeof farmId);
  switch (protocol.toLowerCase()) {
    case "curve":
      return [];
    case "beamswap":
    case "solarbeam":
    case "stellaswap":
    case "solarflare":
      return [farmId];
    case "zenlink":
      return [farmId];
    case "arthswap":
    case "sushiswap":
      return [farmId, signer];
    // case "sirius":
    //   return [lpAddress, signer];
    default:
      return [];
  }
}

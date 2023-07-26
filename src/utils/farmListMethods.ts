import { supportedPools } from "@components/Common/Layout/evmUtils";
import { FarmType } from "./types/common";

export function formatFirstLetter(name: string): string {
  return name.slice(0, 1).toUpperCase() + name.slice(1);
}

/**
 *
 * @param farm - Farm whose protocol URL is required
 * @returns - Protocol URL of the farm
 */
export function farmURL(farm: FarmType): string {
  switch (farm.protocol.toLowerCase()) {
    case "stellaswap":
      return "https://app.stellaswap.com/farm";
    case "stellaswap pulsar":
      return "https://app.stellaswap.com/pulsar";
    case "solarbeam":
      return "https://app.solarbeam.io/farm";
    case "beamswap":
      return "https://app.beamswap.io/farm";
    case "sushi":
      return "https://app.sushi.com/farm";
    case "taiga":
      return `https://apps.karura.network/swap/liquidity?lp=sa://${farm.id}`;
    case "karura dex":
      return `https://apps.karura.network/swap/liquidity?lp=sa://${farm.id}`;
    case "curve":
      return `https://moonbeam.curve.fi/factory/${farm.id}/deposit`;
    case "zenlink":
      return "https://dex.zenlink.pro/#/earn/stake";
    case "solarflare":
      return "https://solarflare.io/farm";
    case "arthswap":
      return "https://app.arthswap.org/#/farms";
    case "tapio":
      return `https://apps.acala.network/swap/liquidity?lp=sa://${farm.id}`;
    case "mangata x":
      return "https://app.mangata.finance/";
    case "sirius":
      if (farm.asset.symbol == "nASTR-ASTR LP") {
        return "https://app.sirius.finance/#/farms/Liquid%20ASTR";
      } else {
        return `https://app.sirius.finance/#/farms/${farm.asset.symbol}`;
      }
    case "demeter":
      return "https://farming.deotoken.io/farms";
    case "kintsugi":
      return "https://kintsugi.interlay.io/pools";
    case "interlay":
      return "https://app.interlay.io/pools";
    default:
      return "/404";
  }
}

export function formatFarmType(farmType: string): string {
  if (farmType === "SingleStaking") return "Single Staking";
  else if (farmType === "ConcentratedLiquidity")
    return "Concentrated Liquidity";
  else return farmType.slice(0, -3) + " swap";
}

export function formatTokenSymbols(farmName: string): string[] {
  let tokenSymbols = farmName;
  if (farmName == "" || !farmName) return ["", ""];
  if (farmName.includes("LP")) {
    tokenSymbols = tokenSymbols.replace("LP", "").trimEnd();
  }
  // not else-if but two separate conditions
  if (tokenSymbols.includes("-")) {
    let tokenNames = tokenSymbols.split("-");
    return tokenNames;
  }
  return [farmName];
}

export function getLpTokenSymbol(tokenNames: string[]): string {
  if (tokenNames.length === 1) {
    return tokenNames[0];
  } else {
    return tokenNames.join("-");
  }
}

export function getWalletInstallUrl(walletName: string): string {
  switch (walletName.toLowerCase()) {
    case "metamask":
      return "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn";
    case "talisman":
      return "https://talisman.xyz/download";
    case "subwallet":
      return "https://chrome.google.com/webstore/detail/subwallet-polkadot-extens/onhogfjeacnfoofkfgppdlbmlmnplgbn";
    default:
      return "";
  }
}

export function checkIfPoolSupported(farm: FarmType) {
  const protocols = supportedPools[farm.chain.toLocaleLowerCase()];
  if (!!protocols) return protocols.includes(farm.protocol.toLowerCase());
  return false;
}

export function formatFirstLetter(name: string): string {
  return name.slice(0, 1).toUpperCase() + name.slice(1);
}

export function farmURL(farm: any): string {
  if (farm.protocol == "stellaswap") return "https://app.stellaswap.com/farm";
  else if (farm.protocol == "solarbeam") return "https://app.solarbeam.io/farm";
  else if (farm.protocol == "beamswap") return "https://app.beamswap.io/farm";
  else if (farm.protocol == "sushi") return "https://app.sushi.com/farm";
  else if (farm.protocol == "taiga")
    return `https://apps.karura.network/swap/liquidity?lp=sa://${farm.id}`;
  else if (farm.protocol == "curve")
    return `https://moonbeam.curve.fi/factory/${farm.id}/deposit`;
  else if (farm.protocol == "zenlink")
    return "https://dex.zenlink.pro/#/earn/stake";
  else if (farm.protocol == "solarflare") return "https://solarflare.io/farm";
  else if (farm.protocol == "arthswap")
    return "https://app.arthswap.org/#/farms";
  else if (farm.protocol == "tapio")
    return `https://apps.acala.network/swap/liquidity?lp=sa://${farm.id}`;
  else if (farm.protocol == "Mangata X") return "https://app.mangata.finance/";
  return "";
}

export function formatFarmType(farmType: string): string {
  if (farmType === "SingleStaking") return "single staking";
  else return farmType.slice(0, -3) + " swap";
}

export function formatTokenSymbols(farmName: string): string[] {
  let tokenSymbols = farmName;
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

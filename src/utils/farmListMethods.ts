export function formatFirstLetter(name: string): string {
  return name.slice(0, 1).toUpperCase() + name.slice(1);
}

export function farmURL(farm: any): string {
  if (farm.protocol == "stellaswap") return "https://app.stellaswap.com/farm";
  else if (farm.protocol == "solarbeam") return "https://app.solarbeam.io/farm";
  else if (farm.protocol == "beamswap") return "https://app.beamswap.io/farm";
  else if (farm.protocol == "sushi") return "https://app.sushi.com/farm";
  else if (farm.protocol == "taiga") {
    return `https://apps.karura.network/swap/liquidity?lp=sa://${farm.id}`;
  }
  return "";
}

export function formatFarmType(farmType: string): string {
  let formatted = farmType.slice(0, -3).toUpperCase(); // removed Amm and uppercased
  // formatted = formatted.slice(0, 1) + formatted.slice(1).toLowerCase();
  return formatted.concat(" SWAP");
}

export function formatTokenSymbols(farmName: string): string[] {
  let tokenSymbols = farmName;
  if (farmName.includes("LP")) {
    tokenSymbols = tokenSymbols.replace("LP", "");
  }
  if (tokenSymbols.includes("-")) {
    let tokenNames = tokenSymbols.split("-");
    return tokenNames;
  }
  return [farmName];
}

export function isCritical(id: number, chef: string): boolean {
  const criticalFarms = [
    {
      chef: "0xF3a5454496E26ac57da879bf3285Fa85DEBF0388",
      ids: [11, 12, 13],
    },
    {
      chef: "0xC6ca172FC8BDB803c5e12731109744fb0200587b",
      ids: [15],
    },
  ];

  function include(arr: number[], obj: number): boolean {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == obj) return true;
    }
    return false;
  }

  const state = criticalFarms.map((farm) => {
    return farm.chef == chef && include(farm.ids, id);
  });
  return state.includes(true);
}

export function protocolCount(farms: any): number {
  return new Set(farms.map((farm: any) => farm?.protocol)).size;
}

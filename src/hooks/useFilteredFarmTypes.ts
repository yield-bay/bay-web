// id: 1 = all, 2 = standard, 3 = stable, 4 = single

export default function useFilteredFarmTypes(farms: any[], id: number): any[] {
  if (!farms) return [[], true];
  else if (id == 1) return farms;
  else if (id == 2) {
    const filtered = farms.filter(
      (farm: any) => farm?.farmType == "StandardAmm"
    );
    return filtered;
  } else if (id == 3) {
    const filtered = farms.filter((farm: any) => farm?.farmType == "StableAmm");
    return filtered;
  } else if (id == 4) {
    const filtered = farms.filter(
      (farm: any) => farm?.farmType == "SingleStaking"
    );
    return filtered;
  }
  return farms;
}

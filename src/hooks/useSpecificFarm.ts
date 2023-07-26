import { FarmType } from "@utils/types/common";

export default function useSpecificFarm(
  farms: FarmType[],
  idQuery: string | string[] | undefined,
  farmQuery: string | string[] | undefined
): FarmType[] {
  if (!farms) return [];
  if (!farmQuery || !idQuery) return farms;

  const specificFarm = farms.filter((farm: any) => {
    if (farm?.asset.address == farmQuery && farm.id == idQuery) return true;
    return false;
  });

  return specificFarm;
}

import { supportedPools } from "@components/Common/Layout/evmUtils";
import { FarmType } from "@utils/types";

/**
 *
 * @param farms - Farms
 * @param enabled - Search term
 * @returns Supported Farms
 */
export default function useFilteredSupported(
  farms: FarmType[],
  enabled: boolean
): FarmType[] {
  if (!farms) return [];
  else if (!enabled) return farms;
  const filtered = farms.filter((farm) => {
    const protocols = supportedPools[farm.chain.toLowerCase()];
    if (protocols && farm.farmType !== "SingleStaking") {
      return protocols.includes(farm.protocol.toLowerCase());
    }
    return false;
  });
  return filtered;
}

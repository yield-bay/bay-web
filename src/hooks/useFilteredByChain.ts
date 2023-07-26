import { PortfolioPositionType } from "@utils/types/common";

/**
 *
 * @param positions - List of positions
 * @param id - Id assigned to position types, ie. 1 = all, 2 = standard, 3 = stable, 4 = single
 * @returns - Filtered list of positions according to option select
 */
export default function useFilteredByChain(
  positions: PortfolioPositionType[],
  id: number
): PortfolioPositionType[] {
  if (!positions) return [];
  else if (id == 0) return positions; // All
  else if (id == 1) {
    const filtered = positions.filter(
      (position) => position?.chain.toLowerCase() == "moonriver"
    );
    return filtered;
  } else if (id == 2) {
    const filtered = positions.filter(
      (position) => position?.chain.toLowerCase() == "moonbeam"
    );
    return filtered;
  } else if (id == 3) {
    const filtered = positions.filter(
      (position) => position?.chain.toLowerCase() == "astar"
    );
    return filtered;
  } else if (id == 4) {
    const filtered = positions.filter(
      (position) => position?.chain.toLowerCase() == "mangata kusama"
    );

    return filtered;
  }
  return positions;
}

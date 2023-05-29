/**
 *
 * @param positions - List of positions
 * @param id - Id assigned to position types, ie. 1 = all, 2 = standard, 3 = stable, 4 = single
 * @returns - Filtered list of positions according to option select
 */
export default function useFilteredPositionType(
  positions: any[],
  id: number
): any[] {
  if (!positions) return [];
  else if (id == 0) return positions; // All
  else if (id == 1) {
    // Idle
    const filtered = positions.filter(
      (position) => position?.unstaked.amount > 0
    );
    return filtered;
  } else if (id == 2) {
    // Staked
    const filtered = positions.filter(
      (position) => position?.staked.amount > 0
    );
    return filtered;
  }
  return positions;
}

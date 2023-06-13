export function useSafetyscoreColor(safetyScore: number): string {
  switch (true) {
    case safetyScore >= 6:
      return "#56D99A";
    case safetyScore >= 4:
      return "#FFB45C";
    default:
      return "#D95656";
  }
}

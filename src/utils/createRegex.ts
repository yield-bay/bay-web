export function createNumRegex(decimal: number): RegExp {
  if (!decimal || decimal == undefined) {
    return new RegExp(`^(\\d+\\.?\\d*|\\.\\d+)$`);
  }
  return new RegExp(`^(\\d+\\.?\\d{0,${decimal}}|\\.\\d{1,${decimal}})$`);
}

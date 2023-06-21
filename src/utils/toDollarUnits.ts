/**
 *
 * @param num Number to convert into Dollar Notation
 * @param decimals Number of decimals to round to
 * @returns Converted amounts in Dollars
 */
export default function toDollarUnits(num: number, decimals: number): string {
  if (num >= 1000000) {
    return "$" + (num / 1000000).toFixed(decimals) + "M";
  } else if (num >= 1000 && num < 1000000) {
    return "$" + (num / 1000).toFixed(decimals) + "K";
  }
  return "$" + num.toFixed(decimals);
}

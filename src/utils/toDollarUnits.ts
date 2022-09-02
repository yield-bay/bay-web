export default function toDollarUnits(num: number): string {
  if (num >= 1000000) {
    return "$" + (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000 && num < 1000000) {
    return "$" + (num / 1000).toFixed(1) + "K";
  }
  return "$" + num.toString();
}

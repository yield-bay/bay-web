export default function toDollarFormat(amount: number): string {
  let formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return formatter.format(amount);
}

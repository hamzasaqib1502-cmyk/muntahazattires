export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  return `Rs. ${rounded.toLocaleString("en-PK")}`;
}

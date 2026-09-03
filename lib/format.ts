export function formatInr(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export function formatInterestRate(annualInterestRateBps: number): string {
  if (annualInterestRateBps === 0) return "0% interest";
  return `${(annualInterestRateBps / 100).toFixed(1).replace(/\.0$/, "")}% interest`;
}

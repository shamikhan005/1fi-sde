/**
 * Calculates the monthly instalment in paise. Values are kept as integers at
 * the application boundary so currency is never represented as a float.
 */
export function calculateMonthlyInstallmentPaise(
  principalPaise: number,
  tenureMonths: number,
  annualInterestRateBps: number,
): number {
  if (!Number.isSafeInteger(principalPaise) || principalPaise <= 0) {
    throw new Error("Principal must be a positive integer in paise.");
  }
  if (!Number.isInteger(tenureMonths) || tenureMonths <= 0) {
    throw new Error("Tenure must be a positive whole number of months.");
  }
  if (!Number.isInteger(annualInterestRateBps) || annualInterestRateBps < 0) {
    throw new Error("Interest rate must be a non-negative integer in basis points.");
  }

  if (annualInterestRateBps === 0) {
    return Math.round(principalPaise / tenureMonths);
  }

  const monthlyRate = annualInterestRateBps / 10_000 / 12;
  const growth = (1 + monthlyRate) ** tenureMonths;
  return Math.round((principalPaise * monthlyRate * growth) / (growth - 1));
}

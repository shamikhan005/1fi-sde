import assert from "node:assert/strict";
import test from "node:test";

import { calculateMonthlyInstallmentPaise } from "../lib/emi.ts";

test("splits a zero-interest plan and rounds to the nearest paise", () => {
  assert.equal(calculateMonthlyInstallmentPaise(12_740_000, 6, 0), 2_123_333);
  assert.equal(calculateMonthlyInstallmentPaise(100, 3, 0), 33);
});

test("uses the reducing-balance EMI formula for an interest-bearing plan", () => {
  assert.equal(calculateMonthlyInstallmentPaise(12_740_000, 36, 1_050), 414_081);
});

test("changes the instalment when the variant price changes", () => {
  const lowerPrice = calculateMonthlyInstallmentPaise(10_999_900, 48, 1_050);
  const higherPrice = calculateMonthlyInstallmentPaise(11_999_900, 48, 1_050);

  assert.equal(lowerPrice, 281_635);
  assert.ok(higherPrice > lowerPrice);
});

test("rejects invalid money, tenure, and interest inputs", () => {
  assert.throws(() => calculateMonthlyInstallmentPaise(0, 6, 0));
  assert.throws(() => calculateMonthlyInstallmentPaise(10_000, 0, 0));
  assert.throws(() => calculateMonthlyInstallmentPaise(10_000, 6, -1));
});

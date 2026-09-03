import assert from "node:assert/strict";
import test from "node:test";

import type { ProductOption, ProductVariant } from "../lib/catalog-types.ts";
import {
  findVariantForSelection,
  selectionForVariant,
  variantMatchesSelection,
} from "../lib/variant-selection.ts";

const options: ProductOption[] = [
  {
    code: "color",
    label: "Color",
    values: [
      { id: "silver", label: "Silver", swatchHex: "#D9D8D2" },
      { id: "orange", label: "Cosmic Orange", swatchHex: "#F57432" },
    ],
  },
  {
    code: "storage",
    label: "Storage",
    values: [
      { id: "256", label: "256 GB", swatchHex: null },
      { id: "512", label: "512 GB", swatchHex: null },
    ],
  },
];

function variant(id: string, color: string, storage: string, price: number): ProductVariant {
  return {
    id,
    sku: id,
    optionValueIds: [color, storage],
    mrpPaise: price + 750_000,
    salePricePaise: price,
    images: [],
    emiPlans: [],
  };
}

const variants = [
  variant("silver-256", "silver", "256", 12_740_000),
  variant("silver-512", "silver", "512", 13_740_000),
  variant("orange-256", "orange", "256", 12_740_000),
  variant("orange-512", "orange", "512", 13_740_000),
];

test("resolves every Color x Storage combination to its exact SKU", () => {
  assert.equal(
    findVariantForSelection(variants, { color: "orange", storage: "512" })?.id,
    "orange-512",
  );
  assert.equal(
    findVariantForSelection(variants, { color: "silver", storage: "256" })?.id,
    "silver-256",
  );
});

test("preserves storage when color changes and preserves color when storage changes", () => {
  const orange256 = findVariantForSelection(variants, {
    color: "orange",
    storage: "256",
  });
  assert.ok(orange256);
  assert.deepEqual(selectionForVariant(orange256, options), {
    color: "orange",
    storage: "256",
  });

  const orange512 = findVariantForSelection(variants, {
    color: "orange",
    storage: "512",
  });
  assert.equal(orange512?.salePricePaise, 13_740_000);
});

test("matches partial selections when checking option availability", () => {
  assert.equal(
    variantMatchesSelection(variants[0], { color: "silver" }),
    true,
  );
  assert.equal(
    variantMatchesSelection(variants[0], { color: "orange" }),
    false,
  );
});

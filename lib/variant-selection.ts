import type { ProductOption, ProductVariant } from "@/lib/catalog-types";

export type SelectedOptionValues = Record<string, string>;

export function selectionForVariant(
  variant: ProductVariant,
  options: ProductOption[],
): SelectedOptionValues {
  return Object.fromEntries(
    options.flatMap((option) => {
      const value = option.values.find((candidate) =>
        variant.optionValueIds.includes(candidate.id),
      );

      return value ? [[option.code, value.id]] : [];
    }),
  );
}

export function variantMatchesSelection(
  variant: ProductVariant,
  selectedValues: SelectedOptionValues,
): boolean {
  return Object.values(selectedValues).every(
    (valueId) => !valueId || variant.optionValueIds.includes(valueId),
  );
}

export function findVariantForSelection(
  variants: ProductVariant[],
  selectedValues: SelectedOptionValues,
): ProductVariant | undefined {
  return variants.find((variant) =>
    variantMatchesSelection(variant, selectedValues),
  );
}

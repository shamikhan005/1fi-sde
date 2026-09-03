import "server-only";

import { calculateMonthlyInstallmentPaise } from "@/lib/emi";
import type {
  EmiPlan,
  ProductCard,
  ProductDetail,
  ProductImage,
  ProductOption,
  ProductVariant,
} from "@/lib/catalog-types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ImageRow = {
  storage_path: string;
  alt_text: string;
  position: number;
  is_primary: boolean;
};

type OptionValueRow = {
  id: string;
  label: string;
  swatch_hex: string | null;
  position: number;
};

type OptionRow = {
  code: string;
  display_name: string;
  position: number;
  product_option_values: OptionValueRow[] | null;
};

type VariantRow = {
  id: string;
  sku: string;
  mrp_paise: number;
  sale_price_paise: number;
  variant_option_values: { option_value_id: string }[] | null;
  variant_images: ImageRow[] | null;
};

type EmiPlanTemplateRow = {
  id: string;
  tenure_months: number;
  annual_interest_rate_bps: number;
  cashback_paise: number;
  position: number;
};

type ProductPlanRow = {
  emi_plan_templates: EmiPlanTemplateRow | null;
};

type DetailQueryRow = {
  slug: string;
  brand: string;
  name: string;
  description: string;
  product_options: OptionRow[] | null;
  product_variants: VariantRow[] | null;
  product_emi_plans: ProductPlanRow[] | null;
};

type ListQueryRow = {
  slug: string;
  brand: string;
  name: string;
  description: string;
  product_variants: VariantRow[] | null;
};

function sorted<T extends { position: number }>(items: T[] | null | undefined): T[] {
  return [...(items ?? [])].sort((first, second) => first.position - second.position);
}

function toProductImages(images: ImageRow[] | null | undefined): ProductImage[] {
  const client = createSupabaseServerClient();

  return [...(images ?? [])]
    .sort(
      (first, second) =>
        Number(second.is_primary) - Number(first.is_primary) ||
        first.position - second.position,
    )
    .map((image) => {
      const { data } = client.storage
        .from("product-images")
        .getPublicUrl(image.storage_path);

      return {
        url: data.publicUrl,
        alt: image.alt_text,
        position: image.position,
      };
    });
}

function toOptions(rows: OptionRow[] | null | undefined): ProductOption[] {
  return sorted(rows).map((option) => ({
    code: option.code,
    label: option.display_name,
    values: sorted(option.product_option_values).map((value) => ({
      id: value.id,
      label: value.label,
      swatchHex: value.swatch_hex,
    })),
  }));
}

function toEmiPlans(rows: ProductPlanRow[] | null | undefined, pricePaise: number): EmiPlan[] {
  return (rows ?? [])
    .flatMap((row) => (row.emi_plan_templates ? [row.emi_plan_templates] : []))
    .sort((first, second) => first.position - second.position)
    .map((plan) => ({
      id: plan.id,
      tenureMonths: Number(plan.tenure_months),
      annualInterestRateBps: Number(plan.annual_interest_rate_bps),
      cashbackPaise: Number(plan.cashback_paise),
      monthlyInstallmentPaise: calculateMonthlyInstallmentPaise(
        Number(pricePaise),
        Number(plan.tenure_months),
        Number(plan.annual_interest_rate_bps),
      ),
    }));
}

function toVariant(row: VariantRow, productPlanRows: ProductPlanRow[]): ProductVariant {
  const salePricePaise = Number(row.sale_price_paise);

  return {
    id: row.id,
    sku: row.sku,
    optionValueIds: (row.variant_option_values ?? []).map(
      (value) => value.option_value_id,
    ),
    mrpPaise: Number(row.mrp_paise),
    salePricePaise,
    images: toProductImages(row.variant_images),
    emiPlans: toEmiPlans(productPlanRows, salePricePaise),
  };
}

export async function getProductCards(): Promise<ProductCard[]> {
  const client = createSupabaseServerClient();
  const { data, error } = await client
    .from("products")
    .select(
      "slug, brand, name, description, product_variants!inner(id, sku, mrp_paise, sale_price_paise, variant_images(storage_path, alt_text, position, is_primary))",
    )
    .order("name");

  if (error) throw error;

  return ((data ?? []) as unknown as ListQueryRow[]).map((product) => {
    const variants = product.product_variants ?? [];
    const lowestPriceVariant = [...variants].sort(
      (first, second) =>
        Number(first.sale_price_paise) - Number(second.sale_price_paise),
    )[0];

    return {
      slug: product.slug,
      brand: product.brand,
      name: product.name,
      description: product.description,
      fromPricePaise: Number(lowestPriceVariant.sale_price_paise),
      image: toProductImages(lowestPriceVariant.variant_images)[0] ?? null,
    };
  });
}

export async function getProductDetail(slug: string): Promise<ProductDetail | null> {
  const client = createSupabaseServerClient();
  const { data, error } = await client
    .from("products")
    .select(
      "slug, brand, name, description, product_options(code, display_name, position, product_option_values(id, label, swatch_hex, position)), product_variants!inner(id, sku, mrp_paise, sale_price_paise, variant_option_values(option_value_id), variant_images(storage_path, alt_text, position, is_primary)), product_emi_plans!inner(emi_plan_templates(id, tenure_months, annual_interest_rate_bps, cashback_paise, position))",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const product = data as unknown as DetailQueryRow;
  const productPlanRows = product.product_emi_plans ?? [];

  return {
    product: {
      slug: product.slug,
      brand: product.brand,
      name: product.name,
      description: product.description,
    },
    options: toOptions(product.product_options),
    variants: (product.product_variants ?? []).map((variant) =>
      toVariant(variant, productPlanRows),
    ),
  };
}

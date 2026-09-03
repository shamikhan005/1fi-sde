export type ProductImage = {
  url: string;
  alt: string;
  position: number;
};

export type EmiPlan = {
  id: string;
  tenureMonths: number;
  annualInterestRateBps: number;
  cashbackPaise: number;
  monthlyInstallmentPaise: number;
};

export type ProductVariant = {
  id: string;
  sku: string;
  optionValueIds: string[];
  mrpPaise: number;
  salePricePaise: number;
  images: ProductImage[];
  emiPlans: EmiPlan[];
};

export type ProductOptionValue = {
  id: string;
  label: string;
  swatchHex: string | null;
};

export type ProductOption = {
  code: string;
  label: string;
  values: ProductOptionValue[];
};

export type ProductDetail = {
  product: {
    slug: string;
    brand: string;
    name: string;
    description: string;
  };
  options: ProductOption[];
  variants: ProductVariant[];
};

export type ProductCard = {
  slug: string;
  brand: string;
  name: string;
  description: string;
  fromPricePaise: number;
  image: ProductImage | null;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

export type ProductListResponse = { data: ProductCard[] };
export type ProductDetailResponse = { data: ProductDetail };

export function isProductListResponse(value: unknown): value is ProductListResponse {
  if (!value || typeof value !== "object" || !("data" in value)) return false;
  return Array.isArray(value.data);
}

export function isProductDetailResponse(
  value: unknown,
): value is ProductDetailResponse {
  if (!value || typeof value !== "object" || !("data" in value)) return false;

  const data = value.data;
  return (
    !!data &&
    typeof data === "object" &&
    "product" in data &&
    "options" in data &&
    "variants" in data
  );
}

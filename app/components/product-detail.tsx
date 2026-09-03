"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ProductImageFrame } from "@/app/components/product-image";
import { formatInr, formatInterestRate } from "@/lib/format";
import {
  findVariantForSelection,
  selectionForVariant,
  variantMatchesSelection,
  type SelectedOptionValues,
} from "@/lib/variant-selection";
import {
  isProductDetailResponse,
  type EmiPlan,
  type ProductDetail as ProductDetailData,
  type ProductOption,
  type ProductVariant,
} from "@/lib/catalog-types";

type DetailLoadState =
  | { status: "loading" }
  | { status: "ready"; product: ProductDetailData }
  | { status: "not-found" }
  | { status: "error"; message: string };

export function ProductDetail({ slug }: { slug: string }) {
  const [state, setState] = useState<DetailLoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [selectedValues, setSelectedValues] = useState<SelectedOptionValues>({});
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      setState({ status: "loading" });
      setIsModalOpen(false);

      try {
        const response = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const body: unknown = await response.json();

        if (response.status === 404) {
          setState({ status: "not-found" });
          return;
        }
        if (!response.ok || !isProductDetailResponse(body)) {
          throw new Error("We could not load this product.");
        }

        const defaultVariant = body.data.variants[0];
        if (!defaultVariant) throw new Error("This product has no active variants.");

        setSelectedValues(selectionForVariant(defaultVariant, body.data.options));
        setSelectedPlanId(defaultVariant.emiPlans[0]?.id ?? null);
        setActiveImageIndex(0);
        setState({ status: "ready", product: body.data });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "We could not load this product.",
        });
      }
    }

    void loadProduct();
    return () => controller.abort();
  }, [attempt, slug]);

  const product = state.status === "ready" ? state.product : null;
  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return (
      findVariantForSelection(product.variants, selectedValues) ??
      product.variants[0] ??
      null
    );
  }, [product, selectedValues]);

  if (state.status === "loading") return <ProductDetailSkeleton />;

  if (state.status === "not-found") {
    return (
      <main className="product-page narrow-page">
        <div className="empty-state product-empty-state">
          <p className="eyebrow">404</p>
          <h1>Product not found</h1>
          <p>This product may have been removed or the link may be incorrect.</p>
          <Link className="primary-button" href="/">
            Browse all phones
          </Link>
        </div>
      </main>
    );
  }

  if (state.status === "error" || !product || !selectedVariant) {
    return (
      <main className="product-page narrow-page">
        <div className="empty-state product-empty-state">
          <span className="empty-icon" aria-hidden="true">!</span>
          <h1>We could not load this product</h1>
          <p>{state.status === "error" ? state.message : "Please try again."}</p>
          <button className="primary-button" onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  const productData = product;
  const selectedPlan =
    selectedVariant.emiPlans.find((plan) => plan.id === selectedPlanId) ??
    selectedVariant.emiPlans[0];
  const selectedImage =
    selectedVariant.images[activeImageIndex] ?? selectedVariant.images[0] ?? null;

  function isValueAvailable(optionCode: string, valueId: string) {
    const prospectiveValues = { ...selectedValues, [optionCode]: valueId };
    return productData.variants.some((variant) =>
      variantMatchesSelection(variant, prospectiveValues),
    );
  }

  function chooseValue(optionCode: string, valueId: string) {
    const prospectiveValues = { ...selectedValues, [optionCode]: valueId };
    const matchingVariant = findVariantForSelection(
      productData.variants,
      prospectiveValues,
    );

    if (!matchingVariant) return;
    setSelectedValues(selectionForVariant(matchingVariant, productData.options));
    setSelectedPlanId((current) =>
      matchingVariant.emiPlans.some((plan) => plan.id === current)
        ? current
        : (matchingVariant.emiPlans[0]?.id ?? null),
    );
    setActiveImageIndex(0);
  }

  return (
    <main className="product-page">
      <header className="site-header product-header">
        <Link className="wordmark" href="/" aria-label="EMI Storefront home">
          <span className="wordmark-mark">E</span>
          easi<span>EMI</span>
        </Link>
        <Link className="back-link" href="/">
          <span aria-hidden="true">←</span> All phones
        </Link>
      </header>

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Phones</Link>
        <span aria-hidden="true">/</span>
        <span>{product.product.name}</span>
      </nav>

      <section className="product-layout" aria-labelledby="product-heading">
        <ProductGallery
          activeIndex={activeImageIndex}
          images={selectedVariant.images}
          onImageChange={setActiveImageIndex}
          selectedImage={selectedImage}
        />

        <div className="product-purchase-panel">
          <p className="product-brand">{product.product.brand}</p>
          <h1 id="product-heading">{product.product.name}</h1>
          <p className="product-description">{product.product.description}</p>
          <PriceBlock variant={selectedVariant} />

          <section className="variant-section" aria-label="Choose product options">
            {product.options.map((option) => (
              <fieldset className="option-group" key={option.code}>
                <legend>{option.label}</legend>
                <div className={option.code === "color" ? "color-options" : "text-options"}>
                  {option.values.map((value) => {
                    const selected = selectedValues[option.code] === value.id;
                    const available = isValueAvailable(option.code, value.id);

                    return (
                      <button
                        className={
                          option.code === "color"
                            ? `swatch-button${selected ? " is-selected" : ""}`
                            : `option-button${selected ? " is-selected" : ""}`
                        }
                        disabled={!available}
                        key={value.id}
                        onClick={() => chooseValue(option.code, value.id)}
                        type="button"
                        aria-pressed={selected}
                        title={value.label}
                      >
                        {value.swatchHex ? (
                          <span
                            className="color-swatch"
                            style={{ backgroundColor: value.swatchHex }}
                            aria-hidden="true"
                          />
                        ) : null}
                        <span>{value.label}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </section>

          <section className="emi-section" aria-labelledby="emi-heading">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Choose a payment plan</p>
                <h2 id="emi-heading">EMI options</h2>
              </div>
              <span className="secure-note">No hidden fees</span>
            </div>
            <EmiPlanList
              plans={selectedVariant.emiPlans}
              selectedPlanId={selectedPlan?.id ?? null}
              onSelect={setSelectedPlanId}
            />
          </section>

          <button
            className="primary-button proceed-button"
            disabled={!selectedPlan}
            onClick={() => setIsModalOpen(true)}
            type="button"
          >
            Continue with this EMI plan <span aria-hidden="true">→</span>
          </button>
          <p className="demo-disclaimer">Demo only. No payment or application will be created.</p>
        </div>
      </section>

      {selectedPlan ? (
        <PlanConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          options={product.options}
          plan={selectedPlan}
          productName={`${product.product.brand} ${product.product.name}`}
          selectedValues={selectedValues}
        />
      ) : null}
    </main>
  );
}

function ProductGallery({
  activeIndex,
  images,
  onImageChange,
  selectedImage,
}: {
  activeIndex: number;
  images: ProductVariant["images"];
  onImageChange: (index: number) => void;
  selectedImage: ProductVariant["images"][number] | null;
}) {
  return (
    <section className="product-gallery" aria-label="Product images">
      <div className="gallery-main-image">
        <ProductImageFrame
          image={selectedImage}
          priority
          sizes="(max-width: 900px) 100vw, 48vw"
        />
      </div>
      {images.length > 1 ? (
        <div className="gallery-thumbnails">
          {images.map((image, index) => (
            <button
              className={`thumbnail-button${activeIndex === index ? " is-active" : ""}`}
              type="button"
              key={`${image.url}-${index}`}
              aria-label={`View image ${index + 1}`}
              aria-pressed={activeIndex === index}
              onClick={() => onImageChange(index)}
            >
              <span className="thumbnail-index">{index + 1}</span>
            </button>
          ))}
        </div>
      ) : null}
      <p className="gallery-caption">Images are representative of the selected finish.</p>
    </section>
  );
}

function PriceBlock({ variant }: { variant: ProductVariant }) {
  const savings = variant.mrpPaise - variant.salePricePaise;

  return (
    <section className="price-block" aria-label="Product price">
      <p className="price-label">Today&apos;s price</p>
      <div className="price-row">
        <strong>{formatInr(variant.salePricePaise)}</strong>
        <span>{formatInr(variant.mrpPaise)}</span>
      </div>
      {savings > 0 ? <p className="savings-copy">You save {formatInr(savings)}</p> : null}
    </section>
  );
}

function EmiPlanList({
  plans,
  selectedPlanId,
  onSelect,
}: {
  plans: EmiPlan[];
  selectedPlanId: string | null;
  onSelect: (planId: string) => void;
}) {
  return (
    <div className="emi-plan-list" role="radiogroup" aria-label="EMI payment plans">
      {plans.map((plan) => {
        const selected = selectedPlanId === plan.id;
        return (
          <button
            className={`emi-plan${selected ? " is-selected" : ""}`}
            key={plan.id}
            onClick={() => onSelect(plan.id)}
            role="radio"
            aria-checked={selected}
            type="button"
          >
            <span className="plan-radio" aria-hidden="true" />
            <span className="plan-main-copy">
              <strong>
                {formatInr(plan.monthlyInstallmentPaise)} <span>× {plan.tenureMonths} months</span>
              </strong>
              {plan.cashbackPaise > 0 ? (
                <small>Additional cashback of {formatInr(plan.cashbackPaise)}</small>
              ) : (
                <small>Flexible monthly payment</small>
              )}
            </span>
            <span className="interest-copy">{formatInterestRate(plan.annualInterestRateBps)}</span>
          </button>
        );
      })}
    </div>
  );
}

function PlanConfirmationModal({
  isOpen,
  onClose,
  options,
  plan,
  productName,
  selectedValues,
}: {
  isOpen: boolean;
  onClose: () => void;
  options: ProductOption[];
  plan: EmiPlan;
  productName: string;
  selectedValues: Record<string, string>;
}) {
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const optionSummary = options
    .map((option) => {
      const value = option.values.find((candidate) => candidate.id === selectedValues[option.code]);
      return value ? `${option.label}: ${value.label}` : null;
    })
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="modal-layer" role="presentation">
      <button className="modal-backdrop" aria-label="Close confirmation" onClick={onClose} />
      <section className="confirmation-modal" aria-labelledby="confirmation-title" aria-modal="true" role="dialog">
        <button className="modal-close" aria-label="Close confirmation" onClick={onClose} type="button">×</button>
        <span className="confirmation-check" aria-hidden="true">✓</span>
        <p className="eyebrow">Plan selected</p>
        <h2 id="confirmation-title">Ready when you are</h2>
        <p className="confirmation-intro">You chose a {plan.tenureMonths}-month plan for {productName}.</p>
        <dl className="confirmation-summary">
          <div><dt>Variant</dt><dd>{optionSummary}</dd></div>
          <div><dt>Monthly payment</dt><dd>{formatInr(plan.monthlyInstallmentPaise)}</dd></div>
          <div><dt>Interest</dt><dd>{formatInterestRate(plan.annualInterestRateBps)}</dd></div>
          <div><dt>Cashback</dt><dd>{formatInr(plan.cashbackPaise)}</dd></div>
        </dl>
        <button className="primary-button modal-button" onClick={onClose} type="button">Done</button>
        <p className="demo-disclaimer">This is a demonstration and has not submitted anything.</p>
      </section>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <main className="product-page" aria-label="Loading product">
      <header className="site-header product-header">
        <span className="wordmark"><span className="wordmark-mark">E</span>easi<span>EMI</span></span>
      </header>
      <div className="breadcrumb"><span>Phones</span><span>/</span><span>Loading product</span></div>
      <section className="product-layout">
        <div className="gallery-main-image skeleton-block" />
        <div className="product-purchase-panel skeleton-panel">
          <div className="skeleton-block skeleton-line short" />
          <div className="skeleton-block skeleton-title" />
          <div className="skeleton-block skeleton-line" />
          <div className="skeleton-block skeleton-price" />
          <div className="skeleton-block skeleton-option" />
          <div className="skeleton-block skeleton-option" />
          <div className="skeleton-block skeleton-plan" />
          <div className="skeleton-block skeleton-plan" />
        </div>
      </section>
    </main>
  );
}

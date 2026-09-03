"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ProductImageFrame } from "@/app/components/product-image";
import { formatInr } from "@/lib/format";
import {
  isProductListResponse,
  type ProductCard,
} from "@/lib/catalog-types";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; products: ProductCard[] }
  | { status: "error"; message: string };

export function Catalogue() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalogue() {
      setState({ status: "loading" });

      try {
        const response = await fetch("/api/products", {
          signal: controller.signal,
          cache: "no-store",
        });
        const body: unknown = await response.json();

        if (!response.ok || !isProductListResponse(body)) {
          throw new Error("We could not load the catalogue.");
        }

        setState({ status: "ready", products: body.data });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "We could not load the catalogue.",
        });
      }
    }

    void loadCatalogue();
    return () => controller.abort();
  }, [attempt]);

  return (
    <main className="catalogue-page">
      <header className="site-header catalogue-header">
        <Link className="wordmark" href="/" aria-label="EMI Storefront home">
          <span className="wordmark-mark">E</span>
          easi<span>EMI</span>
        </Link>
        <p className="header-note">Flexible payments, clearly explained.</p>
      </header>

      <section className="catalogue-hero" aria-labelledby="catalogue-heading">
        <p className="eyebrow">Premium phones, practical plans</p>
        <h1 id="catalogue-heading">Choose your next phone. Pay at your pace.</h1>
        <p>
          Compare flexible monthly payment plans, with every price and offer
          loaded directly from our catalogue.
        </p>
      </section>

      <section className="catalogue-content" aria-live="polite">
        {state.status === "loading" && <CatalogueSkeleton />}

        {state.status === "error" && (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
              !
            </span>
            <h2>Catalogue unavailable</h2>
            <p>{state.message}</p>
            <button className="secondary-button" onClick={() => setAttempt((value) => value + 1)}>
              Try again
            </button>
          </div>
        )}

        {state.status === "ready" && state.products.length === 0 && (
          <div className="empty-state">
            <h2>Nothing to show yet</h2>
            <p>Apply the Supabase schema and seed migration, then refresh this page.</p>
          </div>
        )}

        {state.status === "ready" && state.products.length > 0 && (
          <div className="product-card-grid">
            {state.products.map((product) => (
              <Link
                className="catalogue-card"
                href={`/products/${product.slug}`}
                key={product.slug}
              >
                <div className="catalogue-card-image">
                  <ProductImageFrame
                    image={product.image}
                    sizes="(max-width: 640px) 88vw, (max-width: 960px) 44vw, 30vw"
                  />
                </div>
                <div className="catalogue-card-copy">
                  <p className="product-brand">{product.brand}</p>
                  <h2>{product.name}</h2>
                  <p className="catalogue-description">{product.description}</p>
                  <p className="catalogue-price">
                    From <strong>{formatInr(product.fromPricePaise)}</strong>
                  </p>
                  <span className="catalogue-link">
                    View payment plans <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function CatalogueSkeleton() {
  return (
    <div className="product-card-grid" aria-label="Loading products">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="catalogue-card skeleton-card" key={index}>
          <div className="skeleton-block skeleton-image" />
          <div className="catalogue-card-copy">
            <div className="skeleton-block skeleton-line short" />
            <div className="skeleton-block skeleton-line" />
            <div className="skeleton-block skeleton-line medium" />
            <div className="skeleton-block skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}

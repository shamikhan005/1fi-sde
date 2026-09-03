"use client";

import Image from "next/image";
import { useState } from "react";

import type { ProductImage } from "@/lib/catalog-types";

type ProductImageProps = {
  image: ProductImage | null | undefined;
  priority?: boolean;
  sizes: string;
};

export function ProductImageFrame({
  image,
  priority = false,
  sizes,
}: ProductImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);

  if (!image || failedSource === image.url) {
    return (
      <div className="product-image-fallback" aria-label="Product image unavailable">
        <span className="fallback-camera fallback-camera-one" />
        <span className="fallback-camera fallback-camera-two" />
        <span className="fallback-camera fallback-camera-three" />
        <span className="fallback-speaker" />
        <span className="fallback-home-indicator" />
      </div>
    );
  }

  return (
    <Image
      src={image.url}
      alt={image.alt}
      fill
      priority={priority}
      sizes={sizes}
      className="product-image"
      onError={() => setFailedSource(image.url)}
    />
  );
}

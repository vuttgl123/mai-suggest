"use client";

/* The catalogue accepts owner-provided image URLs, which cannot be restricted to
 * a fixed Next Image allow-list. Keep this small, lazy native image boundary so
 * a valid source from Supabase is shown rather than causing a render-time error.
 */
/* eslint-disable @next/next/no-img-element */

import { Heart } from "lucide-react";
import { useState } from "react";

type CatalogueItemImageVariant = "portrait" | "content-fill";

interface CatalogueItemImageProps {
  src: string;
  alt: string;
  variant?: CatalogueItemImageVariant;
}

export function CatalogueItemImage({
  src,
  alt,
  variant = "portrait",
}: CatalogueItemImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const frameClassName =
    variant === "content-fill"
      ? "relative h-full min-h-64 overflow-hidden bg-[var(--color-skeleton)]"
      : "relative aspect-[4/5] overflow-hidden bg-[var(--color-skeleton)]";
  const fallbackClassName =
    variant === "content-fill"
      ? "flex h-full min-h-64 flex-col items-center justify-center gap-2 bg-[var(--color-skeleton)] px-4 text-center text-[var(--color-muted)]"
      : "flex aspect-[4/5] flex-col items-center justify-center gap-2 bg-[var(--color-skeleton)] px-4 text-center text-[var(--color-muted)]";

  if (hasError) {
    return (
      <div
        className={fallbackClassName}
        role="img"
        aria-label={alt}
      >
        <Heart size={24} strokeWidth={1.2} aria-hidden="true" />
        <span className="text-xs leading-relaxed">Không tải được hình ảnh</span>
      </div>
    );
  }

  return (
    <div
      aria-busy={isLoading || undefined}
      className={frameClassName}
    >
      <img
        alt={alt}
        className={`absolute inset-0 h-full w-full object-cover transition duration-700 ease-out ${
          isLoading ? "scale-[1.02] opacity-0" : "scale-100 opacity-100"
        }`}
        decoding="async"
        height={1000}
        loading="lazy"
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        onLoad={() => setIsLoading(false)}
        src={src}
        width={800}
      />
      {isLoading ? (
        <div
          className="absolute inset-0 animate-pulse bg-[var(--color-skeleton)]"
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}

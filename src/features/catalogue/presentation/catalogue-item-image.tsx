"use client";

/* The catalogue accepts owner-provided image URLs, which cannot be restricted to
 * a fixed Next Image allow-list. Keep this small, lazy native image boundary so
 * a valid source from Supabase is shown rather than causing a render-time error.
 */
/* eslint-disable @next/next/no-img-element */

import { Heart } from "lucide-react";
import { useState } from "react";

interface CatalogueItemImageProps {
  src: string;
  alt: string;
}

export function CatalogueItemImage({ src, alt }: CatalogueItemImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className="flex aspect-[4/5] flex-col items-center justify-center gap-2 bg-[var(--color-skeleton)] px-4 text-center text-[var(--color-muted)]"
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
      className="relative aspect-[4/5] overflow-hidden bg-[var(--color-skeleton)]"
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

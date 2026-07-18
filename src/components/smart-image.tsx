"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { useState } from "react";

interface SmartImageProps {
  src: string;
  alt: string;
  variant?: "product" | "hero" | "thumbnail";
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}

export function SmartImage({
  src,
  alt,
  variant = "product",
  sizes,
  priority = false,
  className = "",
  imageClassName = "",
}: SmartImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const ratioClass =
    variant === "product"
      ? "aspect-[4/5]"
      : variant === "thumbnail"
        ? "aspect-square"
        : "h-full w-full";

  return (
    <div
      className={`relative overflow-hidden bg-[var(--color-skeleton)] ${ratioClass} ${className}`}
    >
      {!hasError ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={`object-cover transition duration-700 ease-out ${imageClassName} ${
            isLoading ? "scale-[1.02] opacity-0" : "scale-100 opacity-100"
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--color-skeleton)] px-4 text-center text-[var(--color-muted)]"
          role="img"
          aria-label={alt}
        >
          <Heart size={24} strokeWidth={1.2} aria-hidden="true" />
          {variant !== "thumbnail" && (
            <span className="text-xs leading-relaxed">Không tải được hình ảnh</span>
          )}
        </div>
      )}
      {isLoading && !hasError && (
        <div
          className="absolute inset-0 animate-pulse bg-[var(--color-skeleton)]"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

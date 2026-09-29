"use client";

/* Owner-provided image URLs cannot be restricted to a fixed Next Image
 * allow-list, so this uses a native image inside a fixed-ratio frame. The
 * frame keeps its size before the image loads, so nothing shifts. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";

/** "fill" takes the parent's height instead of a fixed ratio. */
type MattedImageRatio = "4/5" | "3/2" | "4/3" | "5/4" | "1/1" | "16/9" | "21/9" | "fill";

interface MattedImageProps {
  src: string | null;
  alt: string;
  ratio?: MattedImageRatio;
  /** Shown inside the frame when there is no image or it fails to load. */
  fallbackTitle?: string;
  priority?: boolean;
  /** Render without the vellum mat, e.g. for full-bleed atmosphere images. */
  bare?: boolean;
  className?: string;
}

export function MattedImage({
  src,
  alt,
  ratio = "4/5",
  fallbackTitle,
  priority = false,
  bare = false,
  className = "",
}: MattedImageProps) {
  // The image paints straight from server HTML over a paper-coloured frame;
  // nothing waits for hydration, so the cover photo is not delayed.
  const [hasError, setHasError] = useState(!src);
  const imageRef = useRef<HTMLImageElement>(null);
  const showImage = Boolean(src) && !hasError;

  // A broken image can fail before hydration attaches onError.
  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth === 0) {
      setHasError(true);
    }
  }, []);

  const frame = (
    <div
      className={`matted__frame ${ratio === "fill" ? "h-full" : ""}`.trim()}
      style={ratio === "fill" ? undefined : { aspectRatio: ratio }}
    >
      {showImage ? (
        <img
          alt={alt}
          decoding="async"
          fetchPriority={priority ? "high" : undefined}
          loading={priority ? "eager" : "lazy"}
          onError={() => setHasError(true)}
          ref={imageRef}
          src={src ?? undefined}
        />
      ) : (
        <div className="matted__placeholder" role={alt ? "img" : undefined} aria-label={alt || undefined}>
          <div>
            {fallbackTitle ? (
              <p className="matted__placeholder-title">{fallbackTitle}</p>
            ) : null}
            {src && hasError ? (
              <p className="mt-2 text-sm">
                Ảnh này chưa tải được.{" "}
                <a className="underline underline-offset-4" href={src} rel="noreferrer" target="_blank">
                  Mở ảnh gốc
                </a>
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );

  if (bare) {
    return <div className={className}>{frame}</div>;
  }

  return <div className={`matted ${className}`.trim()}>{frame}</div>;
}

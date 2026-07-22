/* The catalogue accepts owner-provided image URLs, which cannot be restricted to
 * a fixed Next Image allow-list. Keep this small, lazy native image boundary so
 * a valid source from Supabase is shown rather than causing a render-time error.
 */
/* eslint-disable @next/next/no-img-element */

interface CatalogueItemImageProps {
  src: string;
  alt: string;
}

export function CatalogueItemImage({ src, alt }: CatalogueItemImageProps) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-skeleton)]">
      <img
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        decoding="async"
        height={1000}
        loading="lazy"
        src={src}
        width={800}
      />
    </div>
  );
}

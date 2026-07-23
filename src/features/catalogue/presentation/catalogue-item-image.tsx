/* eslint-disable @next/next/no-img-element */

interface CatalogueItemImageProps {
  alt: string;
  priority?: boolean;
  src: string;
}

export function CatalogueItemImage({
  alt,
  priority = false,
  src,
}: CatalogueItemImageProps) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-skeleton)]">
      <img
        alt={alt}
        className="h-full w-full object-cover"
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        height={1000}
        loading={priority ? "eager" : "lazy"}
        src={src}
        width={800}
      />
    </div>
  );
}

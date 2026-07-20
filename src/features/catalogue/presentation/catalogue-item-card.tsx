import Link from "next/link";
import { ViewTransition } from "react";
import { Heart } from "lucide-react";
import { CatalogueItemImage } from "@/features/catalogue/presentation/catalogue-item-image";
import type { CatalogueItemSummary } from "@/modules/catalogue/domain/catalogue-read-models";

interface CatalogueItemCardProps {
  item: CatalogueItemSummary;
  categoryName: string | null;
}

export function CatalogueItemCard({
  item,
  categoryName,
}: CatalogueItemCardProps) {
  const image = item.primaryImage;

  return (
    <Link
      className="group block overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[rgb(255_250_247_/_80%)] shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-card)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus)]"
      href={`/catalogue/${encodeURIComponent(item.slug)}`}
      transitionTypes={["nav-forward"]}
    >
      {image ? (
        <ViewTransition
          default="none"
          name={`item-image-${item.id}`}
          share="morph"
        >
          <CatalogueItemImage
            alt={image.altText ?? item.title}
            src={image.url}
          />
        </ViewTransition>
      ) : (
        <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[linear-gradient(145deg,_var(--color-brand-soft),_var(--color-paper)_62%,_rgb(169_104_82_/_18%))]">
          <span className="absolute h-32 w-32 rounded-full border border-[rgb(122_16_37_/_15%)]" aria-hidden="true" />
          <Heart
            className="relative text-[var(--color-brand)]"
            fill="currentColor"
            size={26}
            strokeWidth={1.2}
            aria-hidden="true"
          />
          <span className="sr-only">Chưa có hình ảnh cho {item.title}</span>
        </div>
      )}

      <div className="space-y-2.5 p-4 sm:p-5">
        {categoryName ? <p className="diary-kicker">{categoryName}</p> : null}
        <div>
          <h2 className="font-display text-xl font-semibold leading-tight tracking-[-0.035em] text-[var(--color-brand-strong)] transition group-hover:text-[var(--color-brand)]">
            {item.title}
          </h2>
          {item.summary ? (
            <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[var(--color-muted)]">
              {item.summary}
            </p>
          ) : null}
        </div>
        {item.priceLabel ? (
          <p className="text-sm font-semibold text-[var(--color-brand)]">
            {item.priceLabel}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

import Link from "next/link";
import { ViewTransition } from "react";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { CatalogueItemImage } from "@/features/catalogue/presentation/catalogue-item-image";
import type { CatalogueItemSummary } from "@/modules/catalogue/domain/catalogue-read-models";

interface CatalogueFeaturedItemCardProps {
  item: CatalogueItemSummary;
  categoryName: string | null;
}

export function CatalogueFeaturedItemCard({
  item,
  categoryName,
}: CatalogueFeaturedItemCardProps) {
  const image = item.primaryImage;

  return (
    <Link
      className="group relative grid overflow-hidden rounded-[var(--radius-frame)] border border-[color-mix(in_srgb,var(--color-accent)_35%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-paper)_92%,transparent)] shadow-[0_16px_40px_-12px_rgba(49,5,12,0.14)] backdrop-blur-md transition-all duration-500 hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-luxury-card)] hover:[transform:perspective(1200px)_translateY(-8px)_rotateX(2deg)_rotateY(-2deg)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[var(--color-focus)] md:grid-cols-[minmax(18rem,1fr)_minmax(0,1.1fr)] md:items-stretch"
      href={`/catalogue/${encodeURIComponent(item.slug)}`}
      transitionTypes={["nav-forward"]}
    >
      <div className="relative overflow-hidden">
        {image ? (
          <ViewTransition default="none" name={`item-image-${item.id}`} share="morph">
            <div className="h-full overflow-hidden">
              <CatalogueItemImage
                alt={image.altText ?? item.title}
                src={image.url}
                variant="content-fill"
              />
            </div>
          </ViewTransition>
        ) : (
          <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,var(--color-brand-soft),var(--color-paper)_65%,color-mix(in_srgb,var(--color-accent)_20%,transparent))] md:h-full">
            <span className="absolute h-40 w-40 rounded-full border border-[color-mix(in_srgb,var(--color-brand)_18%,transparent)]" aria-hidden="true" />
            <Heart
              className="relative text-[var(--color-brand)] transition-transform duration-500 group-hover:scale-110"
              fill="currentColor"
              size={34}
              strokeWidth={1.2}
              aria-hidden="true"
            />
          </div>
        )}
        <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-brand-strong)_85%,transparent)] px-3.5 py-1.5 text-xs font-bold text-[var(--color-paper)] shadow-[0_4px_16px_rgba(0,0,0,0.25)] backdrop-blur-md">
          <Sparkles size={13} className="text-[var(--color-accent)]" aria-hidden="true" />
          Mở ra trước
        </span>
      </div>

      <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
        <div>
          <p className="text-xs font-bold tracking-wider uppercase text-[var(--color-accent)]">{categoryName ?? "Điều được chọn"}</p>
          <h3 className="font-display mt-3 text-balance text-2xl font-bold tracking-tight text-[var(--color-brand-strong)] transition-colors duration-300 group-hover:text-[var(--color-brand)] sm:text-3xl lg:text-4xl">
            {item.title}
          </h3>
          {item.summary ? (
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)] sm:text-base sm:leading-8">
              {item.summary}
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[color-mix(in_srgb,var(--color-border)_40%,transparent)]">
          {item.priceLabel ? (
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand)]">{item.priceLabel}</p>
          ) : (
            <span />
          )}
          <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] bg-[linear-gradient(135deg,var(--color-paper),color-mix(in_srgb,var(--color-brand-soft)_50%,transparent))] px-5 text-sm font-bold text-[var(--color-brand-strong)] shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 group-hover:border-[var(--color-accent)] group-hover:bg-[var(--color-paper)] group-hover:shadow-[0_6px_16px_rgba(197,160,89,0.25)]">
            Mở câu chuyện
            <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

import Link from "next/link";
import { ViewTransition } from "react";
import { ArrowUpRight, Heart, Sparkles } from "lucide-react";
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
      className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--color-accent)_25%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-paper)_90%,transparent)] shadow-[0_8px_30px_-6px_rgba(49,5,12,0.08)] backdrop-blur-sm transition-all duration-500 hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-luxury-card)] hover:[transform:perspective(1000px)_translateY(-6px)_rotateX(2deg)_rotateY(-2deg)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-[var(--color-focus)]"
      href={`/catalogue/${encodeURIComponent(item.slug)}`}
      transitionTypes={["nav-forward"]}
    >
      <div className="relative overflow-hidden">
        {image ? (
          <ViewTransition
            default="none"
            name={`item-image-${item.id}`}
            share="morph"
          >
            <div className="overflow-hidden">
              <CatalogueItemImage
                alt={image.altText ?? item.title}
                src={image.url}
              />
            </div>
          </ViewTransition>
        ) : (
          <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,var(--color-brand-soft),var(--color-paper)_65%,color-mix(in_srgb,var(--color-accent)_20%,transparent))]">
            <span className="absolute h-36 w-36 rounded-full border border-[color-mix(in_srgb,var(--color-brand)_15%,transparent)]" aria-hidden="true" />
            <Heart
              className="relative text-[var(--color-brand)] transition-transform duration-500 group-hover:scale-110"
              fill="currentColor"
              size={30}
              strokeWidth={1.2}
              aria-hidden="true"
            />
            <span className="sr-only">Chưa có hình ảnh cho {item.title}</span>
          </div>
        )}

        {/* Category Gold Badge */}
        {categoryName ? (
          <div className="absolute left-3 top-3 z-10">
            <span className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-paper)_88%,transparent)] px-3 py-1 text-[11px] font-bold tracking-wider text-[var(--color-brand-strong)] shadow-[0_4px_12px_rgba(0,0,0,0.08)] backdrop-blur-md">
              <Sparkles size={11} className="text-[var(--color-accent)]" />
              {categoryName}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col justify-between space-y-3 p-5 sm:p-6">
        <div>
          <h2 className="font-display text-xl font-bold leading-snug tracking-tight text-[var(--color-brand-strong)] transition-colors duration-300 group-hover:text-[var(--color-brand)]">
            {item.title}
          </h2>
          {item.summary ? (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--color-muted)] sm:text-sm">
              {item.summary}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[color-mix(in_srgb,var(--color-border)_40%,transparent)]">
          {item.priceLabel ? (
            <p className="text-xs font-bold text-[var(--color-brand)] uppercase tracking-wider">
              {item.priceLabel}
            </p>
          ) : <span />}
          
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-brand)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--color-accent)]">
            Mở câu chuyện
            <ArrowUpRight size={14} aria-hidden="true" className="transition-transform duration-300 group-hover:rotate-12" />
          </span>
        </div>
      </div>
    </Link>
  );
}

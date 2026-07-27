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
      className="group grid overflow-hidden rounded-[var(--radius-frame)] border border-[var(--color-border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-card)] transition duration-500 hover:-translate-y-1 hover:border-[var(--color-accent)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus)] md:grid-cols-[minmax(16rem,0.9fr)_minmax(0,1.1fr)] md:items-stretch"
      href={`/catalogue/${encodeURIComponent(item.slug)}`}
      transitionTypes={["nav-forward"]}
    >
      <div className="relative overflow-hidden">
        {image ? (
          <ViewTransition default="none" name={`item-image-${item.id}`} share="morph">
            <CatalogueItemImage
              alt={image.altText ?? item.title}
              src={image.url}
              variant="content-fill"
            />
          </ViewTransition>
        ) : (
          <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[linear-gradient(145deg,_var(--color-brand-soft),_var(--color-paper)_62%,_rgb(169_104_82_/_18%))]">
            <span className="absolute h-32 w-32 rounded-full border border-[var(--theme-badge-border)]" aria-hidden="true" />
            <Heart
              className="relative text-[var(--color-brand)]"
              fill="currentColor"
              size={28}
              strokeWidth={1.2}
              aria-hidden="true"
            />
          </div>
        )}
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/45 bg-[rgb(49_5_12_/_62%)] px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
          <Sparkles size={13} aria-hidden="true" />
          Mở ra trước
        </span>
      </div>

      <div className="flex flex-col justify-center p-6 sm:p-7 lg:p-8">
        <p className="text-sm font-semibold text-[var(--color-accent)]">{categoryName ?? "Một điều được lưu lại"}</p>
        <h3 className="font-display mt-3 text-balance text-3xl font-semibold tracking-[-0.055em] text-[var(--color-brand-strong)] transition group-hover:text-[var(--color-brand)] sm:text-4xl">
          {item.title}
        </h3>
        {item.summary ? (
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">
            {item.summary}
          </p>
        ) : null}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          {item.priceLabel ? (
            <p className="text-sm font-semibold text-[var(--color-brand)]">{item.priceLabel}</p>
          ) : (
            <span />
          )}
          <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-4 text-sm font-semibold text-[var(--color-brand)] transition duration-[var(--duration-fast)] group-hover:border-[var(--color-accent)] group-hover:bg-[var(--theme-control-hover)]">
            Mở câu chuyện
            <ArrowRight size={16} aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

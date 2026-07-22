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
      className="catalogue-featured-item-card group grid overflow-hidden rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--theme-card-surface)] shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-accent)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-focus)] md:grid-cols-[minmax(13rem,0.8fr)_minmax(0,1fr)]"
      href={`/catalogue/${encodeURIComponent(item.slug)}`}
      transitionTypes={["nav-forward"]}
    >
      <div className="diary-surface diary-surface--print relative m-3 mb-0 overflow-hidden md:mb-3">
        {image ? (
          <ViewTransition default="none" name={`item-image-${item.id}`} share="morph">
            <CatalogueItemImage alt={image.altText ?? item.title} src={image.url} />
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
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/45 bg-[rgb(49_5_12_/_62%)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
          <Sparkles size={13} aria-hidden="true" />
          Mở ra trước
        </span>
      </div>

      <div className="diary-ledger-row flex flex-col justify-center p-6 sm:p-7 lg:p-8">
        <p className="diary-kicker">{categoryName ?? "Một điều được lưu lại"}</p>
        <h3 className="font-display mt-3 text-balance text-3xl font-semibold tracking-[-0.055em] text-[var(--color-brand-strong)] transition group-hover:text-[var(--color-brand)] sm:text-4xl">
          {item.title}
        </h3>
        {item.summary ? (
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">
            {item.summary}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
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

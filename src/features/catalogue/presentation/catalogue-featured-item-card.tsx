import { ViewTransition } from "react";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { CatalogueItemImage } from "@/features/catalogue/presentation/catalogue-item-image";
import type { CatalogueItemSummary } from "@/modules/catalogue/domain/catalogue-read-models";
import { Card } from "@/components/ui/card";

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
    <Card
      className="group grid md:grid-cols-[minmax(18rem,1fr)_minmax(0,1.2fr)] md:items-stretch"
      href={`/catalogue/${encodeURIComponent(item.slug)}`}
      interactive={true}
      transitionTypes={["nav-forward"]}
    >
      <div className="relative overflow-hidden">
        {image ? (
          <ViewTransition default="none" name={`item-image-${item.id}`} share="morph">
            <div className="h-full overflow-hidden bg-black/5">
              <CatalogueItemImage
                alt={image.altText ?? item.title}
                src={image.url}
                variant="content-fill"
              />
            </div>
          </ViewTransition>
        ) : (
          <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-black/5 md:h-full">
            <Heart
              className="text-muted/30 transition-transform duration-[var(--motion-base)] group-hover:scale-110"
              fill="currentColor"
              size={36}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
        )}
        <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-brand-strong px-3 py-1.5 text-[11px] font-medium tracking-wide text-white shadow-md ring-1 ring-white/10">
          <Sparkles size={12} className="text-accent" aria-hidden="true" />
          Nổi bật
        </span>
      </div>

      <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-12">
        <div>
          <p className="diary-kicker text-accent">{categoryName ?? "Điều được chọn"}</p>
          <h3 className="font-display display-lg mt-3 text-balance font-medium text-brand-strong transition-colors group-hover:text-brand">
            {item.title}
          </h3>
          {item.summary ? (
            <p className="body-text mt-4 text-muted">
              {item.summary}
            </p>
          ) : null}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-6">
          {item.priceLabel ? (
            <p className="diary-kicker text-muted">{item.priceLabel}</p>
          ) : (
            <span />
          )}
          <span className="inline-flex h-10 items-center gap-2 rounded-xl bg-surface px-4 text-sm font-medium text-brand-strong  ring-1 ring-border/50 transition-colors duration-[var(--motion-base)] group-hover:bg-brand-strong group-hover:text-white group-hover:ring-brand-strong">
            Mở câu chuyện
            <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-[var(--motion-base)] group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Card>
  );
}

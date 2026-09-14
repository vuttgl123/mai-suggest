import { ViewTransition } from "react";
import { ArrowUpRight, Heart } from "lucide-react";
import { CatalogueItemImage } from "@/features/catalogue/presentation/catalogue-item-image";
import type { CatalogueItemSummary } from "@/modules/catalogue/domain/catalogue-read-models";
import { Card } from "@/components/ui/card";

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
    <Card
      className="group h-full flex-col justify-between"
      href={`/catalogue/${encodeURIComponent(item.slug)}`}
      interactive={true}
      transitionTypes={["nav-forward"]}
    >
      <div className="relative overflow-hidden">
        {image ? (
          <ViewTransition
            default="none"
            name={`item-image-${item.id}`}
            share="morph"
          >
            <div className="overflow-hidden bg-black/5">
              <CatalogueItemImage
                alt={image.altText ?? item.title}
                src={image.url}
              />
            </div>
          </ViewTransition>
        ) : (
          <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-black/5">
            <Heart
              className="text-muted/30 transition-transform duration-[var(--motion-base)] group-hover:scale-110"
              fill="currentColor"
              size={32}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
        )}

        {/* Category Badge */}
        {categoryName ? (
          <div className="absolute left-3 top-3 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[10px] font-medium tracking-wide text-brand-strong ring-1 ring-border/50">
              {categoryName}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h2 className="title-text text-brand-strong transition-colors group-hover:text-accent">
            {item.title}
          </h2>
          {item.summary ? (
            <p className="body-text-sm mt-2 line-clamp-2 text-muted">
              {item.summary}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
          {item.priceLabel ? (
            <p className="diary-kicker text-muted">
              {item.priceLabel}
            </p>
          ) : <span />}
          
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-soft/50 text-accent transition-colors duration-[var(--motion-base)] group-hover:bg-accent group-hover:text-white">
            <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden="true" />
          </div>
        </div>
      </div>
    </Card>
  );
}

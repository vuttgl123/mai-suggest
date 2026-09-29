import Link from "next/link";
import { ArchiveLabel } from "@/components/ui/archive-label";
import { MattedImage } from "@/components/ui/matted-image";
import { createItemDetailPath } from "@/features/catalogue/lib/catalogue-return-path";
import type { CatalogueItemSummary } from "@/modules/catalogue/domain/catalogue-read-models";

interface ArchiveObjectProps {
  item: CatalogueItemSummary;
  categoryName: string | null;
  returnPath: string | null;
}

/* An item in the collection: a matted image with a label under it. There is no
 * card box around it; the object sits directly on the paper. */
export function ArchiveObject({ item, categoryName, returnPath }: ArchiveObjectProps) {
  return (
    <Link
      className="interactive-object grid content-start gap-4"
      href={createItemDetailPath(item.slug, returnPath)}
      transitionTypes={["nav-forward"]}
    >
      <MattedImage
        alt={item.primaryImage?.altText ?? item.title}
        fallbackTitle={item.title}
        ratio="4/5"
        src={item.primaryImage?.url ?? null}
      />
      <div className="grid gap-2">
        <ArchiveLabel lines={[categoryName]} title={item.title} />
        {item.summary ? <p className="line-clamp-2 text-[0.9375rem] text-ink">{item.summary}</p> : null}
        {item.priceLabel ? <p className="text-[0.9375rem] font-semibold text-ink">{item.priceLabel}</p> : null}
      </div>
    </Link>
  );
}

export function CatalogueFeaturedObject({ item, categoryName, returnPath }: ArchiveObjectProps) {
  const href = createItemDetailPath(item.slug, returnPath);

  return (
    <article className="reveal-mount grid items-center gap-6 md:grid-cols-12 md:gap-x-6">
      <Link className="interactive-object w-full md:col-span-7 md:max-w-[calc((100svh-10rem)*4/3)] 2xl:col-span-6" href={href} tabIndex={-1} transitionTypes={["nav-forward"]}>
        <MattedImage
          alt={item.primaryImage?.altText ?? item.title}
          fallbackTitle={item.title}
          ratio="4/3"
          src={item.primaryImage?.url ?? null}
        />
      </Link>
      <div className="grid gap-4 md:col-span-4 md:col-start-9 2xl:col-start-8">
        <ArchiveLabel
          lines={[categoryName]}
          title={item.title}
          titleAs="h3"
          titleClassName="!text-[1.875rem] !leading-[1.14] !tracking-[-0.01em]"
        />
        {item.summary ? <p className="text-ink">{item.summary}</p> : null}
        {item.priceLabel ? <p className="text-[0.9375rem] font-semibold text-ink">{item.priceLabel}</p> : null}
        <div>
          <Link className="text-link" href={href} transitionTypes={["nav-forward"]}>
            Xem chi tiết
          </Link>
        </div>
      </div>
    </article>
  );
}

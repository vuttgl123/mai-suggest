import Link from "next/link";
import { ArrowLeft, ExternalLink, MapPin, Star } from "lucide-react";
import { ArchiveLabel } from "@/components/ui/archive-label";
import { CatalogueItemGallery } from "@/features/catalogue/presentation/catalogue-item-gallery";
import type { CatalogueItemDetail, CatalogueLink } from "@/modules/catalogue/domain/catalogue-read-models";

interface CatalogueDetailHeroProps {
  categoryName: string | null;
  item: CatalogueItemDetail;
  backHref: string;
}

/* Image first, then the story, then the practical details that help plan a
 * visit. Practical links sit high on phones so they are easy to reach. */
export function CatalogueDetailHero({ categoryName, item, backHref }: CatalogueDetailHeroProps) {
  const images = item.images.length ? item.images : item.primaryImage ? [item.primaryImage] : [];
  const mapHref =
    item.mapUrl ??
    (item.latitude !== null && item.longitude !== null
      ? `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`
      : null);
  const hasPractical = Boolean(item.address || mapHref || item.links.length || item.externalRating !== null);

  return (
    <section className="diary-container pt-8 sm:pt-12">
      <Link className="text-link -ml-1" href={backHref} transitionTypes={["nav-back"]}>
        <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
        Quay lại bộ sưu tập
      </Link>

      <div className="mt-6 grid gap-10 lg:flex lg:items-start lg:gap-[clamp(3rem,6vw,8rem)]">
        <div className="w-full lg:sticky lg:top-28 lg:w-[min(50%,calc((100svh-9rem)*0.8))] lg:shrink-0">
          <CatalogueItemGallery images={images} title={item.title} />
        </div>

        <div className="flex min-w-0 flex-col gap-8 lg:max-w-[44rem] lg:flex-1">
          <div>
            <ArchiveLabel
              lines={[categoryName, item.priceLabel ? `Giá tham khảo: ${item.priceLabel}` : null]}
              title={item.title}
              titleAs="h1"
              titleClassName="!text-[clamp(2.125rem,3.6vw,3.25rem)] !leading-[1.1] !tracking-[-0.012em]"
            />
            {item.summary ? <p className="lead-text mt-5 text-ink">{item.summary}</p> : null}
          </div>

          {hasPractical ? (
            <section aria-labelledby="practical-heading" className="border-y border-border py-5">
              <h2 className="text-sm font-semibold text-ink" id="practical-heading">
                Thông tin để đi
              </h2>
              <ul className="mt-2 grid">
                {item.address ? (
                  <li className="flex min-h-11 items-start gap-2.5 py-2 text-ink">
                    <MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-olive" size={18} strokeWidth={1.5} />
                    <span>{item.address}</span>
                  </li>
                ) : null}
                {mapHref ? <PracticalLink href={mapHref} label="Mở bản đồ" /> : null}
                {item.links.map((link) => (
                  <PracticalLink href={link.url} key={link.id} label={linkLabel(link)} />
                ))}
                {item.externalRating !== null ? (
                  <li className="tabular flex min-h-11 items-center gap-2.5 py-2 text-ink">
                    <Star aria-hidden="true" className="shrink-0 text-olive" size={18} strokeWidth={1.5} />
                    <span>
                      {item.externalRating.toLocaleString("vi-VN")} trên 5
                      {item.externalReviewCount ? ` từ ${item.externalReviewCount.toLocaleString("vi-VN")} đánh giá` : ""}
                      {item.externalRatingSource ? ` trên ${item.externalRatingSource}` : ""}
                    </span>
                  </li>
                ) : null}
              </ul>
            </section>
          ) : null}

          {item.description ? (
            <section aria-labelledby="story-heading">
              <h2 className="sr-only" id="story-heading">
                Câu chuyện
              </h2>
              <div className="prose-text whitespace-pre-line text-ink">{item.description}</div>
            </section>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function PracticalLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a
        className="flex min-h-11 items-center gap-2.5 py-2 font-semibold text-brand underline decoration-1 underline-offset-4 hover:decoration-2"
        href={href}
        rel="noreferrer"
        target="_blank"
      >
        <ExternalLink aria-hidden="true" className="shrink-0" size={16} strokeWidth={1.5} />
        {label}
        <span className="sr-only">(mở trang ngoài)</span>
      </a>
    </li>
  );
}

function linkLabel(link: CatalogueLink): string {
  if (link.title.trim()) return link.title;
  const fallback: Record<CatalogueLink["type"], string> = {
    website: "Trang web",
    map: "Bản đồ",
    menu: "Thực đơn",
    review: "Đánh giá",
    facebook: "Facebook",
    instagram: "Instagram",
    tiktok: "TikTok",
    shopping: "Nơi mua",
    other: "Liên kết",
  };
  return fallback[link.type];
}

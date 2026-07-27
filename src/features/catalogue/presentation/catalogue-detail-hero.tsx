import Link from "next/link";
import { ViewTransition } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  MapPin,
  Quote,
} from "lucide-react";
import { CatalogueItemImage } from "@/features/catalogue/presentation/catalogue-item-image";
import type { CatalogueItemDetail } from "@/modules/catalogue/domain/catalogue-read-models";

interface CatalogueDetailHeroProps {
  categoryName: string | null;
  item: CatalogueItemDetail;
}

export function CatalogueDetailHero({
  categoryName,
  item,
}: CatalogueDetailHeroProps) {
  return (
    <section className="diary-container diary-section pt-8 sm:pt-10">
      <Link
        className="inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-semibold text-[var(--color-brand)] transition duration-[var(--duration-fast)] hover:text-[var(--color-brand-strong)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-focus)] motion-reduce:transition-none"
        href="/"
        transitionTypes={["nav-back"]}
      >
        <ArrowLeft size={17} aria-hidden="true" />
        Trở lại bộ sưu tập
      </Link>

      <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-[minmax(19rem,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-16">
        <div className="diary-image-frame rotate-[-1.25deg] p-3 transition duration-500 hover:rotate-0 lg:sticky lg:top-24">
          {item.primaryImage ? (
            <ViewTransition
              default="none"
              name={`item-image-${item.id}`}
              share="morph"
            >
                <CatalogueItemImage
                  alt={item.primaryImage.altText ?? item.title}
                  src={item.primaryImage.url}
                />
            </ViewTransition>
          ) : (
            <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[calc(var(--radius-frame)-0.35rem)] bg-[linear-gradient(145deg,_var(--color-brand-soft),_var(--color-paper)_65%,_rgb(166_91_69_/_18%))]">
              <span
                className="absolute h-48 w-48 rounded-full border border-[var(--color-border)]"
                aria-hidden="true"
              />
              <Heart
                className="relative text-[var(--color-brand)]"
                fill="currentColor"
                size={34}
                strokeWidth={1.1}
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        <div className="max-w-3xl py-1 lg:py-8">
          <p className="text-sm font-semibold text-[var(--color-accent)]">
            {categoryName ?? "Một điều được lưu lại"}
          </p>
          <h1 className="font-display display-xl mt-4 max-w-4xl text-balance font-semibold text-[var(--color-brand-strong)]">
            {item.title}
          </h1>

          {item.summary ? (
            <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--color-muted)]">
              {item.summary}
            </p>
          ) : null}

          {item.priceLabel || item.address ? (
            <div className="mt-7 flex flex-wrap gap-2 border-y border-[var(--color-border)] py-4 text-sm font-semibold text-[var(--color-brand)]">
              {item.priceLabel ? <span>{item.priceLabel}</span> : null}
              {item.address ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-soft)] px-3 py-1.5">
                  <MapPin size={16} aria-hidden="true" />
                  {item.address}
                </span>
              ) : null}
            </div>
          ) : null}

          {item.description ? (
            <div className="mt-7">
              <div className="flex items-center gap-2 text-[var(--color-accent)]">
                <span className="diary-rule" aria-hidden="true" />
                <Quote size={17} strokeWidth={1.45} aria-hidden="true" />
                <p className="text-sm font-semibold text-[var(--color-accent)]">
                  Câu chuyện
                </p>
              </div>
              <p className="mt-3 whitespace-pre-line text-base leading-8 text-[var(--color-ink)]">
                {item.description}
              </p>
            </div>
          ) : null}

          {item.links.length ? (
            <div className="mt-7 flex flex-wrap gap-3">
              {item.links.map((link) => (
                <a
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-4 text-sm font-semibold text-[var(--color-brand)] transition duration-[var(--duration-fast)] hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:bg-[var(--theme-control-hover)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-focus)] motion-reduce:transform-none motion-reduce:transition-none"
                  href={link.url}
                  key={link.id}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.title}
                  <ExternalLink size={15} aria-hidden="true" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

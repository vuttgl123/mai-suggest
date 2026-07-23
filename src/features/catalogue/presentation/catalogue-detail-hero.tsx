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
    <section className="mx-auto max-w-7xl px-5 pb-10 pt-6 sm:px-8 sm:pb-14 lg:px-10">
      <Link
        className="inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-semibold text-[var(--color-brand)] transition duration-[var(--duration-fast)] hover:text-[var(--color-brand-strong)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-focus)] motion-reduce:transition-none"
        href="/"
        transitionTypes={["nav-back"]}
      >
        <ArrowLeft size={17} aria-hidden="true" />
        Trở lại bộ sưu tập
      </Link>

      <div className="mt-5 grid gap-7 lg:mt-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.72fr)] lg:items-center lg:gap-14">
        <div className="relative overflow-hidden rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--color-paper)] shadow-[var(--shadow-card)] lg:sticky lg:top-24">
          {item.primaryImage ? (
            <ViewTransition
              default="none"
              name={`item-image-${item.id}`}
              share="morph"
            >
              <CatalogueItemImage
                alt={item.primaryImage.altText ?? item.title}
                priority
                src={item.primaryImage.url}
              />
            </ViewTransition>
          ) : (
            <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-[linear-gradient(145deg,_var(--color-brand-soft),_var(--color-paper)_65%,_rgb(166_91_69_/_18%))]">
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
          <span
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[rgb(49_5_12_/_18%)] to-transparent"
            aria-hidden="true"
          />
        </div>

        <div className="py-1 lg:py-8">
          <p className="diary-kicker">
            {categoryName ?? "Một điều được lưu lại"}
          </p>
          <h1 className="font-display mt-4 text-balance text-4xl font-semibold tracking-[-0.06em] text-[var(--color-brand-strong)] sm:text-5xl xl:text-6xl">
            {item.title}
          </h1>

          {item.summary ? (
            <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--color-muted)]">
              {item.summary}
            </p>
          ) : null}

          {item.priceLabel || item.address ? (
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-y border-[var(--color-border)] py-4 text-sm font-semibold text-[var(--color-brand)]">
              {item.priceLabel ? <span>{item.priceLabel}</span> : null}
              {item.address ? (
                <span className="inline-flex items-center gap-1.5">
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
                <p className="diary-kicker text-[var(--color-accent)]">
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

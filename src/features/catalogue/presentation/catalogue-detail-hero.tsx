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
    <section className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
      {/* SaaS Back Button */}
      <Link
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border/50 bg-[var(--surface-elevated)]/70 px-4 text-[13px] font-medium text-brand-strong shadow-sm backdrop-blur-xl transition-all hover:bg-black/5 hover:text-brand"
        href="/#collection"
        transitionTypes={["nav-back"]}
      >
        <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        Trở lại bộ sưu tập
      </Link>

      <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-[5fr_7fr] lg:items-start lg:gap-16">
        {/* Sleek SaaS Image Container (Sticky on Desktop) */}
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-[var(--surface-elevated)] shadow-sm lg:sticky lg:top-28">
          {item.primaryImage ? (
            <ViewTransition
              default="none"
              name={`item-image-${item.id}`}
              share="morph"
            >
              <div className="aspect-[4/5] w-full">
                <CatalogueItemImage
                  alt={item.primaryImage.altText ?? item.title}
                  src={item.primaryImage.url}
                />
              </div>
            </ViewTransition>
          ) : (
            <div className="relative flex aspect-[4/5] w-full items-center justify-center bg-[linear-gradient(145deg,_var(--color-brand-soft),_var(--color-paper)_65%)]">
              <span className="absolute h-48 w-48 rounded-full border border-border/50" aria-hidden="true" />
              <Heart className="relative text-brand/50" fill="currentColor" size={40} strokeWidth={1} aria-hidden="true" />
            </div>
          )}
          {/* Inner gradient overlay for depth */}
          <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-black/10" aria-hidden="true" />
        </div>

        {/* Content Side */}
        <div className="flex flex-col py-2 lg:py-6">
          <div className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            <p className="text-[13px] font-medium uppercase tracking-wider text-accent">
              {categoryName ?? "Một điều được lưu lại"}
            </p>
          </div>
          
          <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-brand-strong sm:text-5xl lg:text-6xl lg:leading-[1.1]">
            {item.title}
          </h1>

          {item.summary ? (
            <p className="mt-6 text-lg leading-relaxed text-muted sm:text-xl">
              {item.summary}
            </p>
          ) : null}

          {/* Bento-style Info Tags */}
          {(item.priceLabel || item.address) ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {item.priceLabel ? (
                <span className="inline-flex h-10 items-center rounded-full bg-brand-strong px-5 text-[14px] font-medium text-white shadow-sm">
                  {item.priceLabel}
                </span>
              ) : null}
              
              {item.address ? (
                <span className="inline-flex h-10 items-center gap-2 rounded-full border border-border/50 bg-[var(--surface-elevated)] px-4 text-[14px] font-medium text-brand-strong shadow-sm">
                  <MapPin size={16} className="text-accent" aria-hidden="true" />
                  {item.address}
                </span>
              ) : null}
            </div>
          ) : null}

          {item.description ? (
            <div className="mt-12 rounded-[2rem] border border-border/60 bg-[var(--color-surface)]/80 p-8 shadow-sm backdrop-blur-xl sm:p-10">
              <div className="flex items-center gap-2 text-accent">
                <Quote size={20} strokeWidth={1.5} aria-hidden="true" />
                <h3 className="text-sm font-semibold uppercase tracking-widest text-accent">Câu chuyện</h3>
              </div>
              <div className="prose prose-brand mt-6 max-w-none text-[15px] leading-loose text-ink sm:text-base">
                {item.description.split('\n').map((paragraph, index) => (
                  paragraph.trim() ? <p key={index}>{paragraph}</p> : <br key={index} />
                ))}
              </div>
            </div>
          ) : null}

          {item.links.length ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {item.links.map((link) => (
                <a
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-border/60 bg-white px-6 text-[14px] font-semibold text-brand-strong shadow-sm transition hover:bg-black/5"
                  href={link.url}
                  key={link.id}
                  rel="noreferrer"
                  target="_blank"
                >
                  {link.title}
                  <ExternalLink size={16} className="text-muted" aria-hidden="true" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

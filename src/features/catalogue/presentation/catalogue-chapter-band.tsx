"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CatalogueChapterPreview } from "@/modules/catalogue/domain/catalogue-read-models";
import { CatalogueItemCard } from "@/features/catalogue/presentation/catalogue-item-card";
import { MediaRailControls } from "@/components/ui/media-rail";

export function CatalogueChapterBand({ preview }: { preview: CatalogueChapterPreview }) {
  const viewportId = `chapter-viewport-${preview.category.slug}`;

  return (
    <section className="mt-16" aria-labelledby={`chapter-heading-${preview.category.slug}`}>
      <div className="diary-container flex items-end justify-between gap-4">
        <div>
          <h2
            id={`chapter-heading-${preview.category.slug}`}
            className="font-display text-2xl font-semibold text-brand-strong"
          >
            {preview.category.name}
          </h2>
          {preview.category.description ? (
            <p className="body-text-sm mt-2 text-muted">{preview.category.description}</p>
          ) : null}
        </div>
        <Link
          className="group flex items-center gap-2 text-sm font-semibold text-brand transition hover:text-brand-strong"
          href={`/catalogue/${preview.category.slug}`}
        >
          Xem tất cả ({preview.totalItems})
          <ArrowRight
            className="transition-transform group-hover:translate-x-0.5"
            size={16}
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="relative mt-6">
        <div
          id={viewportId}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 pt-2 scrollbar-none sm:px-8 lg:px-10"
        >
          {preview.items.map((item) => (
            <div
              key={item.id}
              className="catalogue-chapter-frame w-[18rem] shrink-0 snap-start sm:w-[22rem]"
            >
              <CatalogueItemCard item={item} categoryName={preview.category.name} />
            </div>
          ))}
          {preview.totalItems > preview.items.length ? (
            <div className="catalogue-chapter-frame flex w-[14rem] shrink-0 snap-start items-center justify-center p-6 sm:w-[16rem]">
              <Link
                className="flex flex-col items-center gap-3 text-brand transition-colors hover:text-brand-strong"
                href={`/catalogue/${preview.category.slug}`}
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft">
                  <ArrowRight size={20} aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold">Xem thêm</span>
              </Link>
            </div>
          ) : null}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-center">
          <div className="diary-container relative h-full w-full">
            <MediaRailControls
              frameClassName="catalogue-chapter-frame"
              groupLabel={`Điều hướng chương ${preview.category.name}`}
              nextLabel="Xem mục tiếp theo"
              previousLabel="Xem mục trước"
              viewportId={viewportId}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

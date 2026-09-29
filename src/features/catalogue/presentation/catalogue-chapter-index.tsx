"use client";

import Link from "next/link";
import { useState } from "react";
import { MattedImage } from "@/components/ui/matted-image";
import { createCataloguePath } from "@/features/catalogue/lib/catalogue-navigation";
import type { CatalogueChapterPreview } from "@/modules/catalogue/domain/catalogue-read-models";

interface CatalogueChapterIndexProps {
  chapters: CatalogueChapterPreview[];
}

function previewImage(chapter: CatalogueChapterPreview) {
  if (chapter.category.coverImageUrl) {
    return { url: chapter.category.coverImageUrl, alt: `Ảnh bìa chương ${chapter.category.name}` };
  }
  const image = chapter.items[0]?.primaryImage;
  return image ? { url: image.url, alt: image.altText ?? chapter.items[0].title } : null;
}

/* A table of contents for the collection. On pointer devices the preview
 * column follows hover and keyboard focus alike; on touch screens each row
 * carries its own thumbnail, so nothing depends on hover. */
export function CatalogueChapterIndex({ chapters }: CatalogueChapterIndexProps) {
  const [activeId, setActiveId] = useState(chapters[0]?.category.id ?? null);

  if (!chapters.length) return null;

  const active = chapters.find((chapter) => chapter.category.id === activeId) ?? chapters[0];
  const activeImage = previewImage(active);

  return (
    <div className="grid gap-x-6 lg:grid-cols-12">
      <ol className="border-b border-border-strong pt-px lg:col-span-7" aria-label="Các chương trong bộ sưu tập">
        {chapters.map((chapter, index) => {
          const image = previewImage(chapter);
          return (
            <li className="index-rule reveal-rule" key={chapter.category.id}>
              <Link
                className="index-row group grid min-h-11 grid-cols-[3.5rem_1fr] items-start gap-x-4 gap-y-0.5 py-4 sm:grid-cols-[2.5rem_3.5rem_1fr_auto] sm:items-baseline lg:grid-cols-[3rem_1fr_auto] lg:py-5"
                href={`${createCataloguePath({ categorySlug: chapter.category.slug, page: 1 })}#collection`}
                onFocus={() => setActiveId(chapter.category.id)}
                onMouseEnter={() => setActiveId(chapter.category.id)}
              >
                <span className="index-row__number tabular col-start-2 row-start-1 text-[0.9375rem] font-semibold text-brand sm:col-start-1">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="col-start-1 row-span-3 row-start-1 w-14 sm:col-start-2 sm:row-span-1 lg:hidden">
                  <MattedImage alt="" bare fallbackTitle="" ratio="4/5" src={image?.url ?? null} />
                </span>
                <span className="col-start-2 min-w-0 sm:col-start-3 lg:col-start-2">
                  <span className="block font-display text-[1.375rem] font-medium leading-tight text-brand-strong group-hover:underline group-hover:decoration-1 group-hover:underline-offset-[6px] sm:text-[1.625rem]">
                    {chapter.category.name}
                  </span>
                  {chapter.category.description ? (
                    <span className="mt-1 block text-[0.9375rem] leading-normal text-muted">
                      {chapter.category.description}
                    </span>
                  ) : null}
                </span>
                <span className="tabular col-start-2 text-sm text-muted sm:col-start-4 lg:col-start-3">
                  {chapter.totalItems} điều
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      <figure aria-hidden="true" className="sticky top-28 hidden self-start lg:col-span-4 lg:col-start-9 lg:block 2xl:col-span-3 2xl:col-start-10">
        <div className="fade-swap" key={active.category.id}>
          <MattedImage alt="" fallbackTitle={active.category.name} ratio="4/5" src={activeImage?.url ?? null} />
        </div>
        <figcaption className="mt-2.5 text-sm text-muted">{active.category.name}</figcaption>
      </figure>
    </div>
  );
}

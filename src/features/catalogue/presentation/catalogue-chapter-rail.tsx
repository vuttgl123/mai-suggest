/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { createCataloguePath } from "@/features/catalogue/lib/catalogue-navigation";
import type { CatalogueCategory } from "@/modules/catalogue/domain/catalogue-read-models";

interface CatalogueChapterRailProps {
  categories: CatalogueCategory[];
  query: string | null;
  selectedCategorySlug: string | null;
}

export function CatalogueChapterRail({
  categories,
  query,
  selectedCategorySlug,
}: CatalogueChapterRailProps) {
  return (
    <section aria-labelledby="chapters-heading" className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="diary-kicker">Khám phá theo tâm trạng</p>
          <h2 className="font-display mt-2 text-3xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)]" id="chapters-heading">
            Chọn một chương hôm nay
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
            Mỗi chương là một cách khác để tìm lại điều làm ngày thường trở nên đặc biệt.
          </p>
        </div>
        <Link
          aria-current={selectedCategorySlug === null ? "page" : undefined}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition duration-[var(--duration-fast)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-focus)] ${
            selectedCategorySlug === null
              ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white shadow-[var(--theme-button-shadow)]"
              : "border-[var(--color-border)] bg-[var(--theme-control-surface)] text-[var(--color-brand)] hover:-translate-y-0.5 hover:border-[var(--color-accent)]"
          }`}
          href={createCataloguePath({ categorySlug: null, page: 1, query })}
          scroll={false}
          transitionTypes={["collection-change"]}
        >
          Xem tất cả
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      {categories.length ? (
        <nav aria-label="Chọn chương bộ sưu tập" className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const isActive = category.slug === selectedCategorySlug;

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`group relative isolate min-h-36 overflow-hidden rounded-[var(--radius-card)] border p-4 shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-focus)] ${
                  isActive
                    ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white shadow-[var(--theme-button-shadow)]"
                    : "border-[var(--color-border)] bg-[var(--theme-card-surface)] text-[var(--color-brand-strong)] hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-card)]"
                }`}
                href={createCataloguePath({
                  categorySlug: category.slug,
                  page: 1,
                  query,
                })}
                key={category.id}
                scroll={false}
                transitionTypes={["collection-change"]}
              >
                {category.coverImageUrl ? (
                  <>
                    <img
                      alt=""
                      className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35 transition duration-500 group-hover:scale-105"
                      decoding="async"
                      height={360}
                      loading="lazy"
                      src={category.coverImageUrl}
                      width={520}
                    />
                    <span
                      className={`absolute inset-0 -z-10 bg-[linear-gradient(110deg,_var(--color-paper),rgb(255_249_243_/_58%))] ${
                        isActive ? "opacity-75 mix-blend-screen" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </>
                ) : null}
                <span
                  className={`inline-grid h-9 w-9 place-items-center rounded-full border ${
                    isActive
                      ? "border-white/35 bg-white/15 text-white"
                      : "border-[var(--theme-badge-border)] bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
                  }`}
                  aria-hidden="true"
                >
                  <BookOpen size={16} strokeWidth={1.45} />
                </span>
                <div className="mt-3 pr-6">
                  <p className="font-display text-xl font-semibold tracking-[-0.035em]">{category.name}</p>
                  {category.description ? (
                    <p className={`mt-1.5 line-clamp-2 text-sm leading-6 ${isActive ? "text-white/84" : "text-[var(--color-muted)]"}`}>
                      {category.description}
                    </p>
                  ) : (
                    <p className={`mt-1.5 text-sm font-semibold ${isActive ? "text-white/84" : "text-[var(--color-muted)]"}`}>
                      Mở chương này
                    </p>
                  )}
                </div>
                <ArrowRight
                  className="absolute bottom-4 right-4 transition duration-[var(--duration-fast)] group-hover:translate-x-0.5"
                  size={18}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>
      ) : null}
    </section>
  );
}

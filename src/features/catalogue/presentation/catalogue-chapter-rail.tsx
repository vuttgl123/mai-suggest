 

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
    <section aria-labelledby="chapters-heading" className="w-full">
      <div className="flex flex-col items-center justify-center space-y-6">
        <h2 className="font-display text-2xl font-medium tracking-tight text-brand-strong sm:text-3xl" id="chapters-heading">
          Khám phá bộ sưu tập
        </h2>
        
        {/* SaaS Segmented Tabs - Centered & Scrollable */}
        <div className="relative w-full max-w-4xl">
          <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar py-1">
            <div className="inline-flex flex-nowrap items-center gap-1.5 rounded-2xl bg-[var(--surface-elevated)]/60 p-1.5 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] border border-border/40 backdrop-blur-md">
              <Link
                aria-current={selectedCategorySlug === null ? "page" : undefined}
                className={`relative shrink-0 px-5 py-2.5 text-[14px] font-medium transition-all duration-300 rounded-xl ${
                  selectedCategorySlug === null
                    ? "text-brand-strong bg-white shadow-sm ring-1 ring-border/50"
                    : "text-muted hover:text-brand-strong hover:bg-black/5"
                }`}
                href={createCataloguePath({ categorySlug: null, page: 1, query })}
                scroll={false}
                transitionTypes={["collection-change"]}
              >
                Tất cả
              </Link>
              
              {categories.map((category) => {
                const isActive = category.slug === selectedCategorySlug;
                return (
                  <Link
                    key={category.id}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative shrink-0 px-5 py-2.5 text-[14px] font-medium transition-all duration-300 rounded-xl ${
                      isActive
                        ? "text-brand-strong bg-white shadow-sm ring-1 ring-border/50"
                        : "text-muted hover:text-brand-strong hover:bg-black/5"
                    }`}
                    href={createCataloguePath({
                      categorySlug: category.slug,
                      page: 1,
                      query,
                    })}
                    scroll={false}
                    transitionTypes={["collection-change"]}
                  >
                    {category.name}
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Fading edges for scroll indication on mobile */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[var(--color-paper)] to-transparent sm:hidden" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[var(--color-paper)] to-transparent sm:hidden" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

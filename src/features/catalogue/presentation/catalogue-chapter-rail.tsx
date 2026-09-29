import Link from "next/link";
import { createCataloguePath } from "@/features/catalogue/lib/catalogue-navigation";
import type { CatalogueCategory } from "@/modules/catalogue/domain/catalogue-read-models";

interface CatalogueChapterRailProps {
  categories: CatalogueCategory[];
  query: string | null;
  selectedCategorySlug: string | null;
}

/* Filter chips. Labels are the real category names so the filter stays clear. */
export function CatalogueChapterRail({
  categories,
  query,
  selectedCategorySlug,
}: CatalogueChapterRailProps) {
  const chips = [
    { key: "all", slug: null, name: "Tất cả" },
    ...categories.map((category) => ({ key: category.id, slug: category.slug, name: category.name })),
  ];

  return (
    <nav aria-label="Lọc theo chương" className="-mx-[var(--page-edge)] overflow-x-auto px-[var(--page-edge)] [scrollbar-width:none]">
      <ul className="flex w-max gap-2 py-1">
        {chips.map((chip) => {
          const isActive = chip.slug === selectedCategorySlug;
          return (
            <li key={chip.key}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full border px-4 text-[0.9375rem] font-medium transition-colors ${
                  isActive
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-border-strong text-muted hover:border-brand hover:text-brand"
                }`}
                href={`${createCataloguePath({ categorySlug: chip.slug, page: 1, query })}#collection`}
                transitionTypes={["collection-change"]}
              >
                {chip.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

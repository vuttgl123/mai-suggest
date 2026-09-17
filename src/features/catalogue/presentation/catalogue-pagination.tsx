import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createCataloguePath } from "@/features/catalogue/lib/catalogue-navigation";

interface CataloguePaginationProps {
  categorySlug: string | null;
  page: number;
  pageCount: number;
  query: string | null;
}

export function CataloguePagination({
  categorySlug,
  page,
  pageCount,
  query,
}: CataloguePaginationProps) {
  if (pageCount <= 1) return null;

  const pages = visiblePages(page, pageCount);

  return (
    <div className="mt-16 flex flex-col items-center">
      <p className="text-center text-xs font-medium tracking-wide font-semibold text-xs tracking-wide text-muted">
        Trang {page} / {pageCount}
      </p>
      <nav
        aria-label="Phân trang bộ sưu tập"
        className="mt-4 inline-flex items-center gap-1 rounded-full border border-border/60 bg-[var(--surface-elevated)] p-1.5  backdrop-blur-xl"
      >
        {page > 1 ? (
          <Link
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium text-brand-strong transition hover:bg-black/5 hover:text-brand"
            href={createCataloguePath({ categorySlug, page: page - 1, query })}
            scroll={false}
            transitionTypes={["page-back"]}
          >
            <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
            Trước
          </Link>
        ) : (
          <span className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-full px-4 text-[13px] font-medium text-muted/50">
            <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
            Trước
          </span>
        )}

        <div className="flex items-center gap-0.5 px-2" aria-label={`Trang ${page} trên ${pageCount}`}>
          {pages.map((value) =>
            typeof value === "number" ? (
              <Link
                aria-current={value === page ? "page" : undefined}
                className={`grid h-8 min-w-[2rem] place-items-center rounded-full text-[13px] font-medium transition-all ${
                  value === page
                    ? "bg-brand-strong text-white "
                    : "text-muted hover:bg-black/5 hover:text-brand-strong"
                }`}
                href={createCataloguePath({ categorySlug, page: value, query })}
                key={value}
                scroll={false}
                transitionTypes={[value > page ? "page-forward" : "page-back"]}
              >
                {value}
              </Link>
            ) : (
              <span className="grid h-8 min-w-[1.5rem] place-items-center text-[13px] text-muted/50" key={value}>
                …
              </span>
            ),
          )}
        </div>

        {page < pageCount ? (
          <Link
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-medium text-brand-strong transition hover:bg-black/5 hover:text-brand"
            href={createCataloguePath({ categorySlug, page: page + 1, query })}
            scroll={false}
            transitionTypes={["page-forward"]}
          >
            Sau
            <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
          </Link>
        ) : (
          <span className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-full px-4 text-[13px] font-medium text-muted/50">
            Sau
            <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
          </span>
        )}
      </nav>
    </div>
  );
}

function visiblePages(page: number, pageCount: number): Array<number | string> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const candidates = [1, page - 1, page, page + 1, pageCount]
    .filter((candidate) => candidate >= 1 && candidate <= pageCount)
    .filter((candidate, index, array) => array.indexOf(candidate) === index)
    .sort((left, right) => left - right);
  const values: Array<number | string> = [];

  for (const candidate of candidates) {
    const previous = values.at(-1);
    if (typeof previous === "number" && candidate - previous > 1) {
      values.push(`ellipsis-${candidate}`);
    }
    values.push(candidate);
  }

  return values;
}

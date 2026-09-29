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

  const linkClassName =
    "inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-[0.9375rem] font-semibold text-brand underline decoration-1 underline-offset-[5px] hover:decoration-2";

  return (
    <nav
      aria-label="Phân trang bộ sưu tập"
      className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="tabular text-[0.9375rem] text-muted">
        Trang {page} trên {pageCount}
      </p>
      <ul className="flex flex-wrap items-center gap-1">
        {pages.map((value) =>
          typeof value === "number" ? (
            <li key={value}>
              <Link
                aria-current={value === page ? "page" : undefined}
                aria-label={`Trang ${value}`}
                className={`tabular grid h-11 min-w-11 place-items-center rounded-full px-2 text-[0.9375rem] transition-colors ${
                  value === page
                    ? "bg-brand-soft font-semibold text-brand"
                    : "text-muted hover:bg-brand-soft hover:text-brand"
                }`}
                href={createCataloguePath({ categorySlug, page: value, query })}
                scroll={false}
                transitionTypes={[value > page ? "page-forward" : "page-back"]}
              >
                {value}
              </Link>
            </li>
          ) : (
            <li aria-hidden="true" className="grid h-11 min-w-8 place-items-center text-muted" key={value}>
              …
            </li>
          ),
        )}
      </ul>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            className={linkClassName}
            href={createCataloguePath({ categorySlug, page: page - 1, query })}
            scroll={false}
            transitionTypes={["page-back"]}
          >
            <ChevronLeft aria-hidden="true" size={16} strokeWidth={1.5} />
            Trang trước
          </Link>
        ) : null}
        {page < pageCount ? (
          <Link
            className={linkClassName}
            href={createCataloguePath({ categorySlug, page: page + 1, query })}
            scroll={false}
            transitionTypes={["page-forward"]}
          >
            Trang sau
            <ChevronRight aria-hidden="true" size={16} strokeWidth={1.5} />
          </Link>
        ) : null}
      </div>
    </nav>
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

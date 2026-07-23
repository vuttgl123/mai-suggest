import { ChevronLeft, ChevronRight } from "lucide-react";
import { NavigationLink } from "@/components/ui/navigation-link";
import { createCataloguePath } from "@/features/catalogue/lib/catalogue-navigation";

interface CataloguePaginationProps {
  categorySlug: string | null;
  page: number;
  pageCount: number;
}

export function CataloguePagination({
  categorySlug,
  page,
  pageCount,
}: CataloguePaginationProps) {
  if (pageCount <= 1) return null;

  const pages = visiblePages(page, pageCount);

  return (
    <div className="mt-8">
      <p className="text-center text-sm leading-6 text-[var(--color-muted)]">
        Xem thêm những điều đã lưu
      </p>
      <nav
        aria-label="Phân trang bộ sưu tập"
        className="mt-3 flex flex-wrap items-center justify-center gap-2"
      >
        {page > 1 ? (
          <NavigationLink
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-4 text-sm font-semibold text-[var(--color-brand)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)]"
            href={createCataloguePath({ categorySlug, page: page - 1 })}
            transitionTypes={["page-back"]}
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Trước
          </NavigationLink>
        ) : (
          <span className="inline-flex min-h-11 cursor-not-allowed items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-muted)] opacity-45">
            <ChevronLeft size={16} aria-hidden="true" />
            Trước
          </span>
        )}

        <div className="flex items-center gap-1" aria-label={`Trang ${page} trên ${pageCount}`}>
          {pages.map((value) =>
            typeof value === "number" ? (
              <NavigationLink
                aria-current={value === page ? "page" : undefined}
                className={`grid h-11 min-w-11 place-items-center rounded-full px-3 text-sm font-semibold transition ${
                  value === page
                    ? "bg-[var(--color-brand)] text-white shadow-[0_8px_18px_rgb(49_5_12_/_22%)]"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand)]"
                }`}
                href={createCataloguePath({ categorySlug, page: value })}
                key={value}
                transitionTypes={[value > page ? "page-forward" : "page-back"]}
              >
                {value}
              </NavigationLink>
            ) : (
              <span className="grid h-11 min-w-7 place-items-center text-sm text-[var(--color-muted)]" key={value}>
                …
              </span>
            ),
          )}
        </div>

        {page < pageCount ? (
          <NavigationLink
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-4 text-sm font-semibold text-[var(--color-brand)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)]"
            href={createCataloguePath({ categorySlug, page: page + 1 })}
            transitionTypes={["page-forward"]}
          >
            Sau
            <ChevronRight size={16} aria-hidden="true" />
          </NavigationLink>
        ) : (
          <span className="inline-flex min-h-11 cursor-not-allowed items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-muted)] opacity-45">
            Sau
            <ChevronRight size={16} aria-hidden="true" />
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

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FutureLetterPaginationProps {
  currentPage: number;
  hasMore: boolean;
  query: string;
}

function mailboxPath(page: number, query: string): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const serialized = params.toString();
  return serialized ? `/thu-hen-ngay-mo?${serialized}` : "/thu-hen-ngay-mo";
}

const linkClassName =
  "inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-[0.9375rem] font-semibold text-brand underline decoration-1 underline-offset-[5px] hover:decoration-2";

export function FutureLetterPagination({ currentPage, hasMore, query }: FutureLetterPaginationProps) {
  if (currentPage === 1 && !hasMore) return null;

  return (
    <nav
      aria-label="Phân trang hòm thư"
      className="mt-12 flex max-w-4xl flex-wrap items-center justify-between gap-4 border-t border-border pt-5"
    >
      <p className="tabular text-[0.9375rem] text-muted">Trang {currentPage}</p>
      <div className="flex gap-2">
        {currentPage > 1 ? (
          <Link className={linkClassName} href={mailboxPath(currentPage - 1, query)} scroll={false}>
            <ChevronLeft aria-hidden="true" size={16} strokeWidth={1.5} />
            Trang trước
          </Link>
        ) : null}
        {hasMore ? (
          <Link className={linkClassName} href={mailboxPath(currentPage + 1, query)} scroll={false}>
            Trang sau
            <ChevronRight aria-hidden="true" size={16} strokeWidth={1.5} />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

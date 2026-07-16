import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  firstItem: number;
  lastItem: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function ProductPagination({
  currentPage,
  totalPages,
  firstItem,
  lastItem,
  totalItems,
  onPageChange,
}: ProductPaginationProps) {
  return (
    <nav
      aria-label="Phân trang gợi ý quà"
      className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#5a0d18]/10 pt-5"
    >
      <p className="text-[0.68rem] text-[#765e62]">
        Gợi ý <strong className="font-semibold text-[#5a0d18]">{firstItem}-{lastItem}</strong> trong {totalItems} món
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Trang gợi ý trước"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#5a0d18]/15 bg-[#fffaf4] text-[#5a0d18] transition hover:border-[#c8a96b] disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span className="min-w-20 text-center text-xs font-semibold text-[#5a0d18]" aria-live="polite">
          Trang {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Trang gợi ý tiếp theo"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#5a0d18]/15 bg-[#fffaf4] text-[#5a0d18] transition hover:border-[#c8a96b] disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

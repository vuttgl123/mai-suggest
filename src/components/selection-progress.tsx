import { ArrowUpRight, Gift } from "lucide-react";

interface SelectionProgressProps {
  selectedCategoryCount: number;
  totalCategoryCount: number;
  selectedItemCount: number;
  onViewSummary: () => void;
}

export function SelectionProgress({
  selectedCategoryCount,
  totalCategoryCount,
  selectedItemCount,
  onViewSummary,
}: SelectionProgressProps) {
  const percentage = totalCategoryCount
    ? (selectedCategoryCount / totalCategoryCount) * 100
    : 0;

  return (
    <aside className="paper-card relative mx-auto mb-10 max-w-[78rem] overflow-hidden rounded-[1.25rem] border border-[#5a0d18]/10 bg-[#fffaf4] px-5 py-5 sm:px-7 md:mb-12 md:flex md:items-center md:justify-between md:gap-8">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[#7a1425]">
          <Gift size={16} aria-hidden="true" />
          <p className="text-xs font-semibold uppercase tracking-[0.14em]">Danh sách gợi ý của em</p>
        </div>
        <p className="mt-2 font-display text-2xl font-semibold text-[#31080e] sm:text-3xl">
          Em đã chọn quà ở {selectedCategoryCount}/{totalCategoryCount} mục
        </p>
        <p className="mt-1 text-xs leading-5 text-[#765e62]">
          {selectedItemCount} gợi ý đã được lưu · Không cần chọn đủ tất cả
        </p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e8d5d7]/65" aria-hidden="true">
          <div
            className="h-full rounded-full bg-[#7a1425] transition-[width] duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={onViewSummary}
        disabled={selectedItemCount === 0 && selectedCategoryCount === 0}
        className="mt-5 flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#5a0d18] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7a1425] disabled:cursor-not-allowed disabled:opacity-45 md:mt-0 md:w-auto"
      >
        Xem lựa chọn
        <ArrowUpRight size={17} aria-hidden="true" />
      </button>
    </aside>
  );
}

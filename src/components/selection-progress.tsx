import { ArrowUpRight, Gift } from "lucide-react";
import type { SelectionProgressModel } from "@/features/selection/lib/selection-progress";
import { Button } from "./ui/button";

interface SelectionProgressProps {
  model: SelectionProgressModel;
  onViewSummary: () => void;
  onExploreNext: () => void;
}

export function SelectionProgress({
  model,
  onViewSummary,
  onExploreNext,
}: SelectionProgressProps) {
  const percentage = model.totalCategoryCount
    ? (model.selectedCategoryCount / model.totalCategoryCount) * 100
    : 0;
  const hasSelection =
    model.selectedItemCount > 0 || model.selectedCategoryCount > 0;

  return (
    <aside className="relative mx-auto mb-10 max-w-[78rem] border-y border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-5 sm:px-7 md:mb-12 md:flex md:items-center md:justify-between md:gap-8">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[var(--color-positive)]">
          <Gift size={16} aria-hidden="true" />
          <p className="text-xs font-semibold">Danh sách gợi ý của em</p>
        </div>
        <p className="mt-2 font-display text-2xl font-semibold tracking-normal text-[var(--color-brand-strong)] sm:text-3xl">
          {hasSelection
            ? `Đã lưu lựa chọn ở ${model.selectedCategoryCount} danh mục`
            : `Bắt đầu với ${model.nextCategory?.name ?? "một danh mục"}`}
        </p>
        <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
          {hasSelection
            ? `${model.selectedItemCount} gợi ý đã lưu. Không cần chọn đủ mọi danh mục.`
            : "Chọn một gợi ý phù hợp trước; có thể xem tổng kết bất cứ lúc nào."}
        </p>
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-sm bg-[var(--color-skeleton)]"
          role="progressbar"
          aria-label="Tiến độ khám phá danh mục"
          aria-valuemin={0}
          aria-valuemax={model.totalCategoryCount}
          aria-valuenow={model.selectedCategoryCount}
        >
          <div
            className="h-full rounded-sm bg-[var(--color-positive)] transition-[width] duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <Button
        onClick={hasSelection ? onViewSummary : onExploreNext}
        className="mt-5 min-h-12 w-full shrink-0 px-6 md:mt-0 md:w-auto"
      >
        {hasSelection ? "Xem lựa chọn" : "Khám phá danh mục"}
        <ArrowUpRight size={17} aria-hidden="true" />
      </Button>
    </aside>
  );
}

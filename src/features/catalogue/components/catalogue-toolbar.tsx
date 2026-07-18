import { Heart, SlidersHorizontal } from "lucide-react";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";

interface CatalogueToolbarProps {
  activeCategoryName: string;
  resultCount: number;
  activeFilterCount: number;
  selectedItemCount: number;
  viewMode: "all" | "selected";
  onViewModeChange(mode: "all" | "selected"): void;
  onOpenFilters(): void;
  onOpenSelection(): void;
}

export function CatalogueToolbar({
  activeCategoryName,
  resultCount,
  activeFilterCount,
  selectedItemCount,
  viewMode,
  onViewModeChange,
  onOpenFilters,
  onOpenSelection,
}: CatalogueToolbarProps): ReactElement {
  const filterLabel = activeFilterCount
    ? `Mở ${activeFilterCount} bộ lọc đang dùng`
    : "Mở bộ lọc";
  const selectionLabel = selectedItemCount
    ? `Xem ${selectedItemCount} lựa chọn`
    : "Chưa có lựa chọn";

  return (
    <section
      aria-label="Công cụ danh mục"
      className="hidden border-t border-[var(--color-border)] bg-[var(--color-paper)] md:block"
    >
      <div className="mx-auto flex min-h-12 max-w-[78rem] items-center gap-3 px-8">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
            {activeCategoryName}
          </p>
          <p className="text-xs tabular-nums text-[var(--color-muted)]">
            {resultCount} gợi ý
          </p>
        </div>
        <div
          className="flex rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5"
          aria-label="Chế độ hiển thị"
        >
          <button
            type="button"
            aria-pressed={viewMode === "all"}
            onClick={() => onViewModeChange("all")}
            className={`min-h-10 rounded-[4px] px-3 text-xs font-semibold ${
              viewMode === "all"
                ? "bg-white text-[var(--color-ink)] shadow-sm"
                : "text-[var(--color-muted)]"
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            aria-pressed={viewMode === "selected"}
            onClick={() => onViewModeChange("selected")}
            className={`min-h-10 rounded-[4px] px-3 text-xs font-semibold ${
              viewMode === "selected"
                ? "bg-white text-[var(--color-ink)] shadow-sm"
                : "text-[var(--color-muted)]"
            }`}
          >
            Đã chọn
          </button>
        </div>
        <Button
          variant="quiet"
          size="compact"
          onClick={onOpenFilters}
          aria-label={filterLabel}
        >
          <SlidersHorizontal size={16} aria-hidden="true" />
          Bộ lọc
          {activeFilterCount > 0 && (
            <span className="tabular-nums">{activeFilterCount}</span>
          )}
        </Button>
        <Button
          variant="quiet"
          size="compact"
          onClick={onOpenSelection}
          disabled={selectedItemCount === 0}
          aria-label={selectionLabel}
        >
          <Heart size={16} aria-hidden="true" />
          Lựa chọn
          {selectedItemCount > 0 && (
            <span className="tabular-nums">{selectedItemCount}</span>
          )}
        </Button>
      </div>
    </section>
  );
}

import { SlidersHorizontal, X } from "lucide-react";
import { useRef, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import type { CatalogueFilters } from "@/features/catalogue/lib/catalogue-query";
import type {
  BudgetTier,
  GiftType,
  PreferenceTaxonomy,
} from "@/types/preference";
import { FilterControls } from "./filter-controls";

interface FilterDrawerProps {
  open: boolean;
  taxonomy: PreferenceTaxonomy;
  filters: CatalogueFilters;
  resultCount: number;
  onClose(): void;
  onClear(): void;
  onToggleOccasion(id: string): void;
  onStyleChange(id: string): void;
  onBudgetChange(id: BudgetTier | ""): void;
  onGiftTypeChange(id: GiftType | ""): void;
}

export function FilterDrawer({
  open,
  taxonomy,
  filters,
  resultCount,
  onClose,
  onClear,
  onToggleOccasion,
  onStyleChange,
  onBudgetChange,
  onGiftTypeChange,
}: FilterDrawerProps): ReactElement {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      open={open}
      titleId="filter-drawer-title"
      descriptionId="filter-drawer-description"
      onClose={onClose}
      initialFocusRef={closeButtonRef}
      panelClassName="flex max-h-[92svh] max-w-xl flex-col"
    >
      <header className="flex items-start gap-3 border-b border-[var(--color-border)] px-4 py-4">
        <SlidersHorizontal
          className="mt-1 text-[var(--color-brand)]"
          size={18}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h2 id="filter-drawer-title" className="text-lg font-semibold text-[var(--color-ink)]">
            Bộ lọc gợi ý
          </h2>
          <p id="filter-drawer-description" className="mt-1 text-xs text-[var(--color-muted)]">
            Chọn điều phù hợp rồi xem kết quả ngay.
          </p>
        </div>
        <IconButton
          ref={closeButtonRef}
          label="Đóng bộ lọc"
          icon={<X size={18} aria-hidden="true" />}
          onClick={onClose}
        />
      </header>
      <div className="summary-scroll flex-1 overflow-y-auto px-4 py-5">
        <FilterControls
          idPrefix="mobile-filter"
          taxonomy={taxonomy}
          filters={filters}
          onToggleOccasion={onToggleOccasion}
          onStyleChange={onStyleChange}
          onBudgetChange={onBudgetChange}
          onGiftTypeChange={onGiftTypeChange}
        />
      </div>
      <footer className="grid grid-cols-2 gap-2 border-t border-[var(--color-border)] bg-[var(--color-paper)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        <Button variant="secondary" onClick={onClear}>
          Xóa bộ lọc
        </Button>
        <Button onClick={onClose}>
          Áp dụng <span className="tabular-nums">({resultCount})</span>
        </Button>
      </footer>
    </Dialog>
  );
}

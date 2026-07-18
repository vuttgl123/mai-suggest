import { X } from "lucide-react";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import type { CatalogueFilters } from "@/features/catalogue/lib/catalogue-query";
import type {
  BudgetTier,
  GiftType,
  PreferenceCollection,
  PreferenceTaxonomy,
} from "@/types/preference";

interface ActiveFilterListProps {
  taxonomy: PreferenceTaxonomy;
  collections: PreferenceCollection[];
  filters: CatalogueFilters;
  onQueryChange(value: string): void;
  onToggleOccasion(id: string): void;
  onStyleChange(id: string): void;
  onBudgetChange(id: BudgetTier | ""): void;
  onGiftTypeChange(id: GiftType | ""): void;
  onSelectCollection(id: string): void;
  onClear(): void;
}

export function ActiveFilterList({
  taxonomy,
  collections,
  filters,
  onQueryChange,
  onToggleOccasion,
  onStyleChange,
  onBudgetChange,
  onGiftTypeChange,
  onSelectCollection,
  onClear,
}: ActiveFilterListProps): ReactElement | null {
  const entries: Array<{
    key: string;
    label: string;
    removeLabel: string;
    remove(): void;
  }> = [];
  const collection = collections.find((item) => item.id === filters.collectionId);

  if (filters.query.trim()) {
    entries.push({
      key: "query",
      label: `Tìm: ${filters.query.trim()}`,
      removeLabel: `Bỏ từ khóa tìm kiếm ${filters.query.trim()}`,
      remove: () => onQueryChange(""),
    });
  }
  if (collection) {
    entries.push({
      key: "collection",
      label: collection.name,
      removeLabel: `Bỏ bộ sưu tập ${collection.name}`,
      remove: () => onSelectCollection(""),
    });
  } else {
    for (const occasionId of filters.occasionIds) {
      const option = taxonomy.occasions.find((item) => item.id === occasionId);
      if (option) {
        entries.push({
          key: `occasion-${option.id}`,
          label: option.label,
          removeLabel: `Bỏ bộ lọc dịp ${option.label}`,
          remove: () => onToggleOccasion(option.id),
        });
      }
    }
  }

  const style = taxonomy.styles.find((item) => item.id === filters.styleId);
  if (style) {
    entries.push({
      key: "style",
      label: style.label,
      removeLabel: `Bỏ bộ lọc phong cách ${style.label}`,
      remove: () => onStyleChange(""),
    });
  }
  const budget = taxonomy.budgets.find((item) => item.id === filters.budgetTier);
  if (budget) {
    entries.push({
      key: "budget",
      label: budget.label,
      removeLabel: `Bỏ bộ lọc ngân sách ${budget.label}`,
      remove: () => onBudgetChange(""),
    });
  }
  const giftType = taxonomy.giftTypes.find(
    (item) => item.id === filters.giftType,
  );
  if (giftType) {
    entries.push({
      key: "gift-type",
      label: giftType.label,
      removeLabel: `Bỏ bộ lọc loại quà ${giftType.label}`,
      remove: () => onGiftTypeChange(""),
    });
  }

  if (entries.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Bộ lọc đang dùng">
      {entries.map((entry) => (
        <button
          key={entry.key}
          type="button"
          onClick={entry.remove}
          aria-label={entry.removeLabel}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--color-positive)] bg-[#edf3ef] px-3 text-xs font-semibold text-[var(--color-positive)]"
        >
          {entry.label}
          <X size={14} aria-hidden="true" />
        </button>
      ))}
      {entries.length >= 2 && (
        <Button variant="quiet" size="compact" onClick={onClear}>
          Xóa tất cả
        </Button>
      )}
    </div>
  );
}

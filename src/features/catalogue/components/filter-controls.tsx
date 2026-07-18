import type { ReactElement } from "react";
import { FilterChip } from "@/components/ui/filter-chip";
import { FieldLabel, SelectControl } from "@/components/ui/form-control";
import type { CatalogueFilters } from "@/features/catalogue/lib/catalogue-query";
import type {
  BudgetTier,
  GiftType,
  PreferenceTaxonomy,
} from "@/types/preference";

interface FilterControlsProps {
  idPrefix: string;
  taxonomy: PreferenceTaxonomy;
  filters: CatalogueFilters;
  onToggleOccasion(occasionId: string): void;
  onStyleChange(styleId: string): void;
  onBudgetChange(budgetTier: BudgetTier | ""): void;
  onGiftTypeChange(giftType: GiftType | ""): void;
}

export function FilterControls({
  idPrefix,
  taxonomy,
  filters,
  onToggleOccasion,
  onStyleChange,
  onBudgetChange,
  onGiftTypeChange,
}: FilterControlsProps): ReactElement {
  return (
    <div>
      <fieldset className="min-w-0">
        <legend className="text-xs font-semibold text-[var(--color-muted)]">
          Dịp
        </legend>
        <div className="hide-scrollbar mt-3 flex w-full min-w-0 gap-2 overflow-x-auto pb-1">
          {taxonomy.occasions.map((occasion) => (
            <FilterChip
              key={occasion.id}
              selected={filters.occasionIds.includes(occasion.id)}
              onClick={() => onToggleOccasion(occasion.id)}
            >
              {occasion.label}
            </FilterChip>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <FieldLabel htmlFor={`${idPrefix}-style`}>Phong cách</FieldLabel>
          <SelectControl
            id={`${idPrefix}-style`}
            name={`${idPrefix}-style`}
            autoComplete="off"
            value={filters.styleId}
            onChange={(event) => onStyleChange(event.target.value)}
          >
            <option value="">Tất cả phong cách</option>
            {taxonomy.styles.map((style) => (
              <option key={style.id} value={style.id}>
                {style.label}
              </option>
            ))}
          </SelectControl>
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor={`${idPrefix}-budget`}>Ngân sách</FieldLabel>
          <SelectControl
            id={`${idPrefix}-budget`}
            name={`${idPrefix}-budget`}
            autoComplete="off"
            value={filters.budgetTier}
            onChange={(event) =>
              onBudgetChange(event.target.value as BudgetTier | "")
            }
          >
            <option value="">Mọi mức ngân sách</option>
            {taxonomy.budgets.map((budget) => (
              <option key={budget.id} value={budget.id}>
                {budget.label}
              </option>
            ))}
          </SelectControl>
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor={`${idPrefix}-gift-type`}>Loại quà</FieldLabel>
          <SelectControl
            id={`${idPrefix}-gift-type`}
            name={`${idPrefix}-gift-type`}
            autoComplete="off"
            value={filters.giftType}
            onChange={(event) =>
              onGiftTypeChange(event.target.value as GiftType | "")
            }
          >
            <option value="">Tất cả loại quà</option>
            {taxonomy.giftTypes.map((giftType) => (
              <option key={giftType.id} value={giftType.id}>
                {giftType.label}
              </option>
            ))}
          </SelectControl>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useState, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import type {
  CatalogueFilters,
  CatalogueSort,
} from "@/features/catalogue/lib/catalogue-query";
import type {
  BudgetTier,
  GiftType,
  PreferenceCollection,
  PreferenceTaxonomy,
} from "@/types/preference";
import { ActiveFilterList } from "./active-filter-list";
import { CatalogueSortMenu } from "./catalogue-sort-menu";
import { CollectionPicker } from "./collection-picker";
import { FilterControls } from "./filter-controls";
import { FilterDrawer } from "./filter-drawer";

interface CatalogueDiscoveryProps {
  taxonomy: PreferenceTaxonomy;
  collections: PreferenceCollection[];
  filters: CatalogueFilters;
  resultCount: number;
  totalItemCount: number;
  activeFilterCount: number;
  onQueryChange(query: string): void;
  onToggleOccasion(occasionId: string): void;
  onStyleChange(styleId: string): void;
  onBudgetChange(budgetTier: BudgetTier | ""): void;
  onGiftTypeChange(giftType: GiftType | ""): void;
  onSelectCollection(collectionId: string): void;
  onSortChange(sort: CatalogueSort): void;
  onClear(): void;
}

export function CatalogueDiscovery({
  taxonomy,
  collections,
  filters,
  resultCount,
  totalItemCount,
  activeFilterCount,
  onQueryChange,
  onToggleOccasion,
  onStyleChange,
  onBudgetChange,
  onGiftTypeChange,
  onSelectCollection,
  onSortChange,
  onClear,
}: CatalogueDiscoveryProps): ReactElement {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <section
      id="discovery"
      className="border-b border-[var(--color-border)] bg-[var(--color-paper)] px-4 py-10 sm:px-8 sm:py-14"
      aria-labelledby="discovery-title"
    >
      <div className="mx-auto w-full min-w-0 max-w-[78rem]">
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold text-[var(--color-accent)]">
              Tìm theo tình huống hoặc tiêu chí
            </p>
            <h2
              id="discovery-title"
              className="font-display display-lg text-balance mt-2 font-semibold text-[var(--color-brand-strong)]"
            >
              Tìm gợi ý phù hợp
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--color-muted)] lg:justify-self-end">
            Chọn một bộ sưu tập có sẵn hoặc lọc theo dịp, phong cách, ngân sách và loại quà.
          </p>
        </div>

        <CollectionPicker
          collections={collections}
          selectedId={filters.collectionId}
          onSelect={onSelectCollection}
        />

        <div className="mt-8 min-w-0 border-y border-[var(--color-border)] py-5">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                size={18}
                aria-hidden="true"
              />
              <label htmlFor="catalogue-search" className="sr-only">
                Tìm kiếm gợi ý quà
              </label>
              <input
                id="catalogue-search"
                name="catalogue-search"
                autoComplete="off"
                type="search"
                value={filters.query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Tên, thương hiệu hoặc cảm xúc…"
                className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-white py-2.5 pl-10 pr-3 text-base text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)]"
              />
            </div>
            <div className="grid grid-cols-[1fr_auto] items-end gap-2">
              <CatalogueSortMenu value={filters.sort} onChange={onSortChange} />
              <Button
                variant="secondary"
                onClick={() => setDrawerOpen(true)}
                className="md:hidden"
                aria-label="Mở bộ lọc"
              >
                <SlidersHorizontal size={17} aria-hidden="true" />
                <span className="tabular-nums">{activeFilterCount}</span>
              </Button>
            </div>
          </div>

          <ActiveFilterList
            taxonomy={taxonomy}
            collections={collections}
            filters={filters}
            onQueryChange={onQueryChange}
            onToggleOccasion={onToggleOccasion}
            onStyleChange={onStyleChange}
            onBudgetChange={onBudgetChange}
            onGiftTypeChange={onGiftTypeChange}
            onSelectCollection={onSelectCollection}
            onClear={onClear}
          />

          <div className="mt-5 hidden md:block">
            <FilterControls
              idPrefix="desktop-filter"
              taxonomy={taxonomy}
              filters={filters}
              onToggleOccasion={onToggleOccasion}
              onStyleChange={onStyleChange}
              onBudgetChange={onBudgetChange}
              onGiftTypeChange={onGiftTypeChange}
            />
          </div>

          <p className="mt-5 text-sm text-[var(--color-muted)]" aria-live="polite">
            <strong className="font-semibold tabular-nums text-[var(--color-brand)]">
              {resultCount}/{totalItemCount} gợi ý
            </strong>{" "}
            phù hợp
          </p>
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        taxonomy={taxonomy}
        filters={filters}
        resultCount={resultCount}
        onClose={() => setDrawerOpen(false)}
        onClear={onClear}
        onToggleOccasion={onToggleOccasion}
        onStyleChange={onStyleChange}
        onBudgetChange={onBudgetChange}
        onGiftTypeChange={onGiftTypeChange}
      />
    </section>
  );
}

"use client";

import { Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import type { CatalogueFilters } from "@/hooks/use-catalogue-discovery";
import type {
  BudgetTier,
  GiftType,
  PreferenceCollection,
  PreferenceTaxonomy,
} from "@/types/preference";
import { SmartImage } from "./smart-image";

interface CatalogueDiscoveryProps {
  taxonomy: PreferenceTaxonomy;
  collections: PreferenceCollection[];
  filters: CatalogueFilters;
  resultCount: number;
  totalItemCount: number;
  activeFilterCount: number;
  onQueryChange: (query: string) => void;
  onToggleOccasion: (occasionId: string) => void;
  onStyleChange: (styleId: string) => void;
  onBudgetChange: (budgetTier: BudgetTier | "") => void;
  onGiftTypeChange: (giftType: GiftType | "") => void;
  onSelectCollection: (collectionId: string) => void;
  onClear: () => void;
}

const selectClassName =
  "min-h-12 w-full appearance-none rounded-2xl border border-[#5a0d18]/14 bg-white px-4 py-3 text-sm font-medium text-[#31080e] outline-none transition focus:border-[#7a1425] focus:ring-2 focus:ring-[#7a1425]/15";

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
  onClear,
}: CatalogueDiscoveryProps) {
  return (
    <section
      id="discovery"
      className="relative z-10 border-b border-[#5a0d18]/10 bg-[#fffaf4] px-4 py-12 sm:px-8 sm:py-16"
      aria-labelledby="discovery-title"
    >
      <div className="mx-auto max-w-[78rem]">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#7b5b2d]">
              <Sparkles size={15} aria-hidden="true" />
              Bắt đầu từ điều em đang nghĩ
            </p>
            <h2
              id="discovery-title"
              className="font-display text-balance mt-3 text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-[#31080e]"
            >
              Tìm một gợi ý thật đúng lúc
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[#654f53] lg:justify-self-end lg:text-base lg:leading-8">
            Chọn một câu chuyện có sẵn hoặc kết hợp dịp, phong cách, ngân sách và loại quà. Mọi bộ lọc chỉ là gợi ý để mình hiểu nhau hơn.
          </p>
        </div>

        <div
          className="hide-scrollbar mt-8 grid auto-cols-[84%] grid-flow-col gap-4 overflow-x-auto pb-2 sm:auto-cols-[46%] lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible"
          aria-label="Bộ sưu tập theo tình huống"
        >
          {collections.map((collection, index) => {
            const isActive = filters.collectionId === collection.id;
            return (
              <button
                key={collection.id}
                type="button"
                aria-pressed={isActive}
                onClick={() =>
                  onSelectCollection(isActive ? "" : collection.id)
                }
                className={`group relative min-h-64 overflow-hidden rounded-[1.5rem] border text-left shadow-[0_16px_45px_rgba(49,8,14,0.09)] transition duration-300 hover:-translate-y-1 focus-visible:outline-offset-4 lg:min-h-72 ${
                  isActive
                    ? "border-[#c8a96b] ring-2 ring-[#7a1425] ring-offset-2 ring-offset-[#fffaf4]"
                    : "border-white/30"
                } ${index === 0 ? "lg:col-span-2" : ""}`}
              >
                <SmartImage
                  src={collection.imageUrl}
                  alt={collection.imageAlt}
                  variant="hero"
                  sizes={
                    index === 0
                      ? "(max-width: 1023px) 84vw, 52vw"
                      : "(max-width: 1023px) 84vw, 26vw"
                  }
                  className="absolute inset-0"
                  imageClassName="transition-transform duration-700 group-hover:scale-[1.035]"
                />
                <span
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,3,7,0.05)_10%,rgba(30,4,8,0.82)_100%)]"
                  aria-hidden="true"
                />
                <span className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#efdca7]">
                    {String(collection.itemIds.length).padStart(2, "0")} gợi ý tuyển chọn
                  </span>
                  <span className="font-display mt-2 block text-3xl font-semibold leading-none tracking-[-0.03em] sm:text-4xl">
                    {collection.name}
                  </span>
                  <span className="mt-3 block max-w-lg text-sm leading-6 text-white/82">
                    {collection.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-10 rounded-[1.75rem] border border-[#5a0d18]/10 bg-[#f8f1e8] p-4 shadow-[0_18px_50px_rgba(49,8,14,0.05)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[#5a0d18]">
              <SlidersHorizontal size={18} aria-hidden="true" />
              <h3 className="text-sm font-semibold">Tinh chỉnh theo ý em</h3>
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-[#6b1624] transition hover:bg-[#e8d5d7]/55"
              >
                <X size={15} aria-hidden="true" />
                Xóa {activeFilterCount} bộ lọc
              </button>
            )}
          </div>

          <div className="relative mt-5">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#765e62]"
              size={19}
              aria-hidden="true"
            />
            <label htmlFor="catalogue-search" className="sr-only">
              Tìm kiếm gợi ý quà
            </label>
            <input
              id="catalogue-search"
              type="search"
              value={filters.query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Tìm theo tên, thương hiệu, cảm xúc..."
              className="min-h-13 w-full rounded-2xl border border-[#5a0d18]/14 bg-white py-3 pl-12 pr-4 text-base text-[#2a171a] outline-none placeholder:text-[#765e62] focus:border-[#7a1425] focus:ring-2 focus:ring-[#7a1425]/15"
            />
          </div>

          <fieldset className="mt-5">
            <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-[#654f53]">
              Dịp của mình
            </legend>
            <div className="hide-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
              {taxonomy.occasions.map((occasion) => {
                const isSelected = filters.occasionIds.includes(occasion.id);
                return (
                  <button
                    key={occasion.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onToggleOccasion(occasion.id)}
                    className={`min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      isSelected
                        ? "border-[#5a0d18] bg-[#5a0d18] text-white"
                        : "border-[#5a0d18]/14 bg-white text-[#5a0d18] hover:border-[#b28d4d]"
                    }`}
                  >
                    {occasion.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <label className="space-y-2 text-xs font-semibold text-[#654f53]">
              Phong cách
              <select
                value={filters.styleId}
                onChange={(event) => onStyleChange(event.target.value)}
                className={selectClassName}
              >
                <option value="">Tất cả phong cách</option>
                {taxonomy.styles.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-xs font-semibold text-[#654f53]">
              Ngân sách
              <select
                value={filters.budgetTier}
                onChange={(event) =>
                  onBudgetChange(event.target.value as BudgetTier | "")
                }
                className={selectClassName}
              >
                <option value="">Mọi mức ngân sách</option>
                {taxonomy.budgets.map((budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-xs font-semibold text-[#654f53]">
              Loại quà
              <select
                value={filters.giftType}
                onChange={(event) =>
                  onGiftTypeChange(event.target.value as GiftType | "")
                }
                className={selectClassName}
              >
                <option value="">Tất cả loại quà</option>
                {taxonomy.giftTypes.map((giftType) => (
                  <option key={giftType.id} value={giftType.id}>
                    {giftType.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="mt-5 text-sm text-[#654f53]" aria-live="polite">
            Đang hiển thị{" "}
            <strong className="font-semibold text-[#5a0d18]">
              {resultCount}/{totalItemCount}
            </strong>{" "}
            gợi ý phù hợp.
          </p>
        </div>
      </div>
    </section>
  );
}

"use client";

import { Heart, MoveDown, SearchX } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCatalogueDiscovery } from "@/hooks/use-catalogue-discovery";
import { usePreferenceStorage } from "@/hooks/use-preference-storage";
import type { PreferenceData } from "@/types/preference";
import { CatalogueDiscovery } from "./catalogue-discovery";
import { CategoryNote } from "./category-note";
import { CategoryTabs } from "./category-tabs";
import { DecorativeDivider } from "./decorative-elements";
import { HeroSection } from "./hero-section";
import { MobileSelectionBar } from "./mobile-selection-bar";
import { PreferenceGrid } from "./preference-grid";
import { SelectionProgress } from "./selection-progress";
import { SelectionSummary } from "./selection-summary";
import { Toast } from "./toast";

interface PreferenceCatalogueProps {
  initialData: PreferenceData;
}

export function PreferenceCatalogue({ initialData }: PreferenceCatalogueProps) {
  const data = initialData;
  const discovery = useCatalogueDiscovery(data);
  const {
    selection,
    hasHydrated,
    toggleLiked,
    toggleFavorite,
    setCategoryNote,
    setLastViewedCategory,
    resetAll,
  } = usePreferenceStorage();
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [hasPassedHero, setHasPassedHero] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    function updateHeroPosition() {
      const hero = document.getElementById("hero");
      if (hero) setHasPassedHero(hero.getBoundingClientRect().bottom < 180);
    }

    window.addEventListener("scroll", updateHeroPosition, { passive: true });
    const frame = window.requestAnimationFrame(updateHeroPosition);
    return () => {
      window.removeEventListener("scroll", updateHeroPosition);
      window.cancelAnimationFrame(frame);
    };
  }, [data]);

  const validItemIds = useMemo(
    () =>
      new Set(
        data.categories.flatMap((category) =>
          category.items.map((item) => item.id),
        ),
      ),
    [data.categories],
  );
  const validCategoryIds = useMemo(
    () => new Set(data.categories.map((category) => category.id)),
    [data.categories],
  );
  const validLikedItemIds = useMemo(
    () =>
      hasHydrated
        ? selection.likedItemIds.filter((id) => validItemIds.has(id))
        : [],
    [hasHydrated, selection.likedItemIds, validItemIds],
  );
  const likedItemIdSet = useMemo(
    () => new Set(validLikedItemIds),
    [validLikedItemIds],
  );
  const hasNotes =
    hasHydrated &&
    Object.entries(selection.notesByCategory).some(
      ([categoryId, note]) => validCategoryIds.has(categoryId) && note.trim(),
    );
  const selectedCategoryCount = data.categories.filter(
    (category) =>
      category.items.some((item) => likedItemIdSet.has(item.id)) ||
      Boolean(selection.notesByCategory[category.id]?.trim()),
  ).length;
  const canViewSummary = validLikedItemIds.length > 0 || hasNotes;
  const filteredCategories = discovery.filteredCategories;
  const restoredCategoryId =
    hasHydrated &&
    filteredCategories.some(
      (category) => category.id === selection.lastViewedCategoryId,
    )
      ? selection.lastViewedCategoryId
      : "";
  const effectiveActiveCategoryId = filteredCategories.some(
    (category) => category.id === activeCategoryId,
  )
    ? activeCategoryId
    : restoredCategoryId || filteredCategories[0]?.id || "";
  const activeCategory =
    filteredCategories.find(
      (category) => category.id === effectiveActiveCategoryId,
    ) ??
    null;
  const activeCategoryIndex = activeCategory
    ? data.categories.findIndex((category) => category.id === activeCategory.id)
    : -1;

  function preferredScrollBehavior(): ScrollBehavior {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
  }
  function scrollToCatalogue(focusHeading = false) {
    document.getElementById("catalogue-start")?.scrollIntoView({
      behavior: preferredScrollBehavior(),
      block: "start",
    });

    if (focusHeading && activeCategory) {
      window.requestAnimationFrame(() => {
        document
          .getElementById(`category-${activeCategory.id}-heading`)
          ?.focus({ preventScroll: true });
      });
    }
  }

  function scrollToDiscovery() {
    document.getElementById("discovery")?.scrollIntoView({
      behavior: preferredScrollBehavior(),
      block: "start",
    });
  }

  function selectCategory(categoryId: string) {
    setActiveCategoryId(categoryId);
    setLastViewedCategory(categoryId);
    window.requestAnimationFrame(() => {
      document.getElementById("catalogue-category")?.scrollIntoView({
        behavior: preferredScrollBehavior(),
        block: "start",
      });
      document
        .getElementById(`category-${categoryId}-heading`)
        ?.focus({ preventScroll: true });
    });
  }

  function selectCollection(collectionId: string) {
    discovery.selectCollection(collectionId);
    window.requestAnimationFrame(() => scrollToCatalogue());
  }

  const closeSummary = useCallback(() => setSummaryOpen(false), []);

  function handleReset() {
    resetAll();
    setSummaryOpen(false);
    setToastMessage("Đã xóa lựa chọn để mình bắt đầu lại");
  }

  return (
    <>
      <a
        href="#catalogue-start"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#5a0d18] shadow-xl transition focus:translate-y-0"
      >
        Bỏ qua để đến danh sách gợi ý
      </a>
      <HeroSection
        site={data.site}
        occasionCount={data.taxonomy.occasions.length}
        itemCount={discovery.totalItemCount}
        onStart={scrollToDiscovery}
      />
      <CatalogueDiscovery
        taxonomy={data.taxonomy}
        collections={data.collections}
        filters={discovery.filters}
        resultCount={discovery.resultCount}
        totalItemCount={discovery.totalItemCount}
        activeFilterCount={discovery.activeFilterCount}
        onQueryChange={discovery.setQuery}
        onToggleOccasion={discovery.toggleOccasion}
        onStyleChange={discovery.setStyleId}
        onBudgetChange={discovery.setBudgetTier}
        onGiftTypeChange={discovery.setGiftType}
        onSelectCollection={selectCollection}
        onClear={discovery.clearFilters}
      />
      {filteredCategories.length > 0 && activeCategory && (
        <CategoryTabs
          categories={filteredCategories}
          activeCategoryId={activeCategory.id}
          onSelect={selectCategory}
        />
      )}

      <main
        id="catalogue-start"
        className="catalogue-surface relative scroll-mt-20 px-4 pb-40 pt-10 sm:px-8 sm:pt-14 md:pb-24"
      >
        <div className="relative z-10 mx-auto max-w-[78rem]">
          <header className="mx-auto mb-9 max-w-2xl text-center sm:mb-12">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#9b763e]">
              {String(discovery.resultCount).padStart(2, "0")} gợi ý đang chờ em
            </p>
            <h2 className="font-display text-balance mt-3 text-[clamp(2.35rem,8vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-[#31080e]">
              {discovery.activeCollection?.name ?? "Chọn bằng cảm xúc"}
            </h2>
            <div className="my-4">
              <DecorativeDivider />
            </div>
            <p className="text-sm leading-7 text-[#765e62]">
              {discovery.activeCollection?.description ??
                "Mở từng gợi ý để đọc câu chuyện phía sau, rồi lưu lại điều khiến em mỉm cười."}
            </p>
          </header>

          <SelectionProgress
            selectedCategoryCount={selectedCategoryCount}
            totalCategoryCount={data.categories.length}
            selectedItemCount={validLikedItemIds.length}
            onViewSummary={() => setSummaryOpen(true)}
          />

          {activeCategory ? (
          <section
            id="catalogue-category"
            key={activeCategory.id}
            className="scroll-mt-24"
            aria-labelledby={`category-${activeCategory.id}-heading`}
          >
            <div className="mb-5 flex items-end gap-3 border-b border-[#5a0d18]/12 pb-4 sm:mb-7 sm:gap-4">
              <span
                className="font-display shrink-0 text-3xl font-medium italic leading-none text-[#c8a96b] sm:text-4xl"
                aria-hidden="true"
              >
                {String(activeCategoryIndex + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h2
                  id={`category-${activeCategory.id}-heading`}
                  tabIndex={-1}
                  className="font-display text-balance text-[clamp(1.8rem,6vw,3rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-[#31080e]"
                >
                  {activeCategory.name}
                </h2>
                <p className="mt-2 max-w-2xl text-xs leading-6 text-[#765e62] sm:text-sm">
                  {activeCategory.description}
                </p>
              </div>
            </div>

            <PreferenceGrid
              key={activeCategory.id}
              category={activeCategory}
              items={activeCategory.items}
              categoryIndex={activeCategoryIndex}
              likedItemIds={validLikedItemIds}
              favoriteItemId={selection.favoriteByCategory[activeCategory.id]}
              onToggleLiked={toggleLiked}
              onToggleFavorite={toggleFavorite}
            />
            <CategoryNote
              categoryId={activeCategory.id}
              categoryName={activeCategory.name}
              placeholder={activeCategory.notePlaceholder}
              value={hasHydrated ? selection.notesByCategory[activeCategory.id] ?? "" : ""}
              onChange={(note) => setCategoryNote(activeCategory.id, note)}
            />
          </section>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-[#5a0d18]/20 bg-[#fffaf4]/75 px-6 py-16 text-center" role="status">
              <SearchX className="mx-auto text-[#8a6a35]" size={34} strokeWidth={1.4} aria-hidden="true" />
              <h2 className="font-display mt-4 text-3xl font-semibold text-[#31080e]">
                Chưa có gợi ý nào khớp
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#654f53]">
                Thử bỏ bớt một điều kiện để mở rộng câu chuyện quà tặng nhé.
              </p>
              <button type="button" onClick={discovery.clearFilters} className="mt-6 min-h-12 rounded-full bg-[#5a0d18] px-6 py-3 text-sm font-semibold text-white">
                Xem lại tất cả gợi ý
              </button>
            </div>
          )}

          <section className="mt-16 overflow-hidden rounded-[1.5rem] bg-[#31080e] px-6 py-10 text-center text-[#f8f1e8] sm:mt-20 sm:px-10 sm:py-12">
            <Heart className="mx-auto text-[#e5c989]" size={23} strokeWidth={1.3} aria-hidden="true" />
            <h2 className="font-display text-balance mt-4 text-3xl font-semibold sm:text-5xl">
              Mỗi điều em chọn đều đáng nhớ
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-[#eadfd6]/80 sm:text-sm">
              Khi đã thấy vừa đủ, mình cùng nhìn lại cuốn sổ nhỏ này nhé.
            </p>
            <button
              type="button"
              onClick={() => setSummaryOpen(true)}
              disabled={!canViewSummary}
              className="mx-auto mt-6 flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#e5c989]/70 bg-[#f8f1e8] px-7 py-3 text-sm font-semibold text-[#5a0d18] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Xem những điều em yêu
              <MoveDown size={17} aria-hidden="true" />
            </button>
          </section>
        </div>
      </main>

      <footer className="border-t border-[#5a0d18]/10 bg-[#f3e9df] px-5 py-8 text-center">
        <p className="font-display text-2xl font-semibold text-[#5a0d18]">Điều Em Yêu</p>
        <p className="mt-1 text-[0.65rem] tracking-[0.08em] text-[#765e62]">
          Được lưu riêng trên thiết bị này, dành riêng cho em.
        </p>
      </footer>

      <MobileSelectionBar
        visible={hasPassedHero || canViewSummary}
        selectedItemCount={validLikedItemIds.length}
        selectedCategoryCount={selectedCategoryCount}
        totalCategoryCount={data.categories.length}
        onViewSummary={() => setSummaryOpen(true)}
        onContinue={() => scrollToCatalogue()}
      />
      <SelectionSummary
        open={summaryOpen}
        data={data}
        selection={selection}
        onClose={closeSummary}
        onReset={handleReset}
        onNotify={setToastMessage}
      />
      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </>
  );
}

"use client";

import { Heart, MoveDown } from "lucide-react";
import { useEffect, useState } from "react";
import { usePreferenceData } from "@/hooks/use-preference-data";
import { usePreferenceStorage } from "@/hooks/use-preference-storage";
import { CategoryNote } from "./category-note";
import { CategoryTabs } from "./category-tabs";
import { DataErrorState } from "./data-error-state";
import { DecorativeDivider } from "./decorative-elements";
import { HeroSection } from "./hero-section";
import { LoadingCatalogue } from "./loading-catalogue";
import { MobileSelectionBar } from "./mobile-selection-bar";
import { PreferenceGrid } from "./preference-grid";
import { SelectionProgress } from "./selection-progress";
import { SelectionSummary } from "./selection-summary";
import { Toast } from "./toast";

export function PreferenceCatalogue() {
  const { data, isLoading, error, retry } = usePreferenceData();
  const {
    selection,
    hasHydrated,
    toggleLiked,
    toggleFavorite,
    setCategoryNote,
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

  if (isLoading) return <LoadingCatalogue />;
  if (error || !data) return <DataErrorState onRetry={retry} />;

  const validItemIds = new Set(
    data.categories.flatMap((category) => category.items.map((item) => item.id)),
  );
  const validLikedItemIds = hasHydrated
    ? selection.likedItemIds.filter((id) => validItemIds.has(id))
    : [];
  const selectedCategoryCount = data.categories.filter((category) =>
    category.items.some((item) => validLikedItemIds.includes(item.id)),
  ).length;
  const hasNotes = Object.values(selection.notesByCategory).some((note) => note.trim());
  const canViewSummary = validLikedItemIds.length > 0 || hasNotes;
  const activeCategory =
    data.categories.find((category) => category.id === activeCategoryId) ??
    data.categories[0];
  const activeCategoryIndex = data.categories.findIndex(
    (category) => category.id === activeCategory.id,
  );

  function scrollToCatalogue(focusHeading = false) {
    document.getElementById("catalogue-start")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    if (focusHeading) {
      window.setTimeout(() => {
        document
          .getElementById(`category-${activeCategory.id}-heading`)
          ?.focus({ preventScroll: true });
      }, 450);
    }
  }

  function selectCategory(categoryId: string) {
    setActiveCategoryId(categoryId);
    window.requestAnimationFrame(() => {
      document.getElementById("catalogue-category")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      window.setTimeout(() => {
        document
          .getElementById(`category-${categoryId}-heading`)
          ?.focus({ preventScroll: true });
      }, 450);
    });
  }

  function handleReset() {
    resetAll();
    setSummaryOpen(false);
    setToastMessage("Đã xóa lựa chọn để mình bắt đầu lại");
  }

  return (
    <>
      <HeroSection site={data.site} onStart={() => scrollToCatalogue(true)} />
      <CategoryTabs
        categories={data.categories}
        activeCategoryId={activeCategory.id}
        onSelect={selectCategory}
      />

      <main
        id="catalogue-start"
        className="catalogue-surface relative scroll-mt-20 px-4 pb-40 pt-10 sm:px-8 sm:pt-14 md:pb-24"
      >
        <div className="relative z-10 mx-auto max-w-[78rem]">
          <header className="mx-auto mb-9 max-w-2xl text-center sm:mb-12">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#9b763e]">
              {String(data.categories.length).padStart(2, "0")} chương nhỏ về em
            </p>
            <h2 className="font-display text-balance mt-3 text-[clamp(2.35rem,8vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-[#31080e]">
              Chọn bằng cảm xúc
            </h2>
            <div className="my-4">
              <DecorativeDivider />
            </div>
            <p className="text-sm leading-7 text-[#765e62]">
              Mỗi lần xem một danh mục. Chạm vào card để đọc lời nhắn, rồi chọn điều khiến em mỉm cười.
            </p>
          </header>

          <SelectionProgress
            selectedCategoryCount={selectedCategoryCount}
            totalCategoryCount={data.categories.length}
            selectedItemCount={validLikedItemIds.length}
            onViewSummary={() => setSummaryOpen(true)}
          />

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
        visible={hasPassedHero || validLikedItemIds.length > 0}
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
        onClose={() => setSummaryOpen(false)}
        onReset={handleReset}
        onNotify={setToastMessage}
      />
      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </>
  );
}

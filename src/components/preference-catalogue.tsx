"use client";

import { Heart, MoveDown, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import { useCatalogueController } from "@/features/catalogue/hooks/use-catalogue-controller";
import { useCatalogueDiscovery } from "@/features/catalogue/hooks/use-catalogue-discovery";
import { CataloguePageShell } from "@/features/catalogue/components/catalogue-page-shell";
import { SiteHeader } from "@/features/catalogue/components/site-header";
import { CatalogueToolbar } from "@/features/catalogue/components/catalogue-toolbar";
import { CatalogueDiscovery } from "@/features/catalogue/components/catalogue-discovery";
import { usePreferenceSelection } from "@/features/selection/hooks/use-preference-selection";
import { SelectionSummary } from "@/features/selection/components/selection-summary";
import { ResumeSelection } from "@/features/selection/components/resume-selection";
import { DEFAULT_SELECTION_STATE } from "@/features/selection/lib/selection-state";
import { createSelectionProgress } from "@/features/selection/lib/selection-progress";
import { selectValidSelection } from "@/features/selection/lib/selection-selectors";
import { SelectedItemsView } from "@/features/selection/components/selected-items-view";
import type { PreferenceData } from "@/types/preference";
import { CategoryNote } from "./category-note";
import { CategoryTabs } from "./category-tabs";
import { DecorativeDivider } from "./decorative-elements";
import { HeroSection } from "./hero-section";
import { MobileSelectionBar } from "./mobile-selection-bar";
import { PreferenceGrid } from "./preference-grid";
import { SelectionProgress } from "./selection-progress";
import { Toast } from "./toast";
import { Button } from "./ui/button";

interface PreferenceCatalogueProps {
  initialData: PreferenceData;
}

export function PreferenceCatalogue({ initialData }: PreferenceCatalogueProps) {
  const data = initialData;
  const discovery = useCatalogueDiscovery(data);
  const {
    selection,
    hasHydrated,
    persistenceStatus,
    canUndo,
    undo,
    toggleLiked,
    toggleFavorite,
    setCategoryNote,
    setLastViewedCategory,
    resetAll,
  } = usePreferenceSelection();
  const [hasPassedHero, setHasPassedHero] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "selected">("all");
  const controller = useCatalogueController({
    data,
    filteredCategories: discovery.filteredCategories,
    selection,
    hasHydrated,
    onLastViewedCategoryChange: setLastViewedCategory,
    onReset: resetAll,
  });
  const {
    activeCategory,
    activeCategoryIndex,
    selectedItemIds,
    canViewSummary,
    resumeSelection,
  } = controller;

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

  const filteredCategories = discovery.filteredCategories;
  const progressModel = createSelectionProgress(
    data.categories,
    hasHydrated ? selection : DEFAULT_SELECTION_STATE,
  );
  const selectedCategories = hasHydrated
    ? selectValidSelection(data, selection)
    : [];

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

  function handleSelectCategory(categoryId: string) {
    setViewMode("all");
    controller.selectCategory(categoryId);
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

  function handleReset() {
    controller.resetSelection();
    setToastMessage("Đã xóa lựa chọn để mình bắt đầu lại");
  }

  function handleToggleLiked(itemId: string, categoryId: string) {
    const wasLiked = selection.likedItemIds.includes(itemId);
    toggleLiked(itemId, categoryId);
    setToastMessage(
      wasLiked ? "Đã bỏ khỏi những điều em yêu" : "Đã thêm vào những điều em yêu",
    );
  }

  function handleToggleFavorite(categoryId: string, itemId: string) {
    const wasFavorite =
      selection.favoriteByCategory[categoryId] === itemId;
    toggleFavorite(categoryId, itemId);
    setToastMessage(
      wasFavorite ? "Đã bỏ lựa chọn số một" : "Đã chọn làm lựa chọn số một",
    );
  }

  return (
    <>
      <CataloguePageShell
        hero={<HeroSection site={data.site} onStart={scrollToDiscovery} />}
        siteHeader={
          <SiteHeader
            title={data.site.title}
            selectedItemCount={selectedItemIds.length}
            onOpenSelection={controller.openSummary}
          />
        }
        footer={
          <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-8 text-center">
            <p className="font-display text-2xl font-semibold tracking-normal text-[var(--color-brand)]">
              Điều Em Yêu
            </p>
            <p className="mt-1 text-[0.65rem] tracking-normal text-[var(--color-muted)]">
              Được lưu riêng trên thiết bị này, dành riêng cho em.
            </p>
          </footer>
        }
      >
      <ResumeSelection
        model={resumeSelection}
        onContinue={() => scrollToCatalogue(true)}
        onViewSummary={controller.openSummary}
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
        onSortChange={discovery.setSort}
        onClear={discovery.clearFilters}
      />
      {filteredCategories.length > 0 && activeCategory && (
        <div className="sticky top-14 z-30">
          {viewMode === "all" && (
            <CategoryTabs
              categories={filteredCategories}
              activeCategoryId={activeCategory.id}
              onSelect={handleSelectCategory}
            />
          )}
          <CatalogueToolbar
            activeCategoryName={
              viewMode === "selected" ? "Các gợi ý đã chọn" : activeCategory.name
            }
            resultCount={discovery.resultCount}
            activeFilterCount={discovery.activeFilterCount}
            selectedItemCount={selectedItemIds.length}
            viewMode={viewMode}
            onViewModeChange={(mode) => {
              setViewMode(mode);
              window.requestAnimationFrame(() => scrollToCatalogue());
            }}
            onOpenFilters={scrollToDiscovery}
            onOpenSelection={controller.openSummary}
          />
        </div>
      )}

      <div
        id="catalogue-start"
        tabIndex={-1}
        className="catalogue-surface relative scroll-mt-28 px-4 pb-40 pt-10 sm:px-8 sm:pt-14 md:pb-24"
      >
        <div className="relative z-10 mx-auto max-w-[78rem]">
          <header className="mx-auto mb-9 max-w-2xl text-center sm:mb-12">
            <p className="text-[0.66rem] font-semibold text-[var(--color-accent)]">
              {String(discovery.resultCount).padStart(2, "0")} gợi ý hiển thị
            </p>
            <h2 className="font-display display-lg text-balance mt-3 font-semibold text-[var(--color-brand-strong)]">
              {discovery.activeCollection?.name ?? "Khám phá gợi ý"}
            </h2>
            <div className="my-4">
              <DecorativeDivider />
            </div>
            <p className="text-sm leading-7 text-[var(--color-muted)]">
              {discovery.activeCollection?.description ??
                "Mở chi tiết từng gợi ý, sau đó lưu những lựa chọn phù hợp."}
            </p>
          </header>

          {viewMode === "selected" ? (
            <SelectedItemsView
              selectedCategories={selectedCategories}
              onShowAll={() => setViewMode("all")}
              onRemove={(categoryId, itemId) =>
                handleToggleLiked(itemId, categoryId)
              }
              onToggleFavorite={handleToggleFavorite}
            />
          ) : (
          <>
            <SelectionProgress
              model={progressModel}
              onViewSummary={controller.openSummary}
              onExploreNext={() => {
                if (progressModel.nextCategory) {
                  handleSelectCategory(progressModel.nextCategory.id);
                }
              }}
            />

          {activeCategory ? (
          <section
            id="catalogue-category"
            key={activeCategory.id}
            className="scroll-mt-24"
            aria-labelledby={`category-${activeCategory.id}-heading`}
          >
            <div className="mb-5 flex items-end gap-3 border-b border-[var(--color-border)] pb-4 sm:mb-7 sm:gap-4">
              <span
                className="font-display shrink-0 text-3xl font-medium leading-none text-[var(--color-accent)] sm:text-4xl"
                aria-hidden="true"
              >
                {String(activeCategoryIndex + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h2
                  id={`category-${activeCategory.id}-heading`}
                  tabIndex={-1}
                  className="font-display text-balance text-3xl font-semibold leading-[1.08] tracking-normal text-[var(--color-brand-strong)] sm:text-5xl"
                >
                  {activeCategory.name}
                </h2>
                <p className="mt-2 max-w-2xl text-xs leading-6 text-[var(--color-muted)] sm:text-sm">
                  {activeCategory.description}
                </p>
              </div>
            </div>

            <PreferenceGrid
              key={activeCategory.id}
              category={activeCategory}
              items={activeCategory.items}
              categoryIndex={activeCategoryIndex}
              likedItemIds={selectedItemIds}
              favoriteItemId={selection.favoriteByCategory[activeCategory.id]}
              selectionReady={hasHydrated}
              onToggleLiked={handleToggleLiked}
              onToggleFavorite={handleToggleFavorite}
            />
            <CategoryNote
              categoryId={activeCategory.id}
              categoryName={activeCategory.name}
              placeholder={activeCategory.notePlaceholder}
              value={hasHydrated ? selection.notesByCategory[activeCategory.id] ?? "" : ""}
              persistenceStatus={persistenceStatus}
              onChange={(note) => setCategoryNote(activeCategory.id, note)}
            />
          </section>
          ) : (
            <div className="border-y border-dashed border-[var(--color-border)] bg-[var(--color-paper)] px-6 py-16 text-center" role="status">
              <SearchX className="mx-auto text-[var(--color-accent)]" size={34} strokeWidth={1.4} aria-hidden="true" />
              <h2 className="font-display mt-4 text-3xl font-semibold tracking-normal text-[var(--color-brand-strong)]">
                Chưa có gợi ý nào khớp
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[var(--color-muted)]">
                Thử bỏ bớt một điều kiện để mở rộng câu chuyện quà tặng nhé.
              </p>
              <Button onClick={discovery.clearFilters} className="mt-6 min-h-12 px-6">
                Xem lại tất cả gợi ý
              </Button>
            </div>
          )}
          </>
          )}

          <section className="mt-16 border-y border-white/15 bg-[var(--color-brand-strong)] px-6 py-10 text-center text-white sm:mt-20 sm:px-10 sm:py-12">
            <Heart className="mx-auto text-[#f6dfa9]" size={23} strokeWidth={1.3} aria-hidden="true" />
            <h2 className="font-display text-balance mt-4 text-3xl font-semibold tracking-normal sm:text-5xl">
              Xem lại lựa chọn đã lưu
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-white/80 sm:text-sm">
              Tiếp tục chỉnh sửa, chia sẻ hoặc tải danh sách trên thiết bị này.
            </p>
            <Button
              variant="secondary"
              onClick={controller.openSummary}
              disabled={!canViewSummary}
              className="mx-auto mt-6 min-h-12 border-white/70 bg-white px-7"
            >
              Xem những điều em yêu
              <MoveDown size={17} aria-hidden="true" />
            </Button>
          </section>
        </div>
      </div>
      </CataloguePageShell>

      <MobileSelectionBar
        visible={hasPassedHero || canViewSummary}
        activeFilterCount={discovery.activeFilterCount}
        selectedItemCount={selectedItemIds.length}
        onOpenFilters={scrollToDiscovery}
        onOpenSelection={() => {
          setViewMode("selected");
          scrollToCatalogue();
        }}
      />
      <SelectionSummary
        open={controller.summaryOpen}
        data={data}
        selection={selection}
        onClose={controller.closeSummary}
        onReset={handleReset}
        onNotify={setToastMessage}
        onRemove={(categoryId, itemId) =>
          handleToggleLiked(itemId, categoryId)
        }
        onToggleFavorite={handleToggleFavorite}
        onSetCategoryNote={setCategoryNote}
      />
      <Toast
        message={toastMessage}
        action={
          canUndo
            ? {
                label: "Hoàn tác",
                onClick: undo,
              }
            : undefined
        }
        onDismiss={() => setToastMessage(null)}
      />
    </>
  );
}

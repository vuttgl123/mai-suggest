"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  PreferenceCategory,
  PreferenceData,
  PreferenceSelectionState,
} from "@/types/preference";

interface UseCatalogueControllerOptions {
  data: PreferenceData;
  filteredCategories: PreferenceCategory[];
  selection: PreferenceSelectionState;
  hasHydrated: boolean;
  onLastViewedCategoryChange(categoryId: string): void;
  onReset(): void;
}

export interface ResumeSelectionModel {
  selectedItemCount: number;
  selectedCategoryCount: number;
  updatedAt: string | null;
}

export function useCatalogueController({
  data,
  filteredCategories,
  selection,
  hasHydrated,
  onLastViewedCategoryChange,
  onReset,
}: UseCatalogueControllerOptions) {
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
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
  const selectedItemIds = useMemo(
    () =>
      hasHydrated
        ? selection.likedItemIds.filter((id) => validItemIds.has(id))
        : [],
    [hasHydrated, selection.likedItemIds, validItemIds],
  );
  const validFavoriteItemIds = hasHydrated
    ? Object.values(selection.favoriteByCategory).filter((id) =>
        validItemIds.has(id),
      )
    : [];
  const selectedOrFavoriteItemIdSet = new Set([
    ...selectedItemIds,
    ...validFavoriteItemIds,
  ]);
  const hasNotes =
    hasHydrated &&
    Object.entries(selection.notesByCategory).some(
      ([categoryId, note]) =>
        validCategoryIds.has(categoryId) && Boolean(note.trim()),
    );
  const selectedCategoryCount = hasHydrated
    ? data.categories.filter(
        (category) =>
          category.items.some((item) =>
            selectedOrFavoriteItemIdSet.has(item.id),
          ) ||
          Boolean(selection.notesByCategory[category.id]?.trim()),
      ).length
    : 0;
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
    ) ?? null;
  const activeCategoryIndex = activeCategory
    ? data.categories.findIndex((category) => category.id === activeCategory.id)
    : -1;
  const canViewSummary = selectedOrFavoriteItemIdSet.size > 0 || hasNotes;
  const resumeSelection: ResumeSelectionModel | null =
    hasHydrated && canViewSummary
      ? {
          selectedItemCount: selectedOrFavoriteItemIdSet.size,
          selectedCategoryCount,
          updatedAt: selection.updatedAt,
        }
      : null;

  function selectCategory(categoryId: string) {
    setActiveCategoryId(categoryId);
    onLastViewedCategoryChange(categoryId);
  }

  function resetSelection() {
    onReset();
    setSummaryOpen(false);
  }

  const openSummary = useCallback(() => setSummaryOpen(true), []);
  const closeSummary = useCallback(() => setSummaryOpen(false), []);

  return {
    activeCategory,
    activeCategoryIndex,
    selectedItemIds,
    selectedCategoryCount,
    canViewSummary,
    resumeSelection,
    summaryOpen,
    selectCategory,
    openSummary,
    closeSummary,
    resetSelection,
  };
}

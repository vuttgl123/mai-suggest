"use client";

import { useMemo, useState } from "react";
import {
  countActiveFilters,
  EMPTY_CATALOGUE_FILTERS,
  filterCatalogue,
  type CatalogueFilters,
  type CatalogueSort,
} from "@/features/catalogue/lib/catalogue-query";
import type { BudgetTier, GiftType, PreferenceData } from "@/types/preference";

export type { CatalogueFilters } from "@/features/catalogue/lib/catalogue-query";

export function useCatalogueDiscovery(data: PreferenceData) {
  const [filters, setFilters] = useState<CatalogueFilters>(
    EMPTY_CATALOGUE_FILTERS,
  );

  const activeCollection = useMemo(
    () =>
      data.collections.find(
        (collection) => collection.id === filters.collectionId,
      ) ?? null,
    [data.collections, filters.collectionId],
  );
  const filteredCategories = useMemo(
    () => filterCatalogue(data, filters),
    [data, filters],
  );
  const resultCount = filteredCategories.reduce(
    (total, category) => total + category.items.length,
    0,
  );
  const totalItemCount = data.categories.reduce(
    (total, category) => total + category.items.length,
    0,
  );
  const activeFilterCount = countActiveFilters(filters);

  function setQuery(query: string) {
    setFilters((current) => ({ ...current, query }));
  }

  function toggleOccasion(occasionId: string) {
    setFilters((current) => ({
      ...current,
      collectionId: "",
      occasionIds: current.occasionIds.includes(occasionId)
        ? current.occasionIds.filter((id) => id !== occasionId)
        : [...current.occasionIds, occasionId],
    }));
  }

  function setStyleId(styleId: string) {
    setFilters((current) => ({ ...current, styleId }));
  }

  function setBudgetTier(budgetTier: BudgetTier | "") {
    setFilters((current) => ({ ...current, budgetTier }));
  }

  function setGiftType(giftType: GiftType | "") {
    setFilters((current) => ({ ...current, giftType }));
  }

  function setSort(sort: CatalogueSort) {
    setFilters((current) => ({ ...current, sort }));
  }

  function selectCollection(collectionId: string) {
    const collection = data.collections.find(
      (item) => item.id === collectionId,
    );
    setFilters((current) => ({
      ...EMPTY_CATALOGUE_FILTERS,
      collectionId: collection?.id ?? "",
      occasionIds: collection?.occasionIds ?? [],
      sort: current.sort,
    }));
  }

  function clearFilters() {
    setFilters((current) => ({
      ...EMPTY_CATALOGUE_FILTERS,
      sort: current.sort,
    }));
  }

  return {
    filters,
    activeCollection,
    filteredCategories,
    resultCount,
    totalItemCount,
    activeFilterCount,
    hasActiveFilters: activeFilterCount > 0,
    setQuery,
    toggleOccasion,
    setStyleId,
    setBudgetTier,
    setGiftType,
    setSort,
    selectCollection,
    clearFilters,
  };
}

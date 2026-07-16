"use client";

import { useMemo, useState } from "react";
import type {
  BudgetTier,
  GiftType,
  PreferenceData,
  PreferenceItem,
} from "@/types/preference";

export interface CatalogueFilters {
  query: string;
  occasionIds: string[];
  styleId: string;
  budgetTier: BudgetTier | "";
  giftType: GiftType | "";
  collectionId: string;
}

const EMPTY_FILTERS: CatalogueFilters = {
  query: "",
  occasionIds: [],
  styleId: "",
  budgetTier: "",
  giftType: "",
  collectionId: "",
};

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase("vi-VN")
    .trim();
}

function searchableText(item: PreferenceItem) {
  return normalizeSearch(
    [
      item.name,
      item.brand,
      item.description,
      item.whyItFits,
      item.referencePrice,
      ...item.tags,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function useCatalogueDiscovery(data: PreferenceData) {
  const [filters, setFilters] = useState<CatalogueFilters>(EMPTY_FILTERS);

  const activeCollection = useMemo(
    () =>
      data.collections.find(
        (collection) => collection.id === filters.collectionId,
      ) ?? null,
    [data.collections, filters.collectionId],
  );

  const filteredCategories = useMemo(() => {
    const query = normalizeSearch(filters.query);
    const collectionItemIds = activeCollection
      ? new Set(activeCollection.itemIds)
      : null;
    const customOccasionIds = activeCollection ? [] : filters.occasionIds;

    return data.categories
      .map((category) => ({
        ...category,
        items: category.items
          .filter((item) => {
            const matchesCollection =
              !collectionItemIds || collectionItemIds.has(item.id);
            const matchesQuery = !query || searchableText(item).includes(query);
            const matchesOccasion =
              customOccasionIds.length === 0 ||
              customOccasionIds.some((id) => item.occasions.includes(id));
            const matchesStyle =
              !filters.styleId || item.styles.includes(filters.styleId);
            const matchesBudget =
              !filters.budgetTier || item.budgetTier === filters.budgetTier;
            const matchesGiftType =
              !filters.giftType || item.giftType === filters.giftType;

            return (
              matchesCollection &&
              matchesQuery &&
              matchesOccasion &&
              matchesStyle &&
              matchesBudget &&
              matchesGiftType
            );
          })
          .sort((first, second) => {
            const featuredDifference =
              Number(Boolean(second.featured)) - Number(Boolean(first.featured));
            if (featuredDifference) return featuredDifference;
            return (
              (first.editorialOrder ?? Number.MAX_SAFE_INTEGER) -
              (second.editorialOrder ?? Number.MAX_SAFE_INTEGER)
            );
          }),
      }))
      .filter((category) => category.items.length > 0);
  }, [activeCollection, data.categories, filters]);

  const resultCount = filteredCategories.reduce(
    (total, category) => total + category.items.length,
    0,
  );
  const totalItemCount = data.categories.reduce(
    (total, category) => total + category.items.length,
    0,
  );
  const activeFilterCount =
    (filters.collectionId ? 1 : filters.occasionIds.length) +
    Number(Boolean(filters.query.trim())) +
    Number(Boolean(filters.styleId)) +
    Number(Boolean(filters.budgetTier)) +
    Number(Boolean(filters.giftType));

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

  function selectCollection(collectionId: string) {
    const collection = data.collections.find((item) => item.id === collectionId);
    setFilters({
      ...EMPTY_FILTERS,
      collectionId: collection?.id ?? "",
      occasionIds: collection?.occasionIds ?? [],
    });
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
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
    selectCollection,
    clearFilters,
  };
}

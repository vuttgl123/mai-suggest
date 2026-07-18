import type {
  BudgetTier,
  GiftType,
  PreferenceCategory,
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
  sort: CatalogueSort;
}

export type CatalogueSort =
  | "recommended"
  | "price-ascending"
  | "price-descending"
  | "name";

export const EMPTY_CATALOGUE_FILTERS: CatalogueFilters = {
  query: "",
  occasionIds: [],
  styleId: "",
  budgetTier: "",
  giftType: "",
  collectionId: "",
  sort: "recommended",
};

const budgetRank: Record<BudgetTier, number> = {
  "duoi-500k": 0,
  "500k-1m": 1,
  "1m-3m": 2,
  "3m-10m": 3,
  "tren-10m": 4,
  "linh-hoat": 5,
};

function recommendedOrder(first: PreferenceItem, second: PreferenceItem) {
  const featuredDifference =
    Number(Boolean(second.featured)) - Number(Boolean(first.featured));
  if (featuredDifference) return featuredDifference;

  return (
    (first.editorialOrder ?? Number.MAX_SAFE_INTEGER) -
    (second.editorialOrder ?? Number.MAX_SAFE_INTEGER)
  );
}

function compareItems(
  first: PreferenceItem,
  second: PreferenceItem,
  sort: CatalogueSort,
) {
  if (sort === "price-ascending") {
    return budgetRank[first.budgetTier] - budgetRank[second.budgetTier];
  }
  if (sort === "price-descending") {
    return budgetRank[second.budgetTier] - budgetRank[first.budgetTier];
  }
  if (sort === "name") return first.name.localeCompare(second.name, "vi");
  return recommendedOrder(first, second);
}

export function normalizeVietnameseSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase("vi-VN")
    .trim();
}

function searchableText(item: PreferenceItem) {
  return normalizeVietnameseSearch(
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

export function filterCatalogue(
  data: PreferenceData,
  filters: CatalogueFilters,
): PreferenceCategory[] {
  const activeCollection =
    data.collections.find(
      (collection) => collection.id === filters.collectionId,
    ) ?? null;
  const query = normalizeVietnameseSearch(filters.query);
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
        .sort((first, second) => compareItems(first, second, filters.sort)),
    }))
    .filter((category) => category.items.length > 0);
}

export function countActiveFilters(filters: CatalogueFilters) {
  return (
    (filters.collectionId ? 1 : filters.occasionIds.length) +
    Number(Boolean(filters.query.trim())) +
    Number(Boolean(filters.styleId)) +
    Number(Boolean(filters.budgetTier)) +
    Number(Boolean(filters.giftType))
  );
}

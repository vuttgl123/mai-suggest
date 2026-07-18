import type {
  PreferenceCategory,
  PreferenceSelectionState,
} from "@/types/preference";

export interface SelectionProgressModel {
  selectedCategoryCount: number;
  totalCategoryCount: number;
  selectedItemCount: number;
  isComplete: boolean;
  nextCategory: { id: string; name: string } | null;
}

export function createSelectionProgress(
  categories: PreferenceCategory[],
  selection: PreferenceSelectionState,
): SelectionProgressModel {
  const itemIds = new Set(
    categories.flatMap((category) => category.items.map((item) => item.id)),
  );
  const selectedItemIds = new Set(
    selection.likedItemIds.filter((itemId) => itemIds.has(itemId)),
  );
  for (const favoriteId of Object.values(selection.favoriteByCategory)) {
    if (itemIds.has(favoriteId)) selectedItemIds.add(favoriteId);
  }

  const selectedCategoryIds = new Set(
    categories
      .filter((category) => {
        const favoriteId = selection.favoriteByCategory[category.id];
        return (
          category.items.some((item) => selectedItemIds.has(item.id)) ||
          Boolean(
            favoriteId &&
              category.items.some((item) => item.id === favoriteId),
          ) ||
          Boolean(selection.notesByCategory[category.id]?.trim())
        );
      })
      .map((category) => category.id),
  );
  const nextCategory =
    categories.find((category) => !selectedCategoryIds.has(category.id)) ?? null;

  return {
    selectedCategoryCount: selectedCategoryIds.size,
    totalCategoryCount: categories.length,
    selectedItemCount: selectedItemIds.size,
    isComplete:
      categories.length > 0 && selectedCategoryIds.size === categories.length,
    nextCategory: nextCategory
      ? { id: nextCategory.id, name: nextCategory.name }
      : null,
  };
}

import type {
  PreferenceCategory,
  PreferenceData,
  PreferenceItem,
  PreferenceSelectionState,
} from "@/types/preference";

export interface SelectedCategory {
  category: PreferenceCategory;
  items: PreferenceItem[];
  favoriteItemId?: string;
  note: string;
}

export function selectValidSelection(
  data: PreferenceData,
  state: PreferenceSelectionState,
): SelectedCategory[] {
  const likedItemIds = new Set(state.likedItemIds);
  const seenItemIds = new Set<string>();

  return data.categories.flatMap((category) => {
    const favoriteId = state.favoriteByCategory[category.id];
    const favoriteIsValid = category.items.some(
      (item) => item.id === favoriteId && !seenItemIds.has(item.id),
    );
    const items = category.items.filter((item) => {
      if (seenItemIds.has(item.id)) return false;
      return likedItemIds.has(item.id) || (favoriteIsValid && item.id === favoriteId);
    });
    for (const item of items) seenItemIds.add(item.id);

    const note = state.notesByCategory[category.id] ?? "";
    if (items.length === 0 && !note.trim()) return [];

    return [
      {
        category,
        items,
        favoriteItemId:
          favoriteIsValid && items.some((item) => item.id === favoriteId)
            ? favoriteId
            : undefined,
        note,
      },
    ];
  });
}

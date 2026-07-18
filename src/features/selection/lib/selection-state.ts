import type { PreferenceSelectionState } from "@/types/preference";

export type SelectionAction =
  | { type: "toggle-liked"; itemId: string; categoryId: string }
  | { type: "toggle-favorite"; itemId: string; categoryId: string }
  | { type: "set-note"; categoryId: string; note: string }
  | { type: "set-last-viewed"; categoryId: string }
  | { type: "reset" };

export const DEFAULT_SELECTION_STATE: PreferenceSelectionState = {
  schemaVersion: 2,
  likedItemIds: [],
  favoriteByCategory: {},
  notesByCategory: {},
  lastViewedCategoryId: null,
  updatedAt: null,
};

function defaultSelectionState(): PreferenceSelectionState {
  return {
    ...DEFAULT_SELECTION_STATE,
    likedItemIds: [],
    favoriteByCategory: {},
    notesByCategory: {},
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringRecord(value: unknown): Record<string, string> | null {
  if (
    !isRecord(value) ||
    !Object.values(value).every((entry) => typeof entry === "string")
  ) {
    return null;
  }

  return value as Record<string, string>;
}

export function parseStoredSelection(value: unknown): PreferenceSelectionState {
  if (
    !isRecord(value) ||
    (value.schemaVersion !== 1 && value.schemaVersion !== 2)
  ) {
    return defaultSelectionState();
  }

  const { likedItemIds, favoriteByCategory, notesByCategory, updatedAt } = value;
  const parsedFavorites = stringRecord(favoriteByCategory);
  const parsedNotes = stringRecord(notesByCategory);
  if (
    !Array.isArray(likedItemIds) ||
    !likedItemIds.every((id) => typeof id === "string") ||
    !parsedFavorites ||
    !parsedNotes ||
    (updatedAt !== null && typeof updatedAt !== "string")
  ) {
    return defaultSelectionState();
  }

  const lastViewedCategoryId =
    value.schemaVersion === 2 ? value.lastViewedCategoryId : null;
  if (
    lastViewedCategoryId !== null &&
    typeof lastViewedCategoryId !== "string"
  ) {
    return defaultSelectionState();
  }

  return {
    schemaVersion: 2,
    likedItemIds: [...new Set(likedItemIds)],
    favoriteByCategory: parsedFavorites,
    notesByCategory: Object.fromEntries(
      Object.entries(parsedNotes).map(([categoryId, note]) => [
        categoryId,
        note.slice(0, 500),
      ]),
    ),
    lastViewedCategoryId,
    updatedAt,
  };
}

function withTimestamp(
  state: Omit<PreferenceSelectionState, "updatedAt">,
): PreferenceSelectionState {
  return { ...state, updatedAt: new Date().toISOString() };
}

export function selectionReducer(
  state: PreferenceSelectionState,
  action: SelectionAction,
): PreferenceSelectionState {
  switch (action.type) {
    case "toggle-liked": {
      const isLiked = state.likedItemIds.includes(action.itemId);
      const favoriteByCategory = { ...state.favoriteByCategory };
      if (
        isLiked &&
        favoriteByCategory[action.categoryId] === action.itemId
      ) {
        delete favoriteByCategory[action.categoryId];
      }

      return withTimestamp({
        ...state,
        schemaVersion: 2,
        likedItemIds: isLiked
          ? state.likedItemIds.filter((id) => id !== action.itemId)
          : [...state.likedItemIds, action.itemId],
        favoriteByCategory,
      });
    }
    case "toggle-favorite": {
      const favoriteByCategory = { ...state.favoriteByCategory };
      const isFavorite =
        favoriteByCategory[action.categoryId] === action.itemId;
      if (isFavorite) delete favoriteByCategory[action.categoryId];
      else favoriteByCategory[action.categoryId] = action.itemId;

      return withTimestamp({
        ...state,
        schemaVersion: 2,
        favoriteByCategory,
        likedItemIds:
          isFavorite || state.likedItemIds.includes(action.itemId)
            ? state.likedItemIds
            : [...state.likedItemIds, action.itemId],
      });
    }
    case "set-note":
      return withTimestamp({
        ...state,
        schemaVersion: 2,
        notesByCategory: {
          ...state.notesByCategory,
          [action.categoryId]: action.note.slice(0, 500),
        },
      });
    case "set-last-viewed":
      return { ...state, lastViewedCategoryId: action.categoryId };
    case "reset":
      return defaultSelectionState();
  }
}

"use client";

import { useEffect, useState } from "react";
import type { PreferenceSelectionState } from "@/types/preference";

export const PREFERENCE_STORAGE_KEY = "dieu-em-yeu:preferences:v1";

const DEFAULT_STATE: PreferenceSelectionState = {
  schemaVersion: 2,
  likedItemIds: [],
  favoriteByCategory: {},
  notesByCategory: {},
  lastViewedCategoryId: null,
  updatedAt: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringRecord(value: unknown): Record<string, string> | null {
  if (!isRecord(value) || !Object.values(value).every((entry) => typeof entry === "string")) return null;
  return value as Record<string, string>;
}

function parseStoredState(value: unknown): PreferenceSelectionState | null {
  if (!isRecord(value) || (value.schemaVersion !== 1 && value.schemaVersion !== 2)) return null;
  const { likedItemIds, favoriteByCategory, notesByCategory, updatedAt } = value;
  const parsedFavorites = stringRecord(favoriteByCategory);
  const parsedNotes = stringRecord(notesByCategory);
  if (!Array.isArray(likedItemIds) || !likedItemIds.every((id) => typeof id === "string") ||
    !parsedFavorites || !parsedNotes || (updatedAt !== null && typeof updatedAt !== "string")) return null;
  const lastViewed = value.schemaVersion === 2 ? value.lastViewedCategoryId : null;
  if (lastViewed !== null && typeof lastViewed !== "string") return null;
  return {
    schemaVersion: 2,
    likedItemIds: [...new Set(likedItemIds)],
    favoriteByCategory: parsedFavorites,
    notesByCategory: Object.fromEntries(
      Object.entries(parsedNotes).map(([key, note]) => [key, note.slice(0, 500)]),
    ),
    lastViewedCategoryId: lastViewed,
    updatedAt,
  };
}

function withTimestamp(state: Omit<PreferenceSelectionState, "updatedAt">): PreferenceSelectionState {
  return { ...state, updatedAt: new Date().toISOString() };
}

export function usePreferenceStorage() {
  const [selection, setSelection] = useState<PreferenceSelectionState>(DEFAULT_STATE);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let hydratedState = DEFAULT_STATE;
      try {
        const storedValue = window.localStorage.getItem(PREFERENCE_STORAGE_KEY);
        if (storedValue) hydratedState = parseStoredState(JSON.parse(storedValue)) ?? DEFAULT_STATE;
      } catch {
        hydratedState = DEFAULT_STATE;
      }
      setSelection(hydratedState);
      setHasHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    try {
      window.localStorage.setItem(PREFERENCE_STORAGE_KEY, JSON.stringify(selection));
    } catch {
      // Keep the catalogue usable when storage is blocked or full.
    }
  }, [hasHydrated, selection]);

  function update(updater: (current: PreferenceSelectionState) => Omit<PreferenceSelectionState, "updatedAt">) {
    setSelection((current) => withTimestamp(updater(current)));
  }

  function toggleLiked(itemId: string, categoryId: string) {
    update((current) => {
      const isLiked = current.likedItemIds.includes(itemId);
      const favoriteByCategory = { ...current.favoriteByCategory };
      if (isLiked && favoriteByCategory[categoryId] === itemId) delete favoriteByCategory[categoryId];
      return { ...current, schemaVersion: 2,
        likedItemIds: isLiked ? current.likedItemIds.filter((id) => id !== itemId) : [...current.likedItemIds, itemId],
        favoriteByCategory };
    });
  }

  function toggleFavorite(categoryId: string, itemId: string) {
    update((current) => {
      const favoriteByCategory = { ...current.favoriteByCategory };
      const isFavorite = favoriteByCategory[categoryId] === itemId;
      if (isFavorite) delete favoriteByCategory[categoryId];
      else favoriteByCategory[categoryId] = itemId;
      return { ...current, schemaVersion: 2, favoriteByCategory,
        likedItemIds: isFavorite || current.likedItemIds.includes(itemId)
          ? current.likedItemIds : [...current.likedItemIds, itemId] };
    });
  }

  function setCategoryNote(categoryId: string, note: string) {
    update((current) => ({ ...current, schemaVersion: 2,
      notesByCategory: { ...current.notesByCategory, [categoryId]: note.slice(0, 500) } }));
  }

  function setLastViewedCategory(categoryId: string) {
    setSelection((current) => ({ ...current, lastViewedCategoryId: categoryId }));
  }

  function resetAll() {
    setSelection(DEFAULT_STATE);
  }

  return { selection, hasHydrated, toggleLiked, toggleFavorite, setCategoryNote,
    setLastViewedCategory, resetAll };
}

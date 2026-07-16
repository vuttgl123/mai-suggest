"use client";

import { useEffect, useState } from "react";
import type { PreferenceSelectionState } from "@/types/preference";

export const PREFERENCE_STORAGE_KEY = "dieu-em-yeu:preferences:v1";

const DEFAULT_STATE: PreferenceSelectionState = {
  schemaVersion: 1,
  likedItemIds: [],
  favoriteByCategory: {},
  notesByCategory: {},
  updatedAt: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringRecord(value: unknown): Record<string, string> | null {
  if (!isRecord(value)) return null;
  if (!Object.values(value).every((entry) => typeof entry === "string")) {
    return null;
  }
  return value as Record<string, string>;
}

function parseStoredState(value: unknown): PreferenceSelectionState | null {
  if (!isRecord(value) || value.schemaVersion !== 1) return null;

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
    return null;
  }

  return {
    schemaVersion: 1,
    likedItemIds: [...new Set(likedItemIds)],
    favoriteByCategory: parsedFavorites,
    notesByCategory: Object.fromEntries(
      Object.entries(parsedNotes).map(([key, note]) => [key, note.slice(0, 500)]),
    ),
    updatedAt,
  };
}

function withTimestamp(
  state: Omit<PreferenceSelectionState, "updatedAt">,
): PreferenceSelectionState {
  return { ...state, updatedAt: new Date().toISOString() };
}

export function usePreferenceStorage() {
  const [selection, setSelection] = useState<PreferenceSelectionState>(DEFAULT_STATE);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const hydrateTimer = window.setTimeout(() => {
      let hydratedState = DEFAULT_STATE;

      try {
        const storedValue = window.localStorage.getItem(PREFERENCE_STORAGE_KEY);
        if (storedValue) {
          hydratedState = parseStoredState(JSON.parse(storedValue)) ?? DEFAULT_STATE;
        }
      } catch {
        hydratedState = DEFAULT_STATE;
      }

      setSelection(hydratedState);
      setHasHydrated(true);
    }, 0);

    return () => window.clearTimeout(hydrateTimer);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    try {
      window.localStorage.setItem(PREFERENCE_STORAGE_KEY, JSON.stringify(selection));
    } catch {
      // The interface remains usable when storage is disabled or full.
    }
  }, [hasHydrated, selection]);

  function toggleLiked(itemId: string, categoryId: string) {
    setSelection((current) => {
      const isLiked = current.likedItemIds.includes(itemId);
      const likedItemIds = isLiked
        ? current.likedItemIds.filter((id) => id !== itemId)
        : [...current.likedItemIds, itemId];
      const favoriteByCategory = { ...current.favoriteByCategory };

      if (isLiked && favoriteByCategory[categoryId] === itemId) {
        delete favoriteByCategory[categoryId];
      }

      return withTimestamp({
        schemaVersion: 1,
        likedItemIds,
        favoriteByCategory,
        notesByCategory: current.notesByCategory,
      });
    });
  }

  function toggleFavorite(categoryId: string, itemId: string) {
    setSelection((current) => {
      const favoriteByCategory = { ...current.favoriteByCategory };
      const isFavorite = favoriteByCategory[categoryId] === itemId;

      if (isFavorite) {
        delete favoriteByCategory[categoryId];
      } else {
        favoriteByCategory[categoryId] = itemId;
      }

      return withTimestamp({
        schemaVersion: 1,
        likedItemIds:
          isFavorite || current.likedItemIds.includes(itemId)
            ? current.likedItemIds
            : [...current.likedItemIds, itemId],
        favoriteByCategory,
        notesByCategory: current.notesByCategory,
      });
    });
  }

  function setCategoryNote(categoryId: string, note: string) {
    setSelection((current) =>
      withTimestamp({
        schemaVersion: 1,
        likedItemIds: current.likedItemIds,
        favoriteByCategory: current.favoriteByCategory,
        notesByCategory: {
          ...current.notesByCategory,
          [categoryId]: note.slice(0, 500),
        },
      }),
    );
  }

  function resetAll() {
    setSelection(DEFAULT_STATE);
  }

  return {
    selection,
    hasHydrated,
    toggleLiked,
    toggleFavorite,
    setCategoryNote,
    resetAll,
  };
}

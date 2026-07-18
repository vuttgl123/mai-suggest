import { describe, expect, it } from "vitest";
import {
  DEFAULT_SELECTION_STATE,
  parseStoredSelection,
} from "./selection-state";
import {
  PREFERENCE_STORAGE_KEY,
  readSelection,
  writeSelection,
} from "./selection-storage";

describe("selection storage", () => {
  it("migrates schema v1 and removes duplicate liked ids", () => {
    const parsed = parseStoredSelection({
      schemaVersion: 1,
      likedItemIds: ["item-1", "item-1"],
      favoriteByCategory: { gifts: "item-1" },
      notesByCategory: { gifts: "a".repeat(520) },
      updatedAt: "2026-07-16T00:00:00.000Z",
    });

    expect(parsed).toEqual({
      schemaVersion: 2,
      likedItemIds: ["item-1"],
      favoriteByCategory: { gifts: "item-1" },
      notesByCategory: { gifts: "a".repeat(500) },
      lastViewedCategoryId: null,
      updatedAt: "2026-07-16T00:00:00.000Z",
    });
  });

  it("falls back to the default state for invalid JSON data", () => {
    expect(parseStoredSelection({ schemaVersion: 9 })).toEqual(
      DEFAULT_SELECTION_STATE,
    );
  });

  it("reads a valid state from the existing storage key", () => {
    localStorage.setItem(
      PREFERENCE_STORAGE_KEY,
      JSON.stringify({
        ...DEFAULT_SELECTION_STATE,
        likedItemIds: ["item-1"],
      }),
    );

    expect(readSelection(localStorage).likedItemIds).toEqual(["item-1"]);
  });

  it("falls back when storage access is blocked", () => {
    const blockedStorage = {
      getItem() {
        throw new DOMException("Blocked", "SecurityError");
      },
    } as unknown as Storage;

    expect(readSelection(blockedStorage)).toEqual(DEFAULT_SELECTION_STATE);
  });

  it("reports whether a storage write succeeded", () => {
    expect(writeSelection(localStorage, DEFAULT_SELECTION_STATE)).toBe(true);

    const fullStorage = {
      setItem() {
        throw new DOMException("Full", "QuotaExceededError");
      },
    } as unknown as Storage;

    expect(writeSelection(fullStorage, DEFAULT_SELECTION_STATE)).toBe(false);
  });
});

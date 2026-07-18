import { describe, expect, it } from "vitest";
import type { PreferenceSelectionState } from "@/types/preference";
import {
  DEFAULT_SELECTION_STATE,
  selectionReducer,
} from "./selection-state";

function createState(
  overrides: Partial<PreferenceSelectionState> = {},
): PreferenceSelectionState {
  return {
    ...DEFAULT_SELECTION_STATE,
    likedItemIds: [],
    favoriteByCategory: {},
    notesByCategory: {},
    ...overrides,
  };
}

describe("selection reducer", () => {
  it("removes a favorite when its liked state is removed", () => {
    const next = selectionReducer(
      createState({
        likedItemIds: ["item-1"],
        favoriteByCategory: { gifts: "item-1" },
      }),
      { type: "toggle-liked", itemId: "item-1", categoryId: "gifts" },
    );

    expect(next.likedItemIds).not.toContain("item-1");
    expect(next.favoriteByCategory.gifts).toBeUndefined();
  });

  it("likes an item when it becomes a favorite", () => {
    const next = selectionReducer(createState(), {
      type: "toggle-favorite",
      itemId: "item-1",
      categoryId: "gifts",
    });

    expect(next.likedItemIds).toContain("item-1");
    expect(next.favoriteByCategory.gifts).toBe("item-1");
  });

  it("keeps a liked item when favorite is toggled off", () => {
    const next = selectionReducer(
      createState({
        likedItemIds: ["item-1"],
        favoriteByCategory: { gifts: "item-1" },
      }),
      { type: "toggle-favorite", itemId: "item-1", categoryId: "gifts" },
    );

    expect(next.likedItemIds).toContain("item-1");
    expect(next.favoriteByCategory.gifts).toBeUndefined();
  });

  it("limits notes to 500 characters", () => {
    const next = selectionReducer(createState(), {
      type: "set-note",
      categoryId: "gifts",
      note: "a".repeat(520),
    });

    expect(next.notesByCategory.gifts).toHaveLength(500);
  });

  it("updates the last viewed category without changing updatedAt", () => {
    const next = selectionReducer(
      createState({ updatedAt: "2026-07-16T00:00:00.000Z" }),
      { type: "set-last-viewed", categoryId: "bags" },
    );

    expect(next.lastViewedCategoryId).toBe("bags");
    expect(next.updatedAt).toBe("2026-07-16T00:00:00.000Z");
  });
});

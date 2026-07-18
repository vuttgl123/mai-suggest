import { describe, expect, it } from "vitest";
import type {
  PreferenceCategory,
  PreferenceSelectionState,
} from "@/types/preference";
import { createSelectionProgress } from "./selection-progress";

const categories = [
  { id: "gifts", name: "Quà tặng", items: [{ id: "gift-1" }] },
  { id: "trips", name: "Chuyến đi", items: [{ id: "trip-1" }] },
] as PreferenceCategory[];

function selection(
  overrides: Partial<PreferenceSelectionState> = {},
): PreferenceSelectionState {
  return {
    schemaVersion: 2,
    likedItemIds: [],
    favoriteByCategory: {},
    notesByCategory: {},
    lastViewedCategoryId: null,
    updatedAt: null,
    ...overrides,
  };
}

describe("createSelectionProgress", () => {
  it("does not report completion when selected categories are zero", () => {
    const model = createSelectionProgress(categories, selection());

    expect(model.isComplete).toBe(false);
    expect(model.selectedCategoryCount).toBe(0);
  });

  it("reports a useful next category without requiring all categories", () => {
    const model = createSelectionProgress(
      categories,
      selection({ likedItemIds: ["gift-1"] }),
    );

    expect(model.selectedCategoryCount).toBe(1);
    expect(model.isComplete).toBe(false);
    expect(model.nextCategory).toEqual({ id: "trips", name: "Chuyến đi" });
  });

  it("ignores unknown items and counts a valid note as category progress", () => {
    const model = createSelectionProgress(
      categories,
      selection({
        likedItemIds: ["missing"],
        notesByCategory: { trips: "Ưu tiên gần biển" },
      }),
    );

    expect(model.selectedItemCount).toBe(0);
    expect(model.selectedCategoryCount).toBe(1);
    expect(model.nextCategory?.id).toBe("gifts");
  });
});

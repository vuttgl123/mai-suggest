import { describe, expect, it } from "vitest";
import type {
  PreferenceData,
  PreferenceItem,
  PreferenceSelectionState,
} from "@/types/preference";
import { selectValidSelection } from "./selection-selectors";

function item(id: string): PreferenceItem {
  return { id, name: id } as PreferenceItem;
}

const data: PreferenceData = {
  site: {} as PreferenceData["site"],
  taxonomy: { occasions: [], styles: [], budgets: [], giftTypes: [] },
  collections: [],
  categories: [
    {
      id: "gifts",
      name: "Quà",
      description: "",
      notePlaceholder: "",
      items: [item("shared"), item("gift-2")],
    },
    {
      id: "trips",
      name: "Chuyến đi",
      description: "",
      notePlaceholder: "",
      items: [item("shared"), item("trip-1")],
    },
  ],
};

function selection(
  overrides: Partial<PreferenceSelectionState>,
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

describe("selectValidSelection", () => {
  it("ignores invalid ids and does not duplicate an item across categories", () => {
    const result = selectValidSelection(
      data,
      selection({
        likedItemIds: ["shared", "shared", "missing"],
        favoriteByCategory: { gifts: "missing", unknown: "trip-1" },
        notesByCategory: { unknown: "Không hợp lệ" },
      }),
    );

    expect(result).toHaveLength(1);
    expect(result[0].category.id).toBe("gifts");
    expect(result[0].items.map((entry) => entry.id)).toEqual(["shared"]);
    expect(result[0].favoriteItemId).toBeUndefined();
  });

  it("includes a valid favorite and a note-only category in JSON order", () => {
    const result = selectValidSelection(
      data,
      selection({
        favoriteByCategory: { gifts: "gift-2" },
        notesByCategory: { trips: "Ưu tiên gần biển" },
      }),
    );

    expect(result.map((entry) => entry.category.id)).toEqual(["gifts", "trips"]);
    expect(result[0].items.map((entry) => entry.id)).toEqual(["gift-2"]);
    expect(result[0].favoriteItemId).toBe("gift-2");
    expect(result[1].items).toEqual([]);
    expect(result[1].note).toBe("Ưu tiên gần biển");
  });
});

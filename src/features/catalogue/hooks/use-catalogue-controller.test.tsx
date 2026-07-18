import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type {
  PreferenceCategory,
  PreferenceData,
  PreferenceSelectionState,
} from "@/types/preference";
import { useCatalogueController } from "./use-catalogue-controller";

const categories: PreferenceCategory[] = [
  {
    id: "gifts",
    name: "Quà",
    description: "Mô tả quà",
    notePlaceholder: "Ghi chú",
    items: [
      {
        id: "gift-1",
        name: "Quà một",
        description: "Mô tả",
        whyItFits: "Phù hợp",
        imageUrl: "https://example.com/gift.jpg",
        imageAlt: "Quà",
        messageTitle: "Lời nhắn",
        message: "Nội dung",
        tags: ["Tinh tế", "Thiết thực"],
        occasions: ["ngay-thuong"],
        styles: ["toi-gian"],
        budgetTier: "duoi-500k",
        giftType: "vat-pham",
      },
    ],
  },
  {
    id: "bags",
    name: "Túi",
    description: "Mô tả túi",
    notePlaceholder: "Ghi chú",
    items: [
      {
        id: "bag-1",
        name: "Túi một",
        description: "Mô tả",
        whyItFits: "Phù hợp",
        imageUrl: "https://example.com/bag.jpg",
        imageAlt: "Túi",
        messageTitle: "Lời nhắn",
        message: "Nội dung",
        tags: ["Thanh lịch", "Thiết thực"],
        occasions: ["ngay-thuong"],
        styles: ["toi-gian"],
        budgetTier: "duoi-500k",
        giftType: "vat-pham",
      },
    ],
  },
];

const data: PreferenceData = {
  site: {
    title: "Điều Em Yêu",
    recipientName: "Em",
    eyebrow: "Gợi ý",
    heroMessage: "Lời mở đầu",
    heroSubMessage: "Lời phụ",
    heroImage: "https://example.com/hero.jpg",
    summaryEmail: "hello@example.com",
  },
  categories,
  taxonomy: { occasions: [], styles: [], budgets: [], giftTypes: [] },
  collections: [],
};

function createSelection(
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

describe("useCatalogueController", () => {
  it("restores the last viewed category when it is still visible", () => {
    const { result } = renderHook(() =>
      useCatalogueController({
        data,
        filteredCategories: categories,
        selection: createSelection({ lastViewedCategoryId: "bags" }),
        hasHydrated: true,
        onLastViewedCategoryChange: vi.fn(),
        onReset: vi.fn(),
      }),
    );

    expect(result.current.activeCategory?.id).toBe("bags");
  });

  it("falls back to the first category after filters hide the active one", () => {
    const options = {
      data,
      selection: createSelection(),
      hasHydrated: true,
      onLastViewedCategoryChange: vi.fn(),
      onReset: vi.fn(),
    };
    const { result, rerender } = renderHook(
      ({ filteredCategories }) =>
        useCatalogueController({ ...options, filteredCategories }),
      { initialProps: { filteredCategories: categories } },
    );

    act(() => result.current.selectCategory("bags"));
    rerender({ filteredCategories: [categories[0]] });

    expect(result.current.activeCategory?.id).toBe("gifts");
  });

  it("ignores selected item ids that no longer exist in JSON", () => {
    const { result } = renderHook(() =>
      useCatalogueController({
        data,
        filteredCategories: categories,
        selection: createSelection({ likedItemIds: ["missing"] }),
        hasHydrated: true,
        onLastViewedCategoryChange: vi.fn(),
        onReset: vi.fn(),
      }),
    );

    expect(result.current.selectedItemIds).toEqual([]);
    expect(result.current.canViewSummary).toBe(false);
    expect(result.current.resumeSelection).toBeNull();
  });

  it("does not expose resume state before hydration", () => {
    const { result } = renderHook(() =>
      useCatalogueController({
        data,
        filteredCategories: categories,
        selection: createSelection({ likedItemIds: ["gift-1"] }),
        hasHydrated: false,
        onLastViewedCategoryChange: vi.fn(),
        onReset: vi.fn(),
      }),
    );

    expect(result.current.resumeSelection).toBeNull();
  });

  it("allows summary for a valid note-only selection", () => {
    const { result } = renderHook(() =>
      useCatalogueController({
        data,
        filteredCategories: categories,
        selection: createSelection({ notesByCategory: { gifts: "Màu đỏ" } }),
        hasHydrated: true,
        onLastViewedCategoryChange: vi.fn(),
        onReset: vi.fn(),
      }),
    );

    expect(result.current.selectedCategoryCount).toBe(1);
    expect(result.current.canViewSummary).toBe(true);
    expect(result.current.resumeSelection).toEqual({
      selectedItemCount: 0,
      selectedCategoryCount: 1,
      updatedAt: null,
    });
  });
});

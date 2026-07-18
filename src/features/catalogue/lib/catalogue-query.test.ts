import { describe, expect, it } from "vitest";
import type {
  PreferenceData,
  PreferenceItem,
} from "@/types/preference";
import {
  countActiveFilters,
  filterCatalogue,
  normalizeVietnameseSearch,
  type CatalogueFilters,
} from "./catalogue-query";

function createItem(
  id: string,
  overrides: Partial<PreferenceItem> = {},
): PreferenceItem {
  return {
    id,
    name: id,
    description: `Mô tả ${id}`,
    whyItFits: `Phù hợp ${id}`,
    imageUrl: `https://example.com/${id}.jpg`,
    imageAlt: id,
    messageTitle: "Lời nhắn",
    message: "Nội dung lời nhắn",
    tags: ["Tinh tế", "Thiết thực"],
    occasions: ["ngay-thuong"],
    styles: ["toi-gian"],
    budgetTier: "duoi-500k",
    giftType: "vat-pham",
    ...overrides,
  };
}

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
  taxonomy: {
    occasions: [
      { id: "ngay-thuong", label: "Ngày thường" },
      { id: "sinh-nhat", label: "Sinh nhật" },
    ],
    styles: [{ id: "toi-gian", label: "Tối giản" }],
    budgets: [{ id: "duoi-500k", label: "Dưới 500 nghìn" }],
    giftTypes: [{ id: "vat-pham", label: "Món đồ" }],
  },
  collections: [
    {
      id: "collection-1",
      name: "Bộ sưu tập",
      description: "Mô tả",
      occasionIds: ["sinh-nhat"],
      itemIds: ["regular", "featured"],
      imageUrl: "https://example.com/collection.jpg",
      imageAlt: "Bộ sưu tập",
    },
  ],
  categories: [
    {
      id: "gifts",
      name: "Quà",
      description: "Mô tả",
      notePlaceholder: "Ghi chú",
      items: [
        createItem("regular", { editorialOrder: 1 }),
        createItem("featured", {
          occasions: ["sinh-nhat"],
          featured: true,
          editorialOrder: 9,
        }),
        createItem("accented", { name: "Điều em yêu" }),
      ],
    },
  ],
};

const emptyFilters: CatalogueFilters = {
  query: "",
  occasionIds: [],
  styleId: "",
  budgetTier: "",
  giftType: "",
  collectionId: "",
  sort: "recommended",
};

describe("catalogue query", () => {
  it("normalizes Vietnamese text for accent-insensitive search", () => {
    expect(normalizeVietnameseSearch("Điều Em Yêu")).toBe("dieu em yeu");
  });

  it("matches Vietnamese text without accents", () => {
    const result = filterCatalogue(data, {
      ...emptyFilters,
      query: "dieu em yeu",
    });

    expect(result[0].items.map((item) => item.id)).toEqual(["accented"]);
  });

  it("uses collection items instead of manual occasions", () => {
    const result = filterCatalogue(data, {
      ...emptyFilters,
      collectionId: "collection-1",
      occasionIds: ["sinh-nhat"],
    });

    expect(result[0].items.map((item) => item.id)).toEqual([
      "featured",
      "regular",
    ]);
  });

  it("sorts featured items before editorial order", () => {
    const result = filterCatalogue(data, emptyFilters);

    expect(result[0].items.slice(0, 2).map((item) => item.id)).toEqual([
      "featured",
      "regular",
    ]);
  });

  it("sorts by budget rank without parsing reference price", () => {
    const pricedData: PreferenceData = {
      ...data,
      categories: [
        {
          ...data.categories[0],
          items: [
            createItem("premium", {
              budgetTier: "tren-10m",
              referencePrice: "100.000 đ",
            }),
            createItem("accessible", {
              budgetTier: "duoi-500k",
              referencePrice: "20.000.000 đ",
            }),
          ],
        },
      ],
    };

    expect(
      filterCatalogue(pricedData, {
        ...emptyFilters,
        sort: "price-ascending",
      })[0].items.map((item) => item.id),
    ).toEqual(["accessible", "premium"]);
    expect(
      filterCatalogue(pricedData, {
        ...emptyFilters,
        sort: "price-descending",
      })[0].items.map((item) => item.id),
    ).toEqual(["premium", "accessible"]);
  });

  it("sorts names with the Vietnamese locale without mutating JSON", () => {
    const originalItems = data.categories[0].items;
    const result = filterCatalogue(data, { ...emptyFilters, sort: "name" });

    expect(result[0].items.map((item) => item.name)).toEqual(
      [...originalItems]
        .sort((first, second) => first.name.localeCompare(second.name, "vi"))
        .map((item) => item.name),
    );
    expect(data.categories[0].items).toBe(originalItems);
  });

  it("counts a collection instead of its derived occasions", () => {
    expect(
      countActiveFilters({
        ...emptyFilters,
        query: "hoa",
        occasionIds: ["sinh-nhat"],
        collectionId: "collection-1",
      }),
    ).toBe(2);
  });
});

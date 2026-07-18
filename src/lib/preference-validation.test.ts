import { describe, expect, it } from "vitest";
import { getPreferenceData } from "@/lib/get-preference-data";
import { parseItem } from "@/lib/preference-validation";

const validItem = {
  id: "item-1",
  name: "Một món quà",
  description: "Mô tả món quà",
  imageUrl: "https://example.com/item.jpg",
  imageAlt: "Một món quà trên nền sáng",
  message: "Lời nhắn riêng",
  tags: ["Tinh tế", "Thiết thực"],
};

describe("preference validation", () => {
  it("rejects an item without a message", () => {
    expect(parseItem({ ...validItem, message: "" })).toBeNull();
  });

  it("loads and validates every JSON file shipped in public/data", async () => {
    const data = await getPreferenceData();
    const itemIds = data.categories.flatMap((category) =>
      category.items.map((item) => item.id),
    );

    expect(data.site.title).toBe("Điều Em Yêu");
    expect(data.categories).toHaveLength(7);
    expect(data.collections.length).toBeGreaterThan(0);
    expect(new Set(itemIds).size).toBe(itemIds.length);
  });
});

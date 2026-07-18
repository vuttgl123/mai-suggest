import { describe, expect, it } from "vitest";
import type { PreferenceData, PreferenceSelectionState } from "@/types/preference";
import { createSelectionEmailUrl } from "./selection-email";
import { createSelectionText } from "./selection-text";

const data: PreferenceData = {
  site: {
    title: "Điều Em Yêu",
    recipientName: "Mai",
    eyebrow: "",
    heroMessage: "",
    heroSubMessage: "",
    heroImage: "",
    summaryEmail: "hello@example.com",
  },
  taxonomy: { occasions: [], styles: [], budgets: [], giftTypes: [] },
  collections: [],
  categories: [
    {
      id: "gifts",
      name: "Quà tặng",
      description: "",
      notePlaceholder: "",
      items: [
        {
          id: "flower",
          name: "Bó hoa theo mùa",
          sourceName: "Tiệm Hoa",
          sourceUrl: "https://example.com/hoa",
        } as PreferenceData["categories"][number]["items"][number],
      ],
    },
    {
      id: "trips",
      name: "Chuyến đi",
      description: "",
      notePlaceholder: "",
      items: [],
    },
  ],
};

const selection: PreferenceSelectionState = {
  schemaVersion: 2,
  likedItemIds: ["missing", "flower"],
  favoriteByCategory: { gifts: "flower", trips: "missing" },
  notesByCategory: { gifts: "  Thêm thiệp viết tay  " },
  lastViewedCategoryId: "gifts",
  updatedAt: null,
};

describe("selection export text", () => {
  it("uses valid JSON order and includes favorite, note and source", () => {
    const text = createSelectionText(data, selection);

    expect(text).toContain("QUÀ TẶNG");
    expect(text).toContain("- Bó hoa theo mùa (Yêu thích nhất)");
    expect(text).toContain(
      "Nguồn tham khảo: Tiệm Hoa - https://example.com/hoa",
    );
    expect(text).toContain("Ghi chú:\nThêm thiệp viết tay");
    expect(text).not.toContain("missing");
    expect(text).not.toContain("undefined");
  });

  it("encodes Vietnamese email subject and body deterministically", () => {
    const url = createSelectionEmailUrl(data, selection);
    const params = new URL(url).searchParams;

    expect(decodeURIComponent(url.split("?")[0])).toBe(
      "mailto:hello@example.com",
    );
    expect(params.get("subject")).toBe("Những điều mai yêu");
    expect(params.get("body")).toBe(createSelectionText(data, selection));
  });
});

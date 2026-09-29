import { describe, expect, it } from "vitest";
import { toTimelineChapterPreview } from "@/modules/timeline/infrastructure/timeline-mappers";

describe("toTimelineChapterPreview", () => {
  it("maps the preview columns including the date the chapter happened", () => {
    expect(
      toTimelineChapterPreview({
        id: "chapter-id",
        date_label: "Tháng Ba",
        occurred_on: "2026-03-14",
        title: "Buổi sáng ở Tam Đảo",
        image_url: "https://cdn.example/tam-dao.jpg",
        image_alt_text: "Sương sớm",
        sort_order: 7,
      }),
    ).toEqual({
      id: "chapter-id",
      dateLabel: "Tháng Ba",
      occurredOn: "2026-03-14",
      title: "Buổi sáng ở Tam Đảo",
      imageUrl: "https://cdn.example/tam-dao.jpg",
      imageAltText: "Sương sớm",
      sortOrder: 7,
    });
  });
});

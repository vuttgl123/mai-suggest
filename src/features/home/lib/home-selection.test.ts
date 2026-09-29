import { describe, expect, it } from "vitest";
import {
  selectLivingCover,
  selectTodayNote,
} from "@/features/home/lib/home-selection";
import type { CatalogueItemSummary } from "@/modules/catalogue/domain/catalogue-read-models";
import type { FutureLetterSummary } from "@/modules/future-letters/domain/future-letter-models";
import type { TimelineChapterPreview } from "@/modules/timeline/domain/timeline-models";

function chapter(overrides: Partial<TimelineChapterPreview>): TimelineChapterPreview {
  return {
    id: "chapter",
    dateLabel: "Mùa xuân",
    occurredOn: null,
    title: "Một chương",
    imageUrl: null,
    imageAltText: null,
    sortOrder: 0,
    ...overrides,
  };
}

function item(overrides: Partial<CatalogueItemSummary>): CatalogueItemSummary {
  return {
    id: "item",
    categoryId: "category",
    slug: "item",
    kind: "place",
    title: "Một điều",
    summary: null,
    priceLabel: null,
    primaryImage: null,
    ...overrides,
  };
}

function letter(opensAt: string): FutureLetterSummary {
  return {
    id: "letter",
    authorId: "author",
    title: "Gửi mùa đông",
    opensAt,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    author: { displayName: "Huy", avatarUrl: null },
  };
}

describe("selectLivingCover", () => {
  it("uses the most recent chapter that has an image and alt text", () => {
    const cover = selectLivingCover({
      chapters: [
        chapter({ id: "a", occurredOn: "2025-01-02", imageUrl: "a.jpg", imageAltText: "A", sortOrder: 1 }),
        chapter({ id: "b", occurredOn: "2026-03-14", imageUrl: "b.jpg", imageAltText: "B", sortOrder: 2 }),
        chapter({ id: "c", occurredOn: "2026-06-01", imageUrl: "c.jpg", imageAltText: null, sortOrder: 3 }),
      ],
      featuredItem: null,
      featuredItemCategoryName: null,
    });

    expect(cover).toEqual({
      kind: "chapter",
      chapterId: "b",
      sequence: 2,
      title: "Một chương",
      dateLabel: "Mùa xuân",
      occurredOn: "2026-03-14",
      imageUrl: "b.jpg",
      imageAlt: "B",
    });
  });

  it("falls back to the last chapter by order when no chapter has a date", () => {
    const cover = selectLivingCover({
      chapters: [
        chapter({ id: "a", imageUrl: "a.jpg", imageAltText: "A", sortOrder: 1 }),
        chapter({ id: "b", imageUrl: "b.jpg", imageAltText: "B", sortOrder: 5 }),
      ],
      featuredItem: null,
      featuredItemCategoryName: null,
    });

    expect(cover.kind === "chapter" && cover.chapterId).toBe("b");
  });

  it("uses the featured item image when no chapter has an image", () => {
    const cover = selectLivingCover({
      chapters: [chapter({ id: "a" })],
      featuredItem: item({
        slug: "tiem-hoa",
        title: "Tiệm hoa",
        primaryImage: { id: "img", url: "hoa.jpg", altText: null, sortOrder: 0 },
      }),
      featuredItemCategoryName: "Món quà nhỏ",
    });

    expect(cover).toEqual({
      kind: "item",
      slug: "tiem-hoa",
      title: "Tiệm hoa",
      categoryName: "Món quà nhỏ",
      imageUrl: "hoa.jpg",
      imageAlt: "Tiệm hoa",
    });
  });

  it("returns a text cover instead of inventing a memory", () => {
    expect(
      selectLivingCover({
        chapters: [],
        featuredItem: item({}),
        featuredItemCategoryName: null,
      }),
    ).toEqual({ kind: "text" });
  });
});

describe("selectTodayNote", () => {
  const now = new Date("2026-09-29T03:00:00.000Z"); // 10:00 in Vietnam

  it("prefers a letter that opened within the last seven days", () => {
    const note = selectTodayNote({
      latestOpenedLetter: letter("2026-09-27T13:30:00.000Z"),
      chapters: [chapter({ occurredOn: "2025-09-29" })],
      now,
    });

    expect(note?.kind).toBe("letter");
  });

  it("ignores letters older than seven days or not yet open", () => {
    expect(
      selectTodayNote({ latestOpenedLetter: letter("2026-09-20T00:00:00.000Z"), chapters: [], now }),
    ).toBeNull();
    expect(
      selectTodayNote({ latestOpenedLetter: letter("2026-09-30T00:00:00.000Z"), chapters: [], now }),
    ).toBeNull();
  });

  it("finds a chapter from this day in an earlier year, in Vietnam time", () => {
    const note = selectTodayNote({
      latestOpenedLetter: null,
      chapters: [
        chapter({ id: "old", occurredOn: "2023-09-29", sortOrder: 1 }),
        chapter({ id: "recent", occurredOn: "2025-09-29", sortOrder: 2 }),
        chapter({ id: "same-year", occurredOn: "2026-09-29", sortOrder: 3 }),
      ],
      now,
    });

    expect(note).toEqual({
      kind: "anniversary",
      chapterId: "recent",
      sequence: 2,
      title: "Một chương",
      yearsAgo: 1,
    });
  });

  it("uses the Vietnam calendar day around midnight UTC", () => {
    // 2026-09-28T18:30Z is already 29 September 01:30 in Vietnam.
    const note = selectTodayNote({
      latestOpenedLetter: null,
      chapters: [chapter({ id: "a", occurredOn: "2024-09-29" })],
      now: new Date("2026-09-28T18:30:00.000Z"),
    });

    expect(note?.kind).toBe("anniversary");
  });

  it("returns nothing when there is nothing real to show", () => {
    expect(selectTodayNote({ latestOpenedLetter: null, chapters: [], now })).toBeNull();
  });
});

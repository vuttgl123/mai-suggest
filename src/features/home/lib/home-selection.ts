import type { CatalogueItemSummary } from "@/modules/catalogue/domain/catalogue-read-models";
import type { FutureLetterSummary } from "@/modules/future-letters/domain/future-letter-models";
import { toVietnamDateTimeParts } from "@/modules/future-letters/domain/future-letter-time";
import type { TimelineChapterPreview } from "@/modules/timeline/domain/timeline-models";

export type LivingCover =
  | {
      kind: "chapter";
      chapterId: string;
      sequence: number;
      title: string;
      dateLabel: string;
      occurredOn: string | null;
      imageUrl: string;
      imageAlt: string;
    }
  | {
      kind: "item";
      slug: string;
      title: string;
      categoryName: string | null;
      imageUrl: string;
      imageAlt: string;
    }
  | { kind: "text" };

export type TodayNote =
  | { kind: "letter"; letter: FutureLetterSummary }
  | {
      kind: "anniversary";
      chapterId: string;
      sequence: number;
      title: string;
      yearsAgo: number;
    };

const RECENT_LETTER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Picks the photo for the home cover from real content only: the latest
 * chapter with an image, then the featured item, then a text-only cover.
 * `chapters` must be in reading order; `sequence` is the 1-based position.
 */
export function selectLivingCover({
  chapters,
  featuredItem,
  featuredItemCategoryName,
}: {
  chapters: TimelineChapterPreview[];
  featuredItem: CatalogueItemSummary | null;
  featuredItemCategoryName: string | null;
}): LivingCover {
  const illustrated = chapters
    .map((chapter, index) => ({ chapter, sequence: index + 1 }))
    .filter(({ chapter }) => Boolean(chapter.imageUrl && chapter.imageAltText));

  if (illustrated.length) {
    const [latest] = [...illustrated].sort((left, right) => {
      const leftDate = left.chapter.occurredOn ?? "";
      const rightDate = right.chapter.occurredOn ?? "";
      if (leftDate !== rightDate) return rightDate.localeCompare(leftDate);
      return right.chapter.sortOrder - left.chapter.sortOrder;
    });

    return {
      kind: "chapter",
      chapterId: latest.chapter.id,
      sequence: latest.sequence,
      title: latest.chapter.title,
      dateLabel: latest.chapter.dateLabel,
      occurredOn: latest.chapter.occurredOn,
      imageUrl: latest.chapter.imageUrl as string,
      imageAlt: latest.chapter.imageAltText as string,
    };
  }

  if (featuredItem?.primaryImage) {
    return {
      kind: "item",
      slug: featuredItem.slug,
      title: featuredItem.title,
      categoryName: featuredItemCategoryName,
      imageUrl: featuredItem.primaryImage.url,
      imageAlt: featuredItem.primaryImage.altText ?? featuredItem.title,
    };
  }

  return { kind: "text" };
}

/**
 * One optional note for today: a letter that opened in the last seven days,
 * otherwise a chapter that happened on this calendar day (Vietnam time) in an
 * earlier year. Returns null when there is nothing real to show.
 */
export function selectTodayNote({
  latestOpenedLetter,
  chapters,
  now,
}: {
  latestOpenedLetter: FutureLetterSummary | null;
  chapters: TimelineChapterPreview[];
  now: Date;
}): TodayNote | null {
  if (latestOpenedLetter) {
    const elapsed = now.getTime() - new Date(latestOpenedLetter.opensAt).getTime();
    if (elapsed >= 0 && elapsed <= RECENT_LETTER_WINDOW_MS) {
      return { kind: "letter", letter: latestOpenedLetter };
    }
  }

  const today = toVietnamDateTimeParts(now.toISOString())?.date;
  if (!today) return null;

  const [todayYear, todayMonthDay] = [Number(today.slice(0, 4)), today.slice(5)];
  const matches = chapters
    .map((chapter, index) => ({ chapter, sequence: index + 1 }))
    .filter(({ chapter }) => {
      if (!chapter.occurredOn) return false;
      const year = Number(chapter.occurredOn.slice(0, 4));
      return chapter.occurredOn.slice(5) === todayMonthDay && year < todayYear;
    })
    .sort((left, right) =>
      (right.chapter.occurredOn ?? "").localeCompare(left.chapter.occurredOn ?? ""),
    );

  const [match] = matches;
  if (!match) return null;

  return {
    kind: "anniversary",
    chapterId: match.chapter.id,
    sequence: match.sequence,
    title: match.chapter.title,
    yearsAgo: todayYear - Number(match.chapter.occurredOn?.slice(0, 4)),
  };
}

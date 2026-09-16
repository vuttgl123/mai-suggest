import type { Result } from "@/core/application/result";
import type { TimelineEntry, TimelineChapterPreview } from "@/modules/timeline/domain/timeline-models";

export interface TimelineReader {
  listVisible(): Promise<Result<TimelineEntry[]>>;
  listVisibleChapterPreviews(): Promise<Result<TimelineChapterPreview[]>>;
  getVisibleChapterDetail(chapterId: string): Promise<Result<TimelineEntry | null>>;
}

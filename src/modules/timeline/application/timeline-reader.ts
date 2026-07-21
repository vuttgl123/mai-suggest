import type { Result } from "@/core/application/result";
import type { TimelineEntry } from "@/modules/timeline/domain/timeline-models";

export interface TimelineReader {
  listVisible(): Promise<Result<TimelineEntry[]>>;
}

import type { Result } from "@/core/application/result";
import type {
  ManagedTimelineEntry,
  ManagedTimelineEntrySummary,
} from "@/modules/timeline/domain/timeline-models";

export interface TimelineAdminReader {
  listManaged(): Promise<Result<ManagedTimelineEntrySummary[]>>;
  findManagedById(id: string): Promise<Result<ManagedTimelineEntry | null>>;
}

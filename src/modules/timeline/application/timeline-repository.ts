import type { Result } from "@/core/application/result";
import type {
  CreateTimelineResponseInput,
  ManagedTimelineEntry,
  TimelineEntryInput,
  UpdateTimelineResponseInput,
} from "@/modules/timeline/domain/timeline-models";

export interface TimelineRepository {
  createEntry(
    ownerId: string,
    input: TimelineEntryInput,
  ): Promise<Result<ManagedTimelineEntry>>;
  updateEntry(
    entryId: string,
    input: TimelineEntryInput,
  ): Promise<Result<ManagedTimelineEntry>>;
  deleteEntry(entryId: string): Promise<Result<void>>;

  createResponse(
    userId: string,
    input: CreateTimelineResponseInput,
  ): Promise<Result<void>>;
  updateResponse(
    responseId: string,
    userId: string,
    input: UpdateTimelineResponseInput,
  ): Promise<Result<void>>;
  deleteResponse(
    responseId: string,
    userId: string,
    canManageAll: boolean,
  ): Promise<Result<void>>;
}

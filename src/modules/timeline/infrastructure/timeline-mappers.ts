import type { Database } from "@/lib/supabase/database.types";
import type {
  TimelineAuthor,
  TimelineEntry,
  TimelineEntryRecord,
  TimelineResponse,
} from "@/modules/timeline/domain/timeline-models";

export type TimelineEntryRow = Database["public"]["Tables"]["timeline_entries"]["Row"];
export type TimelineResponseRow = Database["public"]["Tables"]["timeline_responses"]["Row"];
export type TimelineProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "display_name" | "avatar_url"
>;

export function toTimelineEntryRecord(
  row: TimelineEntryRow,
): TimelineEntryRecord {
  return {
    id: row.id,
    dateLabel: row.date_label,
    occurredOn: row.occurred_on,
    title: row.title,
    story: row.story,
    lesson: row.lesson,
    imageUrl: row.image_url,
    imageAltText: row.image_alt_text,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toTimelineResponse(
  row: TimelineResponseRow,
  author: TimelineAuthor,
): TimelineResponse {
  return {
    id: row.id,
    entryId: row.timeline_entry_id,
    userId: row.user_id,
    author,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toTimelineEntry(
  row: TimelineEntryRow,
  responses: TimelineResponse[],
): TimelineEntry {
  return {
    ...toTimelineEntryRecord(row),
    responses,
  };
}

export function authorsById(
  profileRows: TimelineProfileRow[],
): Map<string, TimelineAuthor> {
  return new Map(
    profileRows.map((profile) => [
      profile.id,
      {
        displayName: profile.display_name?.trim() || "Thành viên",
        avatarUrl: profile.avatar_url,
      },
    ]),
  );
}

export const fallbackTimelineAuthor: TimelineAuthor = {
  displayName: "Thành viên",
  avatarUrl: null,
};

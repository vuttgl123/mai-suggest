import type { SupabaseClient } from "@supabase/supabase-js";
import { failure, success, type Result } from "@/core/application/result";
import type { TimelineAdminReader } from "@/modules/timeline/application/timeline-admin-reader";
import type {
  ManagedTimelineEntry,
  ManagedTimelineEntrySummary,
} from "@/modules/timeline/domain/timeline-models";
import {
  decorateResponses,
} from "@/modules/timeline/infrastructure/supabase-timeline-reader";
import {
  toTimelineEntry,
  toTimelineEntryRecord,
} from "@/modules/timeline/infrastructure/timeline-mappers";
import type { Database } from "@/lib/supabase/database.types";

const ENTRY_COLUMNS =
  "id,date_label,occurred_on,title,story,lesson,image_url,image_alt_text,sort_order,is_published,created_by,created_at,updated_at";
const RESPONSE_COLUMNS =
  "id,timeline_entry_id,user_id,content,created_at,updated_at";

export class SupabaseTimelineAdminReader implements TimelineAdminReader {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listManaged(): Promise<Result<ManagedTimelineEntrySummary[]>> {
    const [entriesResult, responsesResult] = await Promise.all([
      this.client
        .from("timeline_entries")
        .select(ENTRY_COLUMNS)
        .order("sort_order")
        .order("occurred_on"),
      this.client.from("timeline_responses").select("timeline_entry_id"),
    ]);

    if (entriesResult.error || responsesResult.error) {
      return failure("UNEXPECTED_FAILURE");
    }

    const responseCounts = new Map<string, number>();
    for (const response of responsesResult.data ?? []) {
      responseCounts.set(
        response.timeline_entry_id,
        (responseCounts.get(response.timeline_entry_id) ?? 0) + 1,
      );
    }

    return success(
      (entriesResult.data ?? []).map((entry) => ({
        ...toTimelineEntryRecord(entry),
        responseCount: responseCounts.get(entry.id) ?? 0,
      })),
    );
  }

  async findManagedById(
    entryId: string,
  ): Promise<Result<ManagedTimelineEntry | null>> {
    const { data: entryRow, error: entryError } = await this.client
      .from("timeline_entries")
      .select(ENTRY_COLUMNS)
      .eq("id", entryId)
      .maybeSingle();

    if (entryError) return failure("UNEXPECTED_FAILURE");
    if (!entryRow) return success(null);

    const { data: responseRows, error: responseError } = await this.client
      .from("timeline_responses")
      .select(RESPONSE_COLUMNS)
      .eq("timeline_entry_id", entryId)
      .order("created_at");

    if (responseError) return failure("UNEXPECTED_FAILURE");

    const responses = await decorateResponses(this.client, responseRows ?? []);
    if (!responses.ok) return responses;

    return success(toTimelineEntry(entryRow, responses.value.get(entryId) ?? []));
  }
}

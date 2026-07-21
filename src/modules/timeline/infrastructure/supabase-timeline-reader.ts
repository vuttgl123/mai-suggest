import type { SupabaseClient } from "@supabase/supabase-js";
import { failure, success, type Result } from "@/core/application/result";
import type { TimelineReader } from "@/modules/timeline/application/timeline-reader";
import type {
  TimelineEntry,
  TimelineResponse,
} from "@/modules/timeline/domain/timeline-models";
import {
  authorsById,
  fallbackTimelineAuthor,
  toTimelineEntry,
  toTimelineResponse,
  type TimelineProfileRow,
  type TimelineResponseRow,
} from "@/modules/timeline/infrastructure/timeline-mappers";
import type { Database } from "@/lib/supabase/database.types";

const ENTRY_COLUMNS =
  "id,date_label,occurred_on,title,story,lesson,image_url,image_alt_text,sort_order,is_published,created_by,created_at,updated_at";
const RESPONSE_COLUMNS =
  "id,timeline_entry_id,user_id,content,created_at,updated_at";
const PROFILE_COLUMNS = "id,display_name,avatar_url";

export class SupabaseTimelineReader implements TimelineReader {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listVisible(): Promise<Result<TimelineEntry[]>> {
    const { data: entryRows, error: entryError } = await this.client
      .from("timeline_entries")
      .select(ENTRY_COLUMNS)
      .order("sort_order")
      .order("occurred_on");

    if (entryError) return failure("UNEXPECTED_FAILURE");
    if (!entryRows?.length) return success([]);

    const responses = await this.loadDecoratedResponses(
      entryRows.map((entry) => entry.id),
    );
    if (!responses.ok) return responses;

    return success(
      entryRows.map((entry) =>
        toTimelineEntry(entry, responses.value.get(entry.id) ?? []),
      ),
    );
  }

  private async loadDecoratedResponses(
    entryIds: string[],
  ): Promise<Result<Map<string, TimelineResponse[]>>> {
    const { data: responseRows, error: responseError } = await this.client
      .from("timeline_responses")
      .select(RESPONSE_COLUMNS)
      .in("timeline_entry_id", entryIds)
      .order("created_at");

    if (responseError) return failure("UNEXPECTED_FAILURE");
    return decorateResponses(this.client, responseRows ?? []);
  }
}

export async function decorateResponses(
  client: SupabaseClient<Database>,
  responseRows: TimelineResponseRow[],
): Promise<Result<Map<string, TimelineResponse[]>>> {
  const userIds = [...new Set(responseRows.map((response) => response.user_id))];
  const profilesResult = userIds.length
    ? await client
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .in("id", userIds)
    : { data: [] as TimelineProfileRow[], error: null };

  if (profilesResult.error) return failure("UNEXPECTED_FAILURE");

  const authors = authorsById(profilesResult.data ?? []);
  const responsesByEntry = new Map<string, TimelineResponse[]>();

  for (const responseRow of responseRows) {
    const response = toTimelineResponse(
      responseRow,
      authors.get(responseRow.user_id) ?? fallbackTimelineAuthor,
    );
    const entryResponses = responsesByEntry.get(response.entryId) ?? [];
    entryResponses.push(response);
    responsesByEntry.set(response.entryId, entryResponses);
  }

  return success(responsesByEntry);
}

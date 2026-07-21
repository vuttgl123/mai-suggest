import type { SupabaseClient } from "@supabase/supabase-js";
import { failure, success, type Result } from "@/core/application/result";
import type { TimelineRepository } from "@/modules/timeline/application/timeline-repository";
import type {
  CreateTimelineResponseInput,
  ManagedTimelineEntry,
  TimelineEntryInput,
  UpdateTimelineResponseInput,
} from "@/modules/timeline/domain/timeline-models";
import { toTimelineEntry } from "@/modules/timeline/infrastructure/timeline-mappers";
import type { Database } from "@/lib/supabase/database.types";

const ENTRY_COLUMNS =
  "id,date_label,occurred_on,title,story,lesson,image_url,image_alt_text,sort_order,is_published,created_by,created_at,updated_at";

export class SupabaseTimelineRepository implements TimelineRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async createEntry(
    ownerId: string,
    input: TimelineEntryInput,
  ): Promise<Result<ManagedTimelineEntry>> {
    const { data, error } = await this.client
      .from("timeline_entries")
      .insert({
        date_label: input.dateLabel,
        occurred_on: input.occurredOn,
        title: input.title,
        story: input.story,
        lesson: input.lesson,
        image_url: input.imageUrl,
        image_alt_text: input.imageAltText,
        sort_order: input.sortOrder,
        is_published: input.isPublished,
        created_by: ownerId,
      })
      .select(ENTRY_COLUMNS)
      .single();

    if (error) return failure("UNEXPECTED_FAILURE");
    return success(toTimelineEntry(data, []));
  }

  async updateEntry(
    entryId: string,
    input: TimelineEntryInput,
  ): Promise<Result<ManagedTimelineEntry>> {
    const { data, error } = await this.client
      .from("timeline_entries")
      .update({
        date_label: input.dateLabel,
        occurred_on: input.occurredOn,
        title: input.title,
        story: input.story,
        lesson: input.lesson,
        image_url: input.imageUrl,
        image_alt_text: input.imageAltText,
        sort_order: input.sortOrder,
        is_published: input.isPublished,
      })
      .eq("id", entryId)
      .select(ENTRY_COLUMNS)
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    return data ? success(toTimelineEntry(data, [])) : failure("NOT_FOUND");
  }

  async deleteEntry(entryId: string): Promise<Result<void>> {
    const { data, error } = await this.client
      .from("timeline_entries")
      .delete()
      .eq("id", entryId)
      .select("id")
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    return data ? success(undefined) : failure("NOT_FOUND");
  }

  async createResponse(
    userId: string,
    input: CreateTimelineResponseInput,
  ): Promise<Result<void>> {
    const { error } = await this.client.from("timeline_responses").insert({
      timeline_entry_id: input.entryId,
      user_id: userId,
      content: input.content,
    });

    return error ? failure("UNEXPECTED_FAILURE") : success(undefined);
  }

  async updateResponse(
    responseId: string,
    userId: string,
    input: UpdateTimelineResponseInput,
  ): Promise<Result<void>> {
    const { data, error } = await this.client
      .from("timeline_responses")
      .update({ content: input.content })
      .eq("id", responseId)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    return data ? success(undefined) : failure("NOT_FOUND");
  }

  async deleteResponse(
    responseId: string,
    userId: string,
    canManageAll: boolean,
  ): Promise<Result<void>> {
    let request = this.client
      .from("timeline_responses")
      .delete()
      .eq("id", responseId);

    if (!canManageAll) {
      request = request.eq("user_id", userId);
    }

    const { data, error } = await request.select("id").maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    return data ? success(undefined) : failure("NOT_FOUND");
  }
}

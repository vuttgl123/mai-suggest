import type { SupabaseClient } from "@supabase/supabase-js";
import { failure, success, type Result } from "@/core/application/result";
import type { FutureLetterRepository } from "@/modules/future-letters/application/future-letter-repository";
import type {
  FutureLetterInput,
  FutureLetterRecord,
} from "@/modules/future-letters/domain/future-letter-models";
import { toFutureLetterRecord } from "@/modules/future-letters/infrastructure/future-letter-mappers";
import type { Database } from "@/lib/supabase/database.types";

const FUTURE_LETTER_COLUMNS =
  "id,author_id,title,content,opens_at,image_url,image_alt_text,music_url,created_at,updated_at";

export class SupabaseFutureLetterRepository implements FutureLetterRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async create(
    authorId: string,
    input: FutureLetterInput,
  ): Promise<Result<FutureLetterRecord>> {
    const { data, error } = await this.client
      .from("future_letters")
      .insert({
        author_id: authorId,
        title: input.title,
        content: input.content,
        opens_at: input.opensAt,
        image_url: input.imageUrl,
        image_alt_text: input.imageAltText,
        music_url: input.musicUrl,
      })
      .select(FUTURE_LETTER_COLUMNS)
      .single();

    if (error) return failure("UNEXPECTED_FAILURE");
    return success(toFutureLetterRecord(data));
  }

  async update(
    letterId: string,
    authorId: string,
    input: FutureLetterInput,
  ): Promise<Result<FutureLetterRecord>> {
    const { data, error } = await this.client
      .from("future_letters")
      .update({
        title: input.title,
        content: input.content,
        opens_at: input.opensAt,
        image_url: input.imageUrl,
        image_alt_text: input.imageAltText,
        music_url: input.musicUrl,
      })
      .eq("id", letterId)
      .eq("author_id", authorId)
      .select(FUTURE_LETTER_COLUMNS)
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    return data ? success(toFutureLetterRecord(data)) : failure("NOT_FOUND");
  }

  async delete(letterId: string, authorId: string): Promise<Result<void>> {
    const { data, error } = await this.client
      .from("future_letters")
      .delete()
      .eq("id", letterId)
      .eq("author_id", authorId)
      .select("id")
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    return data ? success(undefined) : failure("NOT_FOUND");
  }
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { failure, success, type Result } from "@/core/application/result";
import type { FutureLetterReader } from "@/modules/future-letters/application/future-letter-reader";
import type {
  FutureLetter,
  FutureLetterRecord,
} from "@/modules/future-letters/domain/future-letter-models";
import {
  fallbackFutureLetterAuthor,
  futureLetterAuthorsById,
  toFutureLetter,
  toFutureLetterRecord,
  type FutureLetterProfileRow,
  type FutureLetterRow,
} from "@/modules/future-letters/infrastructure/future-letter-mappers";
import type { Database } from "@/lib/supabase/database.types";

const FUTURE_LETTER_COLUMNS =
  "id,author_id,title,content,opens_at,image_url,image_alt_text,music_url,created_at,updated_at";
const PROFILE_COLUMNS = "id,display_name,avatar_url";

export class SupabaseFutureLetterReader implements FutureLetterReader {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async listOpened(serverNow: string): Promise<Result<FutureLetter[]>> {
    const { data, error } = await this.client
      .from("future_letters")
      .select(FUTURE_LETTER_COLUMNS)
      .lte("opens_at", serverNow)
      .order("opens_at", { ascending: false });

    if (error) return failure("UNEXPECTED_FAILURE");
    if (!data?.length) return success([]);

    const authors = await this.loadAuthors(data);
    if (!authors.ok) return authors;

    return success(
      data.map((row) =>
        toFutureLetter(
          row,
          authors.value.get(row.author_id) ?? fallbackFutureLetterAuthor,
        ),
      ),
    );
  }

  async listManaged(): Promise<Result<FutureLetter[]>> {
    const { data, error } = await this.client
      .from("future_letters")
      .select(FUTURE_LETTER_COLUMNS)
      .order("opens_at", { ascending: false });

    if (error) return failure("UNEXPECTED_FAILURE");
    if (!data?.length) return success([]);

    const authors = await this.loadAuthors(data);
    if (!authors.ok) return authors;

    return success(
      data.map((row) =>
        toFutureLetter(
          row,
          authors.value.get(row.author_id) ?? fallbackFutureLetterAuthor,
        ),
      ),
    );
  }

  async listOwnScheduled(
    authorId: string,
    serverNow: string,
  ): Promise<Result<FutureLetterRecord[]>> {
    const { data, error } = await this.client
      .from("future_letters")
      .select(FUTURE_LETTER_COLUMNS)
      .eq("author_id", authorId)
      .gt("opens_at", serverNow)
      .order("opens_at", { ascending: true });

    if (error) return failure("UNEXPECTED_FAILURE");
    return success((data ?? []).map(toFutureLetterRecord));
  }

  private async loadAuthors(
    letterRows: FutureLetterRow[],
  ): Promise<Result<Map<string, FutureLetter["author"]>>> {
    const authorIds = [...new Set(letterRows.map((letter) => letter.author_id))];
    const { data, error } = await this.client
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .in("id", authorIds);

    if (error) return failure("UNEXPECTED_FAILURE");
    return success(futureLetterAuthorsById((data ?? []) as FutureLetterProfileRow[]));
  }
}

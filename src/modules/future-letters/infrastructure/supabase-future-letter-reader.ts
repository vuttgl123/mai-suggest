import type { SupabaseClient } from "@supabase/supabase-js";
import { failure, success, type Result } from "@/core/application/result";
import type { FutureLetterReader, ListMailboxQuery } from "@/modules/future-letters/application/future-letter-reader";
import type {
  FutureLetter,
  FutureLetterRecord,
  FutureMailboxPage,
} from "@/modules/future-letters/domain/future-letter-models";
import {
  fallbackFutureLetterAuthor,
  futureLetterAuthorsById,
  toFutureLetter,
  toFutureLetterRecord,
  toFutureLetterSummary,
  type FutureLetterProfileRow,
  type FutureLetterRow,
} from "@/modules/future-letters/infrastructure/future-letter-mappers";
import type { Database } from "@/lib/supabase/database.types";

const FUTURE_LETTER_SUMMARY_COLUMNS =
  "id,author_id,title,opens_at,created_at,updated_at";
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

  async listManaged(serverNow: string): Promise<Result<FutureLetter[]>> {
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

  async listMailbox(
    query: ListMailboxQuery,
    serverNow: string,
  ): Promise<Result<FutureMailboxPage>> {
    const limit = 12;
    const offset = (query.page - 1) * limit;

    let dbQuery = this.client
      .from("future_letters")
      .select(FUTURE_LETTER_SUMMARY_COLUMNS, { count: "exact" })
      .lte("opens_at", serverNow);

    if (query.query) {
      dbQuery = dbQuery.ilike("title", `%${query.query}%`);
    }

    const { data, error, count } = await dbQuery
      .order("opens_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return failure("UNEXPECTED_FAILURE");

    const totalCount = count ?? 0;
    if (!data?.length) {
      return success({ items: [], totalCount, hasMore: false });
    }

    const authors = await this.loadAuthorIds(data.map((row) => row.author_id));
    if (!authors.ok) return authors;

    const items = data.map((row) =>
      toFutureLetterSummary(
        row,
        authors.value.get(row.author_id) ?? fallbackFutureLetterAuthor,
      ),
    );

    return success({
      items,
      totalCount,
      hasMore: offset + items.length < totalCount,
    });
  }

  async getOpened(
    id: string,
    serverNow: string,
  ): Promise<Result<FutureLetter>> {
    const { data, error } = await this.client
      .from("future_letters")
      .select(FUTURE_LETTER_COLUMNS)
      .eq("id", id)
      .lte("opens_at", serverNow)
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    if (!data) return failure("NOT_FOUND");

    const authors = await this.loadAuthors([data]);
    if (!authors.ok) return authors;

    return success(
      toFutureLetter(
        data,
        authors.value.get(data.author_id) ?? fallbackFutureLetterAuthor,
      ),
    );
  }

  async getOwnScheduled(
    id: string,
    authorId: string,
    serverNow: string,
  ): Promise<Result<FutureLetter>> {
    const { data, error } = await this.client
      .from("future_letters")
      .select(FUTURE_LETTER_COLUMNS)
      .eq("id", id)
      .eq("author_id", authorId)
      .gt("opens_at", serverNow)
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    if (!data) return failure("NOT_FOUND");

    const authors = await this.loadAuthors([data]);
    if (!authors.ok) return authors;

    return success(
      toFutureLetter(
        data,
        authors.value.get(data.author_id) ?? fallbackFutureLetterAuthor,
      ),
    );
  }

  private async loadAuthors(
    letterRows: FutureLetterRow[],
  ): Promise<Result<Map<string, FutureLetter["author"]>>> {
    return this.loadAuthorIds(letterRows.map((letter) => letter.author_id));
  }

  private async loadAuthorIds(
    ids: string[],
  ): Promise<Result<Map<string, FutureLetter["author"]>>> {
    const authorIds = [...new Set(ids)];
    const { data, error } = await this.client
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .in("id", authorIds);

    if (error) return failure("UNEXPECTED_FAILURE");
    return success(futureLetterAuthorsById((data ?? []) as FutureLetterProfileRow[]));
  }
}

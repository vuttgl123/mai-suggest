import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { SupabaseFutureLetterReader } from "./supabase-future-letter-reader";

type QueryResult = { data: unknown; error: null; count?: number };

function createQuery(result: QueryResult) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    gt: vi.fn(() => query),
    lte: vi.fn(() => query),
    in: vi.fn(() => query),
    ilike: vi.fn(() => query),
    order: vi.fn(() => query),
    range: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: QueryResult) => unknown) => Promise.resolve(result).then(resolve),
  };
  return query;
}

function createClient(query: ReturnType<typeof createQuery>) {
  const from = vi.fn(() => query);
  return { client: { from } as unknown as SupabaseClient<Database>, from };
}

describe("SupabaseFutureLetterReader", () => {
  let query: ReturnType<typeof createQuery>;

  beforeEach(() => {
    query = createQuery({ data: [], error: null, count: 0 });
  });

  it("listMailbox only asks for opened letters and never selects content", async () => {
    const { client, from } = createClient(query);
    await new SupabaseFutureLetterReader(client).listMailbox({ page: 1, query: "" }, "serverNow");

    expect(from).toHaveBeenCalledWith("future_letters");
    expect(query.select).toHaveBeenCalledWith(
      "id,author_id,title,opens_at,created_at,updated_at",
      { count: "exact" },
    );
    expect(query.lte).toHaveBeenCalledWith("opens_at", "serverNow");
    expect(query.order).toHaveBeenCalledWith("opens_at", { ascending: false });
    expect(query.range).toHaveBeenCalledWith(0, 11);
    expect(query.ilike).not.toHaveBeenCalled();
  });

  it("listMailbox filters by title when a query is present", async () => {
    const { client } = createClient(query);
    await new SupabaseFutureLetterReader(client).listMailbox({ page: 2, query: "hello" }, "serverNow");

    expect(query.ilike).toHaveBeenCalledWith("title", "%hello%");
    expect(query.range).toHaveBeenCalledWith(12, 23);
  });

  it("listManaged only returns letters that have already opened", async () => {
    const { client } = createClient(query);
    await new SupabaseFutureLetterReader(client).listManaged("serverNow");

    expect(query.lte).toHaveBeenCalledWith("opens_at", "serverNow");
    expect(query.gt).not.toHaveBeenCalled();
  });
});

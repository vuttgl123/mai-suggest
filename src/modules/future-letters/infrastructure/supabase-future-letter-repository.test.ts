import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { SupabaseFutureLetterRepository } from "./supabase-future-letter-repository";

function createDeleteQuery(data: unknown) {
  const query = {
    delete: vi.fn(() => query),
    eq: vi.fn(() => query),
    lte: vi.fn(() => query),
    gt: vi.fn(() => query),
    select: vi.fn(() => query),
    maybeSingle: vi.fn(() => Promise.resolve({ data, error: null })),
  };
  return query;
}

describe("SupabaseFutureLetterRepository.deleteManaged", () => {
  it("can only remove a letter whose opening time has passed", async () => {
    const query = createDeleteQuery({ id: "letter" });
    const client = { from: vi.fn(() => query) } as unknown as SupabaseClient<Database>;

    const result = await new SupabaseFutureLetterRepository(client).deleteManaged("letter", "serverNow");

    expect(result.ok).toBe(true);
    expect(query.eq).toHaveBeenCalledWith("id", "letter");
    expect(query.lte).toHaveBeenCalledWith("opens_at", "serverNow");
  });

  it("reports NOT_FOUND for a sealed or missing letter", async () => {
    const query = createDeleteQuery(null);
    const client = { from: vi.fn(() => query) } as unknown as SupabaseClient<Database>;

    const result = await new SupabaseFutureLetterRepository(client).deleteManaged("sealed", "serverNow");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("NOT_FOUND");
  });
});

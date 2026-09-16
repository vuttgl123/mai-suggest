import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseFutureLetterReader } from "./supabase-future-letter-reader";

describe("SupabaseFutureLetterReader", () => {
  let mockSupabase: any;
  let mockQuery: any;
  
  beforeEach(() => {
    mockQuery = {
      select: vi.fn(function(this: any) { return this; }),
      eq: vi.fn(function(this: any) { return this; }),
      lte: vi.fn(function(this: any) { return this; }),
      order: vi.fn(function(this: any) { return this; }),
      range: vi.fn(function(this: any) { return this; }),
      ilike: vi.fn(function(this: any) { return this; }),
      single: vi.fn(function(this: any) { return Promise.resolve({ data: null, error: null }); }),
    };

    // Make range also a promise so await works
    mockQuery.range.mockImplementation(() => Promise.resolve({ data: [], error: null, count: 0 }));

    mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };
  });

  it("listMailbox calls expected methods without query", async () => {
    mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });
    
    const reader = new SupabaseFutureLetterReader(mockSupabase as any);
    await reader.listMailbox({ page: 1, query: "" }, "serverNow");

    expect(mockSupabase.from).toHaveBeenCalledWith("future_letters");
    expect(mockQuery.select).toHaveBeenCalled();
    expect(mockQuery.lte).toHaveBeenCalledWith("opens_at", "serverNow");
    expect(mockQuery.order).toHaveBeenCalledWith("opens_at", { ascending: false });
    expect(mockQuery.range).toHaveBeenCalledWith(0, 11);
    expect(mockQuery.ilike).not.toHaveBeenCalled();
  });

  it("listMailbox calls ilike when query is present", async () => {
    mockQuery.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });
    
    const reader = new SupabaseFutureLetterReader(mockSupabase as any);
    await reader.listMailbox({ page: 2, query: "hello" }, "serverNow");

    expect(mockQuery.ilike).toHaveBeenCalledWith("title", "%hello%");
    expect(mockQuery.range).toHaveBeenCalledWith(12, 23);
  });
});

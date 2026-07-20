import { describe, expect, it } from "vitest";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

describe("getSupabasePublicConfig", () => {
  it("rejects missing public Supabase configuration", () => {
    expect(() => getSupabasePublicConfig({})).toThrow(
      "Missing required Supabase public configuration.",
    );
  });

  it("returns only the URL and publishable key", () => {
    expect(
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
        SUPABASE_SECRET_KEY: "must-not-be-returned",
      }),
    ).toEqual({
      url: "https://project.supabase.co",
      publishableKey: "publishable-key",
    });
  });
});

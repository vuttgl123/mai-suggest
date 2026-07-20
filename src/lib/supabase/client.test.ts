import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const mocks = vi.hoisted(() => ({
  createBrowserClient: vi.fn(),
  getSupabasePublicConfig: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: mocks.createBrowserClient,
}));

vi.mock("@/lib/supabase/config", () => ({
  getSupabasePublicConfig: mocks.getSupabasePublicConfig,
}));

describe("createBrowserSupabaseClient", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key");
    mocks.getSupabasePublicConfig.mockReturnValue({
      url: "https://project.supabase.co",
      publishableKey: "publishable-key",
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    mocks.createBrowserClient.mockReset();
    mocks.getSupabasePublicConfig.mockReset();
  });

  it("creates a browser client from the public configuration", () => {
    const expectedClient = { source: "browser" };
    mocks.createBrowserClient.mockReturnValue(expectedClient);

    expect(createBrowserSupabaseClient()).toBe(expectedClient);
    expect(mocks.createBrowserClient).toHaveBeenCalledWith(
      "https://project.supabase.co",
      "publishable-key",
    );
    expect(mocks.getSupabasePublicConfig).toHaveBeenCalledWith({
      NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
    });
  });
});

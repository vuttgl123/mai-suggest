import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const mocks = vi.hoisted(() => {
  const cookieStore = {
    getAll: vi.fn(() => [{ name: "sb-access-token", value: "token" }]),
    set: vi.fn(),
  };

  return {
    cookieStore,
    cookies: vi.fn(async () => cookieStore),
    createServerClient: vi.fn(),
  };
});

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@supabase/ssr", () => ({
  createServerClient: mocks.createServerClient,
}));

describe("createServerSupabaseClient", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "publishable-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    mocks.cookies.mockClear();
    mocks.createServerClient.mockReset();
    mocks.cookieStore.getAll.mockClear();
    mocks.cookieStore.set.mockClear();
  });

  it("binds request cookies to the server Supabase client", async () => {
    const expectedClient = { source: "server" };
    mocks.createServerClient.mockReturnValue(expectedClient);

    await expect(createServerSupabaseClient()).resolves.toBe(expectedClient);
    expect(mocks.createServerClient).toHaveBeenCalledWith(
      "https://project.supabase.co",
      "publishable-key",
      expect.objectContaining({ cookies: expect.any(Object) }),
    );

    const options = mocks.createServerClient.mock.calls[0]?.[2] as {
      cookies: {
        getAll: () => unknown;
        setAll: (cookies: Array<{
          name: string;
          value: string;
          options: Record<string, unknown>;
        }>) => void;
      };
    };

    expect(options.cookies.getAll()).toEqual([
      { name: "sb-access-token", value: "token" },
    ]);

    options.cookies.setAll([
      { name: "sb-refresh-token", value: "refreshed", options: { path: "/" } },
    ]);

    expect(mocks.cookieStore.set).toHaveBeenCalledWith(
      "sb-refresh-token",
      "refreshed",
      { path: "/" },
    );
  });
});

import { describe, expect, it, vi } from "vitest";
import { SupabaseActorReader } from "@/modules/identity/infrastructure/supabase-actor-reader";

type ProfileFixture = {
  id: string;
  email: string | null;
  role: "owner" | "member";
  is_active: boolean;
};

function createSupabaseFixture({
  claims,
  claimsError = null,
  profile = null,
  profileError = null,
}: {
  claims: { sub?: string; email?: string } | null;
  claimsError?: unknown;
  profile?: ProfileFixture | null;
  profileError?: unknown;
}) {
  const maybeSingle = vi.fn(async () => ({ data: profile, error: profileError }));
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  return {
    client: {
      auth: { getClaims: vi.fn(async () => ({ data: { claims }, error: claimsError })) },
      from,
    } as never,
    from,
    select,
    eq,
  };
}

describe("SupabaseActorReader", () => {
  it("returns anonymous without querying profiles when verified claims have no subject", async () => {
    const fixture = createSupabaseFixture({ claims: null });
    const reader = new SupabaseActorReader(fixture.client);

    await expect(reader.readCurrentActor()).resolves.toEqual({
      ok: true,
      value: {
        status: "anonymous",
        userId: null,
        email: null,
        role: null,
        canManageCatalogue: false,
      },
    });
    expect(fixture.from).not.toHaveBeenCalled();
  });

  it("maps an active owner profile to an active actor", async () => {
    const fixture = createSupabaseFixture({
      claims: { sub: "owner-id", email: "owner@example.com" },
      profile: {
        id: "owner-id",
        email: "owner@example.com",
        role: "owner",
        is_active: true,
      },
    });
    const reader = new SupabaseActorReader(fixture.client);

    await expect(reader.readCurrentActor()).resolves.toEqual({
      ok: true,
      value: {
        status: "active",
        userId: "owner-id",
        email: "owner@example.com",
        role: "owner",
        canManageCatalogue: true,
      },
    });
    expect(fixture.from).toHaveBeenCalledWith("profiles");
    expect(fixture.select).toHaveBeenCalledWith("id,email,role,is_active");
    expect(fixture.eq).toHaveBeenCalledWith("id", "owner-id");
  });

  it("maps a missing profile to an inactive actor", async () => {
    const fixture = createSupabaseFixture({
      claims: { sub: "member-id", email: "member@example.com" },
    });
    const reader = new SupabaseActorReader(fixture.client);

    await expect(reader.readCurrentActor()).resolves.toEqual({
      ok: true,
      value: {
        status: "inactive",
        userId: "member-id",
        email: "member@example.com",
        role: "member",
        canManageCatalogue: false,
      },
    });
  });

  it("converts an Auth failure to an unexpected application failure", async () => {
    const fixture = createSupabaseFixture({ claims: null, claimsError: {} });
    const reader = new SupabaseActorReader(fixture.client);

    await expect(reader.readCurrentActor()).resolves.toEqual({
      ok: false,
      error: { code: "UNEXPECTED_FAILURE" },
    });
  });
});

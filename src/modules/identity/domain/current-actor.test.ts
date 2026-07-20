import { describe, expect, it } from "vitest";
import { requireActiveActor } from "@/modules/identity/domain/current-actor";

describe("requireActiveActor", () => {
  it("rejects an anonymous actor", () => {
    expect(
      requireActiveActor({
        status: "anonymous",
        userId: null,
        email: null,
        role: null,
        canManageCatalogue: false,
      }),
    ).toEqual({ ok: false, error: { code: "UNAUTHENTICATED" } });
  });

  it("rejects an inactive actor", () => {
    expect(
      requireActiveActor({
        status: "inactive",
        userId: "member-id",
        email: "member@example.com",
        role: "member",
        canManageCatalogue: false,
      }),
    ).toEqual({ ok: false, error: { code: "ACCESS_DENIED" } });
  });

  it("preserves an active owner actor", () => {
    const actor = {
      status: "active" as const,
      userId: "owner-id",
      email: "owner@example.com",
      role: "owner" as const,
      canManageCatalogue: true as const,
    };

    expect(requireActiveActor(actor)).toEqual({ ok: true, value: actor });
  });
});

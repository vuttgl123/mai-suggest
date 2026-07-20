import { describe, expect, it } from "vitest";
import { failure, success } from "@/core/application/result";
import {
  resolveActivePageAccess,
} from "@/modules/identity/presentation/active-page-access";

describe("resolveActivePageAccess", () => {
  it("sends an anonymous actor to login", () => {
    expect(
      resolveActivePageAccess(
        success({
          status: "anonymous",
          userId: null,
          email: null,
          role: null,
          canManageCatalogue: false,
        } as const),
      ),
    ).toEqual({ kind: "redirect", to: "/login" });
  });

  it("sends an inactive actor to the access-denied page", () => {
    expect(
      resolveActivePageAccess(
        success({
          status: "inactive",
          userId: "user-1",
          email: "member@example.com",
          role: "member",
          canManageCatalogue: false,
        } as const),
      ),
    ).toEqual({ kind: "redirect", to: "/access-denied" });
  });

  it("allows an active owner", () => {
    const actor = {
      status: "active" as const,
      userId: "owner-1",
      email: "owner@example.com",
      role: "owner" as const,
      canManageCatalogue: true as const,
    };

    expect(resolveActivePageAccess(success(actor))).toEqual({
      kind: "allow",
      actor,
    });
  });

  it("fails closed when the actor cannot be resolved", () => {
    expect(resolveActivePageAccess(failure("UNEXPECTED_FAILURE"))).toEqual({
      kind: "redirect",
      to: "/login?error=session_check_failed",
    });
  });
});

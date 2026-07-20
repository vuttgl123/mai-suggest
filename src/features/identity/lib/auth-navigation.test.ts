import { describe, expect, it } from "vitest";
import {
  createLoginPath,
  isPublicAuthPath,
  normalizeAuthNextPath,
} from "@/features/identity/lib/auth-navigation";

describe("normalizeAuthNextPath", () => {
  it("keeps an internal path and its query string", () => {
    expect(normalizeAuthNextPath("/catalogue?tag=gift")).toBe(
      "/catalogue?tag=gift",
    );
  });

  it.each(["https://attacker.example", "//attacker.example", "catalogue", null])(
    "falls back to the home path for unsafe input %s",
    (input) => {
      expect(normalizeAuthNextPath(input)).toBe("/");
    },
  );
});

describe("isPublicAuthPath", () => {
  it("allows only the OAuth entry paths to bypass the session guard", () => {
    expect(isPublicAuthPath("/login")).toBe(true);
    expect(isPublicAuthPath("/auth/callback")).toBe(true);
    expect(isPublicAuthPath("/access-denied")).toBe(true);
    expect(isPublicAuthPath("/")).toBe(false);
  });
});

describe("createLoginPath", () => {
  it("preserves an internal path and query as an encoded next value", () => {
    expect(createLoginPath("/catalogue?tag=gift ideas")).toBe(
      "/login?next=%2Fcatalogue%3Ftag%3Dgift+ideas",
    );
  });
});

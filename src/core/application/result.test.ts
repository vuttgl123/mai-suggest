import { describe, expect, it } from "vitest";
import { failure, success } from "@/core/application/result";

describe("application results", () => {
  it("wraps a successful value", () => {
    expect(success("catalogue")).toEqual({ ok: true, value: "catalogue" });
  });

  it("returns a stable application error code", () => {
    expect(failure("ACCESS_DENIED")).toEqual({
      ok: false,
      error: { code: "ACCESS_DENIED" },
    });
  });
});

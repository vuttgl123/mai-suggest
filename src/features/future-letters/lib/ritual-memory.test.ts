import { afterEach, describe, expect, it, vi } from "vitest";
import { hasSeenRitual, markRitualSeen } from "@/features/future-letters/lib/ritual-memory";

describe("ritual memory", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("remembers which letters already played the opening ritual on this device", () => {
    expect(hasSeenRitual("letter-1")).toBe(false);
    markRitualSeen("letter-1");
    expect(hasSeenRitual("letter-1")).toBe(true);
    expect(hasSeenRitual("letter-2")).toBe(false);
  });

  it("treats corrupted storage as nothing seen", () => {
    window.localStorage.setItem("dieu-em-yeu:letter-ritual-seen", "{not json");
    expect(hasSeenRitual("letter-1")).toBe(false);
    expect(() => markRitualSeen("letter-1")).not.toThrow();
    expect(hasSeenRitual("letter-1")).toBe(true);
  });

  it("keeps working when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(hasSeenRitual("letter-1")).toBe(false);
    expect(() => markRitualSeen("letter-1")).not.toThrow();
  });
});

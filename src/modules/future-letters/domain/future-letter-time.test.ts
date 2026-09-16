import { describe, it, expect } from "vitest";
import { formatFutureLetterDateTime, toVietnamDateTimeParts, toVietnamScheduledInstant } from "./future-letter-time";

describe("future-letter-time", () => {
  describe("formatFutureLetterDateTime", () => {
    it("formats ISO string correctly into Vietnamese locale", () => {
      const isoString = "2026-09-14T09:00:00.000Z";
      const formatted = formatFutureLetterDateTime(isoString);
      expect(formatted).toMatch(/16:00 14 tháng 9, 2026|16:00, 14 tháng 9, 2026/i);
    });
  });

  describe("toVietnamDateTimeParts", () => {
    it("returns correct parts for a given ISO string", () => {
      const parts = toVietnamDateTimeParts("2026-09-14T09:00:00.000Z");
      expect(parts).toEqual({
        date: "2026-09-14",
        time: "16:00",
      });
    });
  });

  describe("toVietnamScheduledInstant", () => {
    it("combines date and time properly", () => {
      const instant = toVietnamScheduledInstant("2026-09-14", "16:00");
      expect(instant).toBe("2026-09-14T09:00:00.000Z");
    });
  });
});

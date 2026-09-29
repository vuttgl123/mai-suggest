import { describe, it, expect } from "vitest";
import {
  formatFutureLetterDateTime,
  formatFutureLetterOpening,
  formatTimeUntil,
  toVietnamDateTimeParts,
  toVietnamScheduledInstant,
} from "./future-letter-time";

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

  describe("formatFutureLetterOpening", () => {
    it("writes the opening moment as a full Vietnamese phrase in Vietnam time", () => {
      expect(formatFutureLetterOpening("2027-02-14T13:30:00.000Z")).toBe(
        "Mở lúc 20:30 ngày 14/02/2027",
      );
    });

    it("can name the time zone explicitly", () => {
      expect(
        formatFutureLetterOpening("2027-02-14T13:30:00.000Z", { withTimeZone: true }),
      ).toBe("Mở lúc 20:30 ngày 14/02/2027, giờ Việt Nam");
    });

    it("handles an invalid value without throwing", () => {
      expect(formatFutureLetterOpening("not-a-date")).toBe("Thời điểm mở không xác định");
    });
  });

  describe("formatTimeUntil", () => {
    const now = new Date("2026-09-29T03:00:00.000Z");

    it("counts whole days when more than a day remains", () => {
      expect(formatTimeUntil("2027-02-14T13:30:00.000Z", now)).toBe("còn 138 ngày");
    });

    it("counts hours and minutes on the last day", () => {
      expect(formatTimeUntil("2026-09-29T08:20:00.000Z", now)).toBe("còn 5 giờ 20 phút");
    });

    it("counts minutes in the last hour", () => {
      expect(formatTimeUntil("2026-09-29T03:12:30.000Z", now)).toBe("còn 12 phút");
    });

    it("says the letter is about to open in the final minute or after", () => {
      expect(formatTimeUntil("2026-09-29T03:00:40.000Z", now)).toBe("sắp mở");
      expect(formatTimeUntil("2026-09-29T02:00:00.000Z", now)).toBe("sắp mở");
    });
  });
});

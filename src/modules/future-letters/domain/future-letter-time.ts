export const FUTURE_LETTER_TIME_ZONE = "Asia/Ho_Chi_Minh";

export interface VietnamDateTimeParts {
  date: string;
  time: string;
}

export function toVietnamScheduledInstant(
  dateValue: string,
  timeValue: string,
): string | null {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(dateValue) ||
    !/^\d{2}:\d{2}$/.test(timeValue)
  ) {
    return null;
  }

  const instant = new Date(`${dateValue}T${timeValue}:00+07:00`);
  if (Number.isNaN(instant.getTime())) return null;

  const resolved = toVietnamDateTimeParts(instant.toISOString());
  return resolved?.date === dateValue && resolved.time === timeValue
    ? instant.toISOString()
    : null;
}

export function toVietnamDateTimeParts(
  value: string,
): VietnamDateTimeParts | null {
  const instant = new Date(value);
  if (Number.isNaN(instant.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUTURE_LETTER_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);

  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value;
  const year = part("year");
  const month = part("month");
  const day = part("day");
  const hour = part("hour");
  const minute = part("minute");

  if (!year || !month || !day || !hour || !minute) return null;

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
  };
}

export function formatFutureLetterDateTime(value: string): string {
  const instant = new Date(value);
  if (Number.isNaN(instant.getTime())) return "Thời điểm không xác định";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: FUTURE_LETTER_TIME_ZONE,
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(instant);
}

/** "Mở lúc 20:30 ngày 14/02/2027", always in Vietnam time. */
export function formatFutureLetterOpening(
  value: string,
  options: { withTimeZone?: boolean } = {},
): string {
  const parts = toVietnamDateTimeParts(value);
  if (!parts) return "Thời điểm mở không xác định";

  const [year, month, day] = parts.date.split("-");
  const phrase = `Mở lúc ${parts.time} ngày ${day}/${month}/${year}`;
  return options.withTimeZone ? `${phrase}, giờ Việt Nam` : phrase;
}

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Remaining time before a letter opens, for the author's own list only. */
export function formatTimeUntil(value: string, now: Date): string {
  const remaining = new Date(value).getTime() - now.getTime();
  if (Number.isNaN(remaining) || remaining < MINUTE_MS) return "sắp mở";

  if (remaining >= DAY_MS) return `còn ${Math.floor(remaining / DAY_MS)} ngày`;

  const hours = Math.floor(remaining / HOUR_MS);
  const minutes = Math.floor((remaining % HOUR_MS) / MINUTE_MS);
  return hours > 0 ? `còn ${hours} giờ ${minutes} phút` : `còn ${minutes} phút`;
}

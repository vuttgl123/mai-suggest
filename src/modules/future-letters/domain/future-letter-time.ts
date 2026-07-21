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

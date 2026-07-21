import { failure, success, type Result } from "@/core/application/result";
import type {
  CreateTimelineResponseInput,
  TimelineEntryInput,
  UpdateTimelineResponseInput,
} from "@/modules/timeline/domain/timeline-models";

export function normalizeTimelineEntryInput(
  input: TimelineEntryInput,
): Result<TimelineEntryInput> {
  const dateLabel = input.dateLabel.trim();
  const title = input.title.trim();
  const story = input.story.trim();
  const lesson = normalizeOptionalText(input.lesson);
  const imageUrl = normalizeOptionalText(input.imageUrl);
  const imageAltText = normalizeOptionalText(input.imageAltText);
  const occurredOn = normalizeOptionalText(input.occurredOn);

  if (
    !hasLength(dateLabel, 1, 80) ||
    !hasLength(title, 1, 160) ||
    !hasLength(story, 1, 8000) ||
    (lesson !== null && !hasLength(lesson, 1, 1000)) ||
    !isOptionalIsoDate(occurredOn) ||
    !isOptionalHttpUrl(imageUrl) ||
    (imageUrl !== null && !hasLength(imageAltText ?? "", 1, 280)) ||
    !Number.isInteger(input.sortOrder) ||
    input.sortOrder < 0 ||
    typeof input.isPublished !== "boolean"
  ) {
    return failure("VALIDATION_FAILED");
  }

  return success({
    dateLabel,
    occurredOn,
    title,
    story,
    lesson,
    imageUrl,
    imageAltText: imageUrl ? imageAltText : null,
    sortOrder: input.sortOrder,
    isPublished: input.isPublished,
  });
}

export function normalizeCreateTimelineResponseInput(
  input: CreateTimelineResponseInput,
): Result<CreateTimelineResponseInput> {
  const entryId = input.entryId.trim();
  const content = input.content.trim();

  if (!entryId || !hasLength(content, 1, 2000)) {
    return failure("VALIDATION_FAILED");
  }

  return success({ entryId, content });
}

export function normalizeUpdateTimelineResponseInput(
  input: UpdateTimelineResponseInput,
): Result<UpdateTimelineResponseInput> {
  const content = input.content.trim();
  return hasLength(content, 1, 2000)
    ? success({ content })
    : failure("VALIDATION_FAILED");
}

export function hasTimelineId(value: string): boolean {
  return value.trim().length > 0;
}

function normalizeOptionalText(value: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function hasLength(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}

function isOptionalIsoDate(value: string | null): boolean {
  if (value === null) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function isOptionalHttpUrl(value: string | null): boolean {
  if (value === null) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

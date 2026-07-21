import { failure, success, type Result } from "@/core/application/result";
import type { FutureLetterInput } from "@/modules/future-letters/domain/future-letter-models";

export function normalizeFutureLetterInput(
  input: FutureLetterInput,
): Result<FutureLetterInput> {
  const title = input.title.trim();
  const content = input.content.trim();
  const imageUrl = normalizeOptionalText(input.imageUrl);
  const imageAltText = normalizeOptionalText(input.imageAltText);
  const musicUrl = normalizeOptionalText(input.musicUrl);
  const opensAt = normalizeFutureIsoInstant(input.opensAt);

  if (
    !hasLength(title, 1, 160) ||
    !hasLength(content, 1, 8000) ||
    opensAt === null ||
    !isOptionalHttpUrl(imageUrl) ||
    !isOptionalHttpUrl(musicUrl) ||
    (imageUrl !== null && !hasLength(imageAltText ?? "", 1, 280))
  ) {
    return failure("VALIDATION_FAILED");
  }

  return success({
    title,
    content,
    opensAt,
    imageUrl,
    imageAltText: imageUrl ? imageAltText : null,
    musicUrl,
  });
}

export function hasFutureLetterId(value: string): boolean {
  return value.trim().length > 0;
}

function normalizeOptionalText(value: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeFutureIsoInstant(value: string): string | null {
  const instant = new Date(value);
  if (Number.isNaN(instant.getTime()) || instant.getTime() <= Date.now()) {
    return null;
  }

  return instant.toISOString();
}

function hasLength(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
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

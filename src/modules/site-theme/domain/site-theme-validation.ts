import { failure, success, type Result } from "@/core/application/result";
import {
  SITE_THEME_KEYS,
  type SiteThemeKey,
  type SiteThemeScheduleInput,
} from "@/modules/site-theme/domain/site-theme-models";

const MAX_THEME_PRIORITY = 1_000;

export function isSiteThemeKey(
  value: string | null | undefined,
): value is SiteThemeKey {
  return (
    typeof value === "string" &&
    (SITE_THEME_KEYS as readonly string[]).includes(value)
  );
}

export function isThemeSceneTransition(
  state: string | null | undefined,
  targetThemeKey: string | null | undefined,
  startedAt: string | null | undefined,
): targetThemeKey is SiteThemeKey {
  return (
    state === "transitioning" &&
    isSiteThemeKey(targetThemeKey) &&
    typeof startedAt === "string" &&
    !Number.isNaN(new Date(startedAt).getTime())
  );
}

export function normalizeSiteThemeScheduleInput(
  input: SiteThemeScheduleInput,
): Result<SiteThemeScheduleInput> {
  const startsAt = normalizeIsoInstant(input.startsAt);
  const endsAt = normalizeIsoInstant(input.endsAt);

  if (
    !isSiteThemeKey(input.themeKey) ||
    startsAt === null ||
    endsAt === null ||
    endsAt <= startsAt ||
    !Number.isInteger(input.priority) ||
    input.priority < 0 ||
    input.priority > MAX_THEME_PRIORITY ||
    typeof input.isEnabled !== "boolean"
  ) {
    return failure("VALIDATION_FAILED");
  }

  return success({
    themeKey: input.themeKey,
    startsAt,
    endsAt,
    priority: input.priority,
    isEnabled: input.isEnabled,
  });
}

export function hasSiteThemeScheduleId(value: string): boolean {
  return value.trim().length > 0;
}

function normalizeIsoInstant(value: string): string | null {
  const instant = new Date(value);
  return Number.isNaN(instant.getTime()) ? null : instant.toISOString();
}

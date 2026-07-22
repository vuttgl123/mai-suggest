import type { SiteThemeReader } from "@/modules/site-theme/application/site-theme-reader";
import {
  DEFAULT_SITE_THEME_KEY,
  THEME_SCENE_TRANSITION_DURATION_MS,
  type ResolvedSiteTheme,
  type SiteThemeSettings,
  type ThemeSceneTransition,
} from "@/modules/site-theme/domain/site-theme-models";
import { isSiteThemeKey } from "@/modules/site-theme/domain/site-theme-validation";

export class ResolveSiteTheme {
  constructor(private readonly reader: SiteThemeReader) {}

  async execute(now = new Date().toISOString()): Promise<ResolvedSiteTheme> {
    try {
      const [settingsResult, scheduleResult] = await Promise.all([
        this.reader.getSettings(),
        this.reader.findActiveSchedule(now),
      ]);

      if (
        settingsResult.ok &&
        settingsResult.value.manualThemeKey !== null &&
        isSiteThemeKey(settingsResult.value.manualThemeKey)
      ) {
        return {
          key: settingsResult.value.manualThemeKey,
          source: "manual",
          scheduleId: null,
          transition: resolveSceneTransition(settingsResult.value, now),
        };
      }

      if (scheduleResult.ok && scheduleResult.value !== null) {
        return {
          key: scheduleResult.value.themeKey,
          source: "schedule",
          scheduleId: scheduleResult.value.id,
          transition: settingsResult.ok
            ? resolveSceneTransition(settingsResult.value, now)
            : null,
        };
      }

      return {
        key: DEFAULT_SITE_THEME_KEY,
        source:
          settingsResult.ok && scheduleResult.ok ? "default" : "fallback",
        scheduleId: null,
        transition: settingsResult.ok
          ? resolveSceneTransition(settingsResult.value, now)
          : null,
      };
    } catch {
      return {
        key: DEFAULT_SITE_THEME_KEY,
        source: "fallback",
        scheduleId: null,
        transition: null,
      };
    }
  }
}

function resolveSceneTransition(
  settings: SiteThemeSettings,
  now: string,
): ThemeSceneTransition | null {
  if (
    settings.transitionState !== "transitioning" ||
    settings.transitionTargetThemeKey === null ||
    settings.transitionStartedAt === null
  ) {
    return null;
  }

  const startedAtMs = new Date(settings.transitionStartedAt).getTime();
  const nowMs = new Date(now).getTime();
  if (Number.isNaN(startedAtMs) || Number.isNaN(nowMs)) return null;

  const expiresAtMs = startedAtMs + THEME_SCENE_TRANSITION_DURATION_MS;
  if (expiresAtMs <= nowMs) return null;

  return {
    targetThemeKey: settings.transitionTargetThemeKey,
    startedAt: settings.transitionStartedAt,
    expiresAt: new Date(expiresAtMs).toISOString(),
  };
}

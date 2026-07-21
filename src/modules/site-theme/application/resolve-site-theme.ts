import type { SiteThemeReader } from "@/modules/site-theme/application/site-theme-reader";
import {
  DEFAULT_SITE_THEME_KEY,
  type ResolvedSiteTheme,
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
        };
      }

      if (scheduleResult.ok && scheduleResult.value !== null) {
        return {
          key: scheduleResult.value.themeKey,
          source: "schedule",
          scheduleId: scheduleResult.value.id,
        };
      }

      return {
        key: DEFAULT_SITE_THEME_KEY,
        source:
          settingsResult.ok && scheduleResult.ok ? "default" : "fallback",
        scheduleId: null,
      };
    } catch {
      return {
        key: DEFAULT_SITE_THEME_KEY,
        source: "fallback",
        scheduleId: null,
      };
    }
  }
}

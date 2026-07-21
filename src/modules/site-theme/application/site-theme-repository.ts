import type { Result } from "@/core/application/result";
import type {
  SiteThemeKey,
  SiteThemeSchedule,
  SiteThemeScheduleInput,
  SiteThemeSettings,
} from "@/modules/site-theme/domain/site-theme-models";

export interface SiteThemeRepository {
  setManualTheme(
    ownerId: string,
    themeKey: SiteThemeKey | null,
  ): Promise<Result<SiteThemeSettings>>;
  createSchedule(
    ownerId: string,
    input: SiteThemeScheduleInput,
  ): Promise<Result<SiteThemeSchedule>>;
  updateSchedule(
    scheduleId: string,
    input: SiteThemeScheduleInput,
  ): Promise<Result<SiteThemeSchedule>>;
  deleteSchedule(scheduleId: string): Promise<Result<void>>;
}

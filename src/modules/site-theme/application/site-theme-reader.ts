import type { Result } from "@/core/application/result";
import type {
  SiteThemeSchedule,
  SiteThemeSettings,
} from "@/modules/site-theme/domain/site-theme-models";

export interface SiteThemeReader {
  getSettings(): Promise<Result<SiteThemeSettings>>;
  findActiveSchedule(now: string): Promise<Result<SiteThemeSchedule | null>>;
  listSchedules(): Promise<Result<SiteThemeSchedule[]>>;
}

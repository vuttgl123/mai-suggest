import type { Database } from "@/lib/supabase/database.types";
import type {
  SiteThemeSchedule,
  SiteThemeSettings,
} from "@/modules/site-theme/domain/site-theme-models";
import { isSiteThemeKey } from "@/modules/site-theme/domain/site-theme-validation";

export type SiteThemeSettingsRow =
  Database["public"]["Tables"]["site_theme_settings"]["Row"];
export type SiteThemeScheduleRow =
  Database["public"]["Tables"]["site_theme_schedules"]["Row"];

type SiteThemeScheduleSource = Pick<
  SiteThemeScheduleRow,
  | "id"
  | "theme_key"
  | "starts_at"
  | "ends_at"
  | "priority"
  | "is_enabled"
  | "created_at"
  | "updated_at"
>;

export function toSiteThemeSettings(
  row: Pick<SiteThemeSettingsRow, "manual_theme_key" | "updated_at">,
): SiteThemeSettings {
  return {
    manualThemeKey: isSiteThemeKey(row.manual_theme_key)
      ? row.manual_theme_key
      : null,
    updatedAt: row.updated_at,
  };
}

export function toSiteThemeSchedule(
  row: SiteThemeScheduleSource,
): SiteThemeSchedule | null {
  if (!isSiteThemeKey(row.theme_key)) return null;

  return {
    id: row.id,
    themeKey: row.theme_key,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    priority: row.priority,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

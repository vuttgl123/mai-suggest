import type { SupabaseClient } from "@supabase/supabase-js";
import { failure, success, type Result } from "@/core/application/result";
import type { SiteThemeReader } from "@/modules/site-theme/application/site-theme-reader";
import type {
  SiteThemeSchedule,
  SiteThemeSettings,
} from "@/modules/site-theme/domain/site-theme-models";
import {
  toSiteThemeSchedule,
  toSiteThemeSettings,
} from "@/modules/site-theme/infrastructure/site-theme-mappers";
import type { Database } from "@/lib/supabase/database.types";

const SETTINGS_COLUMNS = "manual_theme_key,updated_at";
const SCHEDULE_COLUMNS =
  "id,theme_key,starts_at,ends_at,priority,is_enabled,created_at,updated_at";

const AUTOMATIC_SETTINGS: SiteThemeSettings = {
  manualThemeKey: null,
  updatedAt: "",
};

export class SupabaseSiteThemeReader implements SiteThemeReader {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async getSettings(): Promise<Result<SiteThemeSettings>> {
    const { data, error } = await this.client
      .from("site_theme_settings")
      .select(SETTINGS_COLUMNS)
      .eq("id", true)
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    return success(data ? toSiteThemeSettings(data) : AUTOMATIC_SETTINGS);
  }

  async findActiveSchedule(
    now: string,
  ): Promise<Result<SiteThemeSchedule | null>> {
    const { data, error } = await this.client
      .from("site_theme_schedules")
      .select(SCHEDULE_COLUMNS)
      .eq("is_enabled", true)
      .lte("starts_at", now)
      .gt("ends_at", now)
      .order("priority", { ascending: false })
      .order("starts_at", { ascending: false })
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    return success(data ? toSiteThemeSchedule(data) : null);
  }

  async listSchedules(): Promise<Result<SiteThemeSchedule[]>> {
    const { data, error } = await this.client
      .from("site_theme_schedules")
      .select(SCHEDULE_COLUMNS)
      .order("starts_at", { ascending: false })
      .order("id", { ascending: true });

    if (error) return failure("UNEXPECTED_FAILURE");

    return success(
      (data ?? [])
        .map(toSiteThemeSchedule)
        .filter((schedule): schedule is SiteThemeSchedule => schedule !== null),
    );
  }
}

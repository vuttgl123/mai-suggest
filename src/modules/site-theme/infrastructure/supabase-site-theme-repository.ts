import type { SupabaseClient } from "@supabase/supabase-js";
import { failure, success, type Result } from "@/core/application/result";
import type { SiteThemeRepository } from "@/modules/site-theme/application/site-theme-repository";
import type {
  SiteThemeKey,
  SiteThemeSchedule,
  SiteThemeScheduleInput,
  SiteThemeSettings,
} from "@/modules/site-theme/domain/site-theme-models";
import {
  toSiteThemeSchedule,
  toSiteThemeSettings,
} from "@/modules/site-theme/infrastructure/site-theme-mappers";
import { isThemeSceneTransition } from "@/modules/site-theme/domain/site-theme-validation";
import type { Database } from "@/lib/supabase/database.types";

const SETTINGS_COLUMNS =
  "manual_theme_key,transition_state,transition_target_theme_key,transition_started_at,updated_at";
const SCHEDULE_COLUMNS =
  "id,theme_key,starts_at,ends_at,priority,is_enabled,created_at,updated_at";

export class SupabaseSiteThemeRepository implements SiteThemeRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async setManualTheme(
    ownerId: string,
    themeKey: SiteThemeKey | null,
  ): Promise<Result<SiteThemeSettings>> {
    const { data, error } = await this.client
      .from("site_theme_settings")
      .update({
        manual_theme_key: themeKey,
        transition_state: "idle",
        transition_target_theme_key: null,
        transition_started_at: null,
        updated_by: ownerId,
      })
      .eq("id", true)
      .select(SETTINGS_COLUMNS)
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    return data ? success(toSiteThemeSettings(data)) : failure("NOT_FOUND");
  }

  async startSceneTransition(
    ownerId: string,
    targetThemeKey: SiteThemeKey,
    startedAt: string,
  ): Promise<Result<SiteThemeSettings>> {
    const { data, error } = await this.client
      .from("site_theme_settings")
      .update({
        transition_state: "transitioning",
        transition_target_theme_key: targetThemeKey,
        transition_started_at: startedAt,
        updated_by: ownerId,
      })
      .eq("id", true)
      .select(SETTINGS_COLUMNS)
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    return data ? success(toSiteThemeSettings(data)) : failure("NOT_FOUND");
  }

  async commitSceneTransition(
    ownerId: string,
  ): Promise<Result<SiteThemeSettings>> {
    const { data: current, error: currentError } = await this.client
      .from("site_theme_settings")
      .select(
        "transition_state,transition_target_theme_key,transition_started_at",
      )
      .eq("id", true)
      .maybeSingle();

    if (currentError) return failure("UNEXPECTED_FAILURE");
    if (!current) return failure("NOT_FOUND");

    const targetThemeKey = current.transition_target_theme_key;
    const startedAt = current.transition_started_at;
    if (
      !isThemeSceneTransition(
        current.transition_state,
        targetThemeKey,
        startedAt,
      )
    ) {
      return failure("NOT_FOUND");
    }

    const { data, error } = await this.client
      .from("site_theme_settings")
      .update({
        manual_theme_key: targetThemeKey,
        transition_state: "idle",
        transition_target_theme_key: null,
        transition_started_at: null,
        updated_by: ownerId,
      })
      .eq("id", true)
      .eq("transition_state", "transitioning")
      .eq("transition_target_theme_key", targetThemeKey)
      .select(SETTINGS_COLUMNS)
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    return data ? success(toSiteThemeSettings(data)) : failure("NOT_FOUND");
  }

  async cancelSceneTransition(
    ownerId: string,
  ): Promise<Result<SiteThemeSettings>> {
    const { data, error } = await this.client
      .from("site_theme_settings")
      .update({
        transition_state: "idle",
        transition_target_theme_key: null,
        transition_started_at: null,
        updated_by: ownerId,
      })
      .eq("id", true)
      .eq("transition_state", "transitioning")
      .select(SETTINGS_COLUMNS)
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    return data ? success(toSiteThemeSettings(data)) : failure("NOT_FOUND");
  }

  async createSchedule(
    ownerId: string,
    input: SiteThemeScheduleInput,
  ): Promise<Result<SiteThemeSchedule>> {
    const { data, error } = await this.client
      .from("site_theme_schedules")
      .insert({
        theme_key: input.themeKey,
        starts_at: input.startsAt,
        ends_at: input.endsAt,
        priority: input.priority,
        is_enabled: input.isEnabled,
        created_by: ownerId,
      })
      .select(SCHEDULE_COLUMNS)
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    const schedule = data ? toSiteThemeSchedule(data) : null;
    return schedule ? success(schedule) : failure("NOT_FOUND");
  }

  async updateSchedule(
    scheduleId: string,
    input: SiteThemeScheduleInput,
  ): Promise<Result<SiteThemeSchedule>> {
    const { data, error } = await this.client
      .from("site_theme_schedules")
      .update({
        theme_key: input.themeKey,
        starts_at: input.startsAt,
        ends_at: input.endsAt,
        priority: input.priority,
        is_enabled: input.isEnabled,
      })
      .eq("id", scheduleId)
      .select(SCHEDULE_COLUMNS)
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    const schedule = data ? toSiteThemeSchedule(data) : null;
    return schedule ? success(schedule) : failure("NOT_FOUND");
  }

  async deleteSchedule(scheduleId: string): Promise<Result<void>> {
    const { data, error } = await this.client
      .from("site_theme_schedules")
      .delete()
      .eq("id", scheduleId)
      .select("id")
      .maybeSingle();

    if (error) return failure("UNEXPECTED_FAILURE");
    return data ? success(undefined) : failure("NOT_FOUND");
  }
}

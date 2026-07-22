import { failure, type Result } from "@/core/application/result";
import type { SiteThemeRepository } from "@/modules/site-theme/application/site-theme-repository";
import type {
  SiteThemeKey,
  SiteThemeSchedule,
  SiteThemeScheduleInput,
  SiteThemeSettings,
} from "@/modules/site-theme/domain/site-theme-models";
import {
  hasSiteThemeScheduleId,
  isSiteThemeKey,
  normalizeSiteThemeScheduleInput,
} from "@/modules/site-theme/domain/site-theme-validation";
import {
  requireCatalogueOwner,
  type CurrentActor,
} from "@/modules/identity/domain/current-actor";

export class ManageSiteTheme {
  constructor(private readonly repository: SiteThemeRepository) {}

  async setManualTheme(
    actor: CurrentActor,
    themeKey: SiteThemeKey | null,
  ): Promise<Result<SiteThemeSettings>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (themeKey !== null && !isSiteThemeKey(themeKey)) {
      return failure("VALIDATION_FAILED");
    }

    return this.repository.setManualTheme(owner.value.userId, themeKey);
  }

  async startSceneTransition(
    actor: CurrentActor,
    themeKey: SiteThemeKey,
  ): Promise<Result<SiteThemeSettings>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (!isSiteThemeKey(themeKey)) return failure("VALIDATION_FAILED");

    return this.repository.startSceneTransition(
      owner.value.userId,
      themeKey,
      new Date().toISOString(),
    );
  }

  async commitSceneTransition(
    actor: CurrentActor,
  ): Promise<Result<SiteThemeSettings>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;

    return this.repository.commitSceneTransition(owner.value.userId);
  }

  async cancelSceneTransition(
    actor: CurrentActor,
  ): Promise<Result<SiteThemeSettings>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;

    return this.repository.cancelSceneTransition(owner.value.userId);
  }

  async createSchedule(
    actor: CurrentActor,
    input: SiteThemeScheduleInput,
  ): Promise<Result<SiteThemeSchedule>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;

    const normalized = normalizeSiteThemeScheduleInput(input);
    if (!normalized.ok) return normalized;

    return this.repository.createSchedule(owner.value.userId, normalized.value);
  }

  async updateSchedule(
    actor: CurrentActor,
    scheduleId: string,
    input: SiteThemeScheduleInput,
  ): Promise<Result<SiteThemeSchedule>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (!hasSiteThemeScheduleId(scheduleId)) return failure("VALIDATION_FAILED");

    const normalized = normalizeSiteThemeScheduleInput(input);
    if (!normalized.ok) return normalized;

    return this.repository.updateSchedule(scheduleId.trim(), normalized.value);
  }

  async deleteSchedule(
    actor: CurrentActor,
    scheduleId: string,
  ): Promise<Result<void>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (!hasSiteThemeScheduleId(scheduleId)) return failure("VALIDATION_FAILED");

    return this.repository.deleteSchedule(scheduleId.trim());
  }
}

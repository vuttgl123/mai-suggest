import { failure, success, type Result } from "@/core/application/result";
import { ResolveSiteTheme } from "@/modules/site-theme/application/resolve-site-theme";
import type { SiteThemeReader } from "@/modules/site-theme/application/site-theme-reader";
import type { SiteThemeManagement } from "@/modules/site-theme/domain/site-theme-models";
import {
  requireCatalogueOwner,
  type CurrentActor,
} from "@/modules/identity/domain/current-actor";

export class GetManagedSiteTheme {
  private readonly resolver: ResolveSiteTheme;

  constructor(private readonly reader: SiteThemeReader) {
    this.resolver = new ResolveSiteTheme(reader);
  }

  async execute(actor: CurrentActor): Promise<Result<SiteThemeManagement>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;

    const [settingsResult, schedulesResult, resolved] = await Promise.all([
      this.reader.getSettings(),
      this.reader.listSchedules(),
      this.resolver.execute(),
    ]);

    if (!settingsResult.ok || !schedulesResult.ok) {
      return failure("UNEXPECTED_FAILURE");
    }

    return success({
      settings: settingsResult.value,
      schedules: schedulesResult.value,
      resolved,
    });
  }
}

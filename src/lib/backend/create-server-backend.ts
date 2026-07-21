import type { SupabaseClient } from "@supabase/supabase-js";
import { GetCurrentActor } from "@/modules/identity/application/get-current-actor";
import { SupabaseActorReader } from "@/modules/identity/infrastructure/supabase-actor-reader";
import { ManageAllowedUsers } from "@/modules/identity/application/manage-allowed-users";
import { SupabaseAllowedUserRepository } from "@/modules/identity/infrastructure/supabase-allowed-user-repository";
import { GetVisibleItemDetail } from "@/modules/catalogue/application/get-visible-item-detail";
import { ListVisibleCategories } from "@/modules/catalogue/application/list-visible-categories";
import { ListVisibleItems } from "@/modules/catalogue/application/list-visible-items";
import { ListVisibleItemPage } from "@/modules/catalogue/application/list-visible-item-page";
import { SupabaseCatalogueReader } from "@/modules/catalogue/infrastructure/supabase-catalogue-reader";
import { ManageCatalogue } from "@/modules/catalogue/application/manage-catalogue";
import { SupabaseCatalogueAdminRepository } from "@/modules/catalogue/infrastructure/supabase-catalogue-admin-repository";
import { SupabaseCatalogueAdminReader } from "@/modules/catalogue/infrastructure/supabase-catalogue-admin-reader";
import { ListManagedCategories } from "@/modules/catalogue/application/list-managed-categories";
import { ListManagedItems } from "@/modules/catalogue/application/list-managed-items";
import { ListManagedItemPage } from "@/modules/catalogue/application/list-managed-item-page";
import { GetManagedItemDetail } from "@/modules/catalogue/application/get-managed-item-detail";
import { ManageItemEngagement } from "@/modules/engagement/application/manage-item-engagement";
import { GetItemEngagementView } from "@/modules/engagement/application/get-item-engagement-view";
import { SupabaseEngagementRepository } from "@/modules/engagement/infrastructure/supabase-engagement-repository";
import { SupabaseItemEngagementReader } from "@/modules/engagement/infrastructure/supabase-item-engagement-reader";
import { ListVisibleTimeline } from "@/modules/timeline/application/list-visible-timeline";
import { ListManagedTimeline } from "@/modules/timeline/application/list-managed-timeline";
import { GetManagedTimelineEntry } from "@/modules/timeline/application/get-managed-timeline-entry";
import { ManageTimeline } from "@/modules/timeline/application/manage-timeline";
import { SupabaseTimelineReader } from "@/modules/timeline/infrastructure/supabase-timeline-reader";
import { SupabaseTimelineAdminReader } from "@/modules/timeline/infrastructure/supabase-timeline-admin-reader";
import { SupabaseTimelineRepository } from "@/modules/timeline/infrastructure/supabase-timeline-repository";
import { ListOpenedFutureLetters } from "@/modules/future-letters/application/list-opened-future-letters";
import { ListOwnScheduledFutureLetters } from "@/modules/future-letters/application/list-own-scheduled-future-letters";
import { ManageFutureLetters } from "@/modules/future-letters/application/manage-future-letters";
import { SupabaseFutureLetterReader } from "@/modules/future-letters/infrastructure/supabase-future-letter-reader";
import { SupabaseFutureLetterRepository } from "@/modules/future-letters/infrastructure/supabase-future-letter-repository";
import { ResolveSiteTheme } from "@/modules/site-theme/application/resolve-site-theme";
import { GetManagedSiteTheme } from "@/modules/site-theme/application/get-managed-site-theme";
import { ManageSiteTheme } from "@/modules/site-theme/application/manage-site-theme";
import { SupabaseSiteThemeReader } from "@/modules/site-theme/infrastructure/supabase-site-theme-reader";
import { SupabaseSiteThemeRepository } from "@/modules/site-theme/infrastructure/supabase-site-theme-repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export function createBackendForClient(client: SupabaseClient<Database>) {
  const actorReader = new SupabaseActorReader(client);
  const allowedUserRepository = new SupabaseAllowedUserRepository(client);
  const catalogueReader = new SupabaseCatalogueReader(client);
  const catalogueAdminRepository = new SupabaseCatalogueAdminRepository(client);
  const catalogueAdminReader = new SupabaseCatalogueAdminReader(client);
  const engagementRepository = new SupabaseEngagementRepository(client);
  const itemEngagementReader = new SupabaseItemEngagementReader(client);
  const timelineReader = new SupabaseTimelineReader(client);
  const timelineAdminReader = new SupabaseTimelineAdminReader(client);
  const timelineRepository = new SupabaseTimelineRepository(client);
  const futureLetterReader = new SupabaseFutureLetterReader(client);
  const futureLetterRepository = new SupabaseFutureLetterRepository(client);
  const siteThemeReader = new SupabaseSiteThemeReader(client);
  const siteThemeRepository = new SupabaseSiteThemeRepository(client);

  return {
    getCurrentActor: new GetCurrentActor(actorReader),
    manageAllowedUsers: new ManageAllowedUsers(allowedUserRepository),
    listVisibleCategories: new ListVisibleCategories(catalogueReader),
    listVisibleItems: new ListVisibleItems(catalogueReader),
    listVisibleItemPage: new ListVisibleItemPage(catalogueReader),
    getVisibleItemDetail: new GetVisibleItemDetail(catalogueReader),
    manageCatalogue: new ManageCatalogue(catalogueAdminRepository),
    listManagedCategories: new ListManagedCategories(catalogueAdminReader),
    listManagedItems: new ListManagedItems(catalogueAdminReader),
    listManagedItemPage: new ListManagedItemPage(catalogueAdminReader),
    getManagedItemDetail: new GetManagedItemDetail(catalogueAdminReader),
    manageItemEngagement: new ManageItemEngagement(engagementRepository),
    getItemEngagementView: new GetItemEngagementView(itemEngagementReader),
    listVisibleTimeline: new ListVisibleTimeline(timelineReader),
    listManagedTimeline: new ListManagedTimeline(timelineAdminReader),
    getManagedTimelineEntry: new GetManagedTimelineEntry(timelineAdminReader),
    manageTimeline: new ManageTimeline(timelineRepository),
    listOpenedFutureLetters: new ListOpenedFutureLetters(futureLetterReader),
    listOwnScheduledFutureLetters: new ListOwnScheduledFutureLetters(
      futureLetterReader,
    ),
    manageFutureLetters: new ManageFutureLetters(futureLetterRepository),
    resolveSiteTheme: new ResolveSiteTheme(siteThemeReader),
    getManagedSiteTheme: new GetManagedSiteTheme(siteThemeReader),
    manageSiteTheme: new ManageSiteTheme(siteThemeRepository),
  };
}

export async function createServerBackend() {
  return createBackendForClient(await createServerSupabaseClient());
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { GetCurrentActor } from "@/modules/identity/application/get-current-actor";
import { SupabaseActorReader } from "@/modules/identity/infrastructure/supabase-actor-reader";
import { ManageAllowedUsers } from "@/modules/identity/application/manage-allowed-users";
import { SupabaseAllowedUserRepository } from "@/modules/identity/infrastructure/supabase-allowed-user-repository";
import { GetVisibleItemDetail } from "@/modules/catalogue/application/get-visible-item-detail";
import { ListVisibleCategories } from "@/modules/catalogue/application/list-visible-categories";
import { ListVisibleItems } from "@/modules/catalogue/application/list-visible-items";
import { SupabaseCatalogueReader } from "@/modules/catalogue/infrastructure/supabase-catalogue-reader";
import { ManageCatalogue } from "@/modules/catalogue/application/manage-catalogue";
import { SupabaseCatalogueAdminRepository } from "@/modules/catalogue/infrastructure/supabase-catalogue-admin-repository";
import { SupabaseCatalogueAdminReader } from "@/modules/catalogue/infrastructure/supabase-catalogue-admin-reader";
import { ListManagedCategories } from "@/modules/catalogue/application/list-managed-categories";
import { ListManagedItems } from "@/modules/catalogue/application/list-managed-items";
import { GetManagedItemDetail } from "@/modules/catalogue/application/get-managed-item-detail";
import { ManageItemEngagement } from "@/modules/engagement/application/manage-item-engagement";
import { SupabaseEngagementRepository } from "@/modules/engagement/infrastructure/supabase-engagement-repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export function createBackendForClient(client: SupabaseClient<Database>) {
  const actorReader = new SupabaseActorReader(client);
  const allowedUserRepository = new SupabaseAllowedUserRepository(client);
  const catalogueReader = new SupabaseCatalogueReader(client);
  const catalogueAdminRepository = new SupabaseCatalogueAdminRepository(client);
  const catalogueAdminReader = new SupabaseCatalogueAdminReader(client);
  const engagementRepository = new SupabaseEngagementRepository(client);

  return {
    getCurrentActor: new GetCurrentActor(actorReader),
    manageAllowedUsers: new ManageAllowedUsers(allowedUserRepository),
    listVisibleCategories: new ListVisibleCategories(catalogueReader),
    listVisibleItems: new ListVisibleItems(catalogueReader),
    getVisibleItemDetail: new GetVisibleItemDetail(catalogueReader),
    manageCatalogue: new ManageCatalogue(catalogueAdminRepository),
    listManagedCategories: new ListManagedCategories(catalogueAdminReader),
    listManagedItems: new ListManagedItems(catalogueAdminReader),
    getManagedItemDetail: new GetManagedItemDetail(catalogueAdminReader),
    manageItemEngagement: new ManageItemEngagement(engagementRepository),
  };
}

export async function createServerBackend() {
  return createBackendForClient(await createServerSupabaseClient());
}

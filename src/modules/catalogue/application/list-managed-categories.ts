import type { Result } from "@/core/application/result";
import type { CatalogueAdminReader } from "@/modules/catalogue/application/catalogue-admin-reader";
import type { ManagedCatalogueCategory } from "@/modules/catalogue/domain/catalogue-admin-models";
import {
  requireCatalogueOwner,
  type CurrentActor,
} from "@/modules/identity/domain/current-actor";

export class ListManagedCategories {
  constructor(private readonly reader: CatalogueAdminReader) {}

  async execute(
    actor: CurrentActor,
  ): Promise<Result<ManagedCatalogueCategory[]>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;

    return this.reader.listManagedCategories();
  }
}

import { failure, type Result } from "@/core/application/result";
import type {
  CatalogueAdminReader,
  ManagedCatalogueItemCriteria,
} from "@/modules/catalogue/application/catalogue-admin-reader";
import type { ManagedCatalogueItem } from "@/modules/catalogue/domain/catalogue-admin-models";
import {
  requireCatalogueOwner,
  type CurrentActor,
} from "@/modules/identity/domain/current-actor";

export class ListManagedItems {
  constructor(private readonly reader: CatalogueAdminReader) {}

  async execute(
    actor: CurrentActor,
    criteria: ManagedCatalogueItemCriteria = {},
  ): Promise<Result<ManagedCatalogueItem[]>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;

    if (criteria.categoryId !== undefined && criteria.categoryId.trim().length === 0) {
      return failure("VALIDATION_FAILED");
    }

    return this.reader.listManagedItems({
      categoryId: criteria.categoryId?.trim(),
    });
  }
}

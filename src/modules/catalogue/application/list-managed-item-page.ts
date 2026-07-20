import { failure, type Result } from "@/core/application/result";
import type {
  ManagedCatalogueItemPage,
} from "@/modules/catalogue/domain/catalogue-admin-models";
import type {
  CatalogueAdminReader,
  ManagedCatalogueItemPageCriteria,
} from "@/modules/catalogue/application/catalogue-admin-reader";
import {
  requireCatalogueOwner,
  type CurrentActor,
} from "@/modules/identity/domain/current-actor";

export class ListManagedItemPage {
  constructor(private readonly catalogueAdminReader: CatalogueAdminReader) {}

  async execute(
    actor: CurrentActor,
    criteria: ManagedCatalogueItemPageCriteria,
  ): Promise<Result<ManagedCatalogueItemPage>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (!isPositiveInteger(criteria.page) || !isPositiveInteger(criteria.pageSize)) {
      return failure("VALIDATION_FAILED");
    }

    return this.catalogueAdminReader.listManagedItemPage(criteria);
  }
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

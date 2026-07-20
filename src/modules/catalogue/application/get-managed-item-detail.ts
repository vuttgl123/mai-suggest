import { failure, success, type Result } from "@/core/application/result";
import type { CatalogueAdminReader } from "@/modules/catalogue/application/catalogue-admin-reader";
import type { ManagedCatalogueItemDetail } from "@/modules/catalogue/domain/catalogue-admin-models";
import {
  requireCatalogueOwner,
  type CurrentActor,
} from "@/modules/identity/domain/current-actor";

export class GetManagedItemDetail {
  constructor(private readonly reader: CatalogueAdminReader) {}

  async execute(
    actor: CurrentActor,
    itemId: string,
  ): Promise<Result<ManagedCatalogueItemDetail>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (itemId.trim().length === 0) return failure("VALIDATION_FAILED");

    const result = await this.reader.findManagedItemDetailById(itemId.trim());
    if (!result.ok) return result;

    return result.value ? success(result.value) : failure("NOT_FOUND");
  }
}

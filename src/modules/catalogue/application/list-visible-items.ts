import type { Result } from "@/core/application/result";
import type { CurrentActor } from "@/modules/identity/domain/current-actor";
import { requireActiveActor } from "@/modules/identity/domain/current-actor";
import type { CatalogueItemSummary } from "@/modules/catalogue/domain/catalogue-read-models";
import type {
  CatalogueItemCriteria,
  CatalogueReader,
} from "@/modules/catalogue/application/catalogue-reader";

export class ListVisibleItems {
  constructor(private readonly catalogueReader: CatalogueReader) {}

  async execute(
    actor: CurrentActor,
    criteria: CatalogueItemCriteria,
  ): Promise<Result<CatalogueItemSummary[]>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) {
      return activeActor;
    }

    return this.catalogueReader.listItems(criteria);
  }
}

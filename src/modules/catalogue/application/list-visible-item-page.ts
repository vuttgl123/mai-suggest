import { failure, type Result } from "@/core/application/result";
import type {
  CatalogueItemPage,
} from "@/modules/catalogue/domain/catalogue-read-models";
import type {
  CatalogueItemPageCriteria,
  CatalogueReader,
} from "@/modules/catalogue/application/catalogue-reader";
import type { CurrentActor } from "@/modules/identity/domain/current-actor";
import { requireActiveActor } from "@/modules/identity/domain/current-actor";

export class ListVisibleItemPage {
  constructor(private readonly catalogueReader: CatalogueReader) {}

  async execute(
    actor: CurrentActor,
    criteria: CatalogueItemPageCriteria,
  ): Promise<Result<CatalogueItemPage>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;
    if (!isPositiveInteger(criteria.page) || !isPositiveInteger(criteria.pageSize)) {
      return failure("VALIDATION_FAILED");
    }

    return this.catalogueReader.listItemPage(criteria);
  }
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

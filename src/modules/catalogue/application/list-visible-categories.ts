import type { Result } from "@/core/application/result";
import type { CurrentActor } from "@/modules/identity/domain/current-actor";
import { requireActiveActor } from "@/modules/identity/domain/current-actor";
import type { CatalogueCategory } from "@/modules/catalogue/domain/catalogue-read-models";
import type { CatalogueReader } from "@/modules/catalogue/application/catalogue-reader";

export class ListVisibleCategories {
  constructor(private readonly catalogueReader: CatalogueReader) {}

  async execute(actor: CurrentActor): Promise<Result<CatalogueCategory[]>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) {
      return activeActor;
    }

    return this.catalogueReader.listCategories();
  }
}

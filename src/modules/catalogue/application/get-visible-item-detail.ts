import { failure, type Result } from "@/core/application/result";
import type { CurrentActor } from "@/modules/identity/domain/current-actor";
import { requireActiveActor } from "@/modules/identity/domain/current-actor";
import type { CatalogueItemDetail } from "@/modules/catalogue/domain/catalogue-read-models";
import type { CatalogueReader } from "@/modules/catalogue/application/catalogue-reader";

export class GetVisibleItemDetail {
  constructor(private readonly catalogueReader: CatalogueReader) {}

  async execute(
    actor: CurrentActor,
    slug: string,
  ): Promise<Result<CatalogueItemDetail>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) {
      return activeActor;
    }

    const result = await this.catalogueReader.findItemDetailBySlug(slug);
    if (!result.ok) {
      return result;
    }

    if (!result.value) {
      return failure("NOT_FOUND");
    }

    return { ok: true, value: result.value };
  }
}

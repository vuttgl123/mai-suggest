import { failure, type Result } from "@/core/application/result";
import type { CatalogueReader } from "@/modules/catalogue/application/catalogue-reader";
import type { CatalogueChapterPreview } from "@/modules/catalogue/domain/catalogue-read-models";
import type { CurrentActor } from "@/modules/identity/domain/current-actor";

export class ListVisibleChapterPreviews {
  constructor(private readonly reader: CatalogueReader) {}

  async execute(
    actor: CurrentActor,
    criteria: { itemsPerChapter: number },
  ): Promise<Result<CatalogueChapterPreview[]>> {
    if (actor.status === "anonymous") {
      return failure("UNAUTHENTICATED");
    }

    if (actor.status === "inactive") {
      return failure("ACCESS_DENIED");
    }

    if (criteria.itemsPerChapter <= 0) {
      return failure("VALIDATION_FAILED");
    }

    return this.reader.listChapterPreviews(criteria);
  }
}

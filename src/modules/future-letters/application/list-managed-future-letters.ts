import type { Result } from "@/core/application/result";
import type { FutureLetterReader } from "@/modules/future-letters/application/future-letter-reader";
import type { FutureLetter } from "@/modules/future-letters/domain/future-letter-models";
import {
  requireCatalogueOwner,
  type CurrentActor,
} from "@/modules/identity/domain/current-actor";

export class ListManagedFutureLetters {
  constructor(private readonly reader: FutureLetterReader) {}

  async execute(actor: CurrentActor): Promise<Result<FutureLetter[]>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;

    return this.reader.listManaged();
  }
}

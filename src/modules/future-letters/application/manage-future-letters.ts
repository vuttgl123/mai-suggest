import { failure, type Result } from "@/core/application/result";
import type { FutureLetterRepository } from "@/modules/future-letters/application/future-letter-repository";
import type {
  FutureLetterInput,
  FutureLetterRecord,
} from "@/modules/future-letters/domain/future-letter-models";
import {
  hasFutureLetterId,
  normalizeFutureLetterInput,
} from "@/modules/future-letters/domain/future-letter-validation";
import {
  requireActiveActor,
  requireCatalogueOwner,
  type CurrentActor,
} from "@/modules/identity/domain/current-actor";

export class ManageFutureLetters {
  constructor(private readonly repository: FutureLetterRepository) {}

  async create(
    actor: CurrentActor,
    input: FutureLetterInput,
  ): Promise<Result<FutureLetterRecord>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;

    const normalized = normalizeFutureLetterInput(input);
    if (!normalized.ok) return normalized;

    return this.repository.create(activeActor.value.userId, normalized.value);
  }

  async update(
    actor: CurrentActor,
    letterId: string,
    input: FutureLetterInput,
  ): Promise<Result<FutureLetterRecord>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;
    if (!hasFutureLetterId(letterId)) return failure("VALIDATION_FAILED");

    const normalized = normalizeFutureLetterInput(input);
    if (!normalized.ok) return normalized;

    return this.repository.update(
      letterId.trim(),
      activeActor.value.userId,
      normalized.value,
    );
  }

  async deleteOwnScheduled(
    actor: CurrentActor,
    letterId: string,
  ): Promise<Result<void>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;
    if (!hasFutureLetterId(letterId)) return failure("VALIDATION_FAILED");

    return this.repository.deleteOwnScheduled(
      letterId.trim(),
      activeActor.value.userId,
    );
  }

  async deleteManaged(
    actor: CurrentActor,
    letterId: string,
  ): Promise<Result<void>> {
    const owner = requireCatalogueOwner(actor);
    if (!owner.ok) return owner;
    if (!hasFutureLetterId(letterId)) return failure("VALIDATION_FAILED");

    return this.repository.deleteManaged(letterId.trim());
  }
}

import { failure, type Result } from "@/core/application/result";
import type { FutureLetterReader } from "@/modules/future-letters/application/future-letter-reader";
import type { FutureLetter } from "@/modules/future-letters/domain/future-letter-models";
import { type CurrentActor, requireActiveActor } from "@/modules/identity/domain/current-actor";
import { hasFutureLetterId } from "@/modules/future-letters/domain/future-letter-validation";

export class GetOwnScheduledFutureLetter {
  constructor(private readonly reader: FutureLetterReader) {}

  async execute(
    actor: CurrentActor,
    letterId: string,
  ): Promise<Result<FutureLetter>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;
    if (!hasFutureLetterId(letterId)) return failure("VALIDATION_FAILED");

    const serverNow = new Date().toISOString();
    return this.reader.getOwnScheduled(letterId, activeActor.value.userId, serverNow);
  }
}

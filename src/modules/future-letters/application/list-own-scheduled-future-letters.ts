import type { Result } from "@/core/application/result";
import type { FutureLetterReader } from "@/modules/future-letters/application/future-letter-reader";
import type { FutureLetterRecord } from "@/modules/future-letters/domain/future-letter-models";
import {
  requireActiveActor,
  type CurrentActor,
} from "@/modules/identity/domain/current-actor";

export class ListOwnScheduledFutureLetters {
  constructor(private readonly reader: FutureLetterReader) {}

  async execute(actor: CurrentActor): Promise<Result<FutureLetterRecord[]>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;

    return this.reader.listOwnScheduled(
      activeActor.value.userId,
      new Date().toISOString(),
    );
  }
}

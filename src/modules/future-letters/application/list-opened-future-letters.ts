import type { Result } from "@/core/application/result";
import type { FutureLetterReader } from "@/modules/future-letters/application/future-letter-reader";
import type { FutureLetter } from "@/modules/future-letters/domain/future-letter-models";
import {
  requireActiveActor,
  type CurrentActor,
} from "@/modules/identity/domain/current-actor";

export class ListOpenedFutureLetters {
  constructor(private readonly reader: FutureLetterReader) {}

  async execute(actor: CurrentActor): Promise<Result<FutureLetter[]>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;

    return this.reader.listOpened(new Date().toISOString());
  }
}

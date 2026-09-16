import { failure, type Result } from "@/core/application/result";
import type { FutureLetterReader, ListMailboxQuery } from "@/modules/future-letters/application/future-letter-reader";
import type { FutureMailboxPage } from "@/modules/future-letters/domain/future-letter-models";
import { type CurrentActor, requireActiveActor } from "@/modules/identity/domain/current-actor";

export class ListFutureMailbox {
  constructor(private readonly reader: FutureLetterReader) {}

  async execute(
    actor: CurrentActor,
    query: ListMailboxQuery,
  ): Promise<Result<FutureMailboxPage>> {
    const activeActor = requireActiveActor(actor);
    if (!activeActor.ok) return activeActor;

    if (query.page < 1) {
      return failure("VALIDATION_FAILED");
    }

    const serverNow = new Date().toISOString();
    return this.reader.listMailbox(query, serverNow);
  }
}

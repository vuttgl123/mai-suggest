import type { Result } from "@/core/application/result";
import type {
  FutureLetterInput,
  FutureLetterRecord,
} from "@/modules/future-letters/domain/future-letter-models";

export interface FutureLetterRepository {
  create(
    authorId: string,
    input: FutureLetterInput,
  ): Promise<Result<FutureLetterRecord>>;
  update(
    letterId: string,
    authorId: string,
    input: FutureLetterInput,
  ): Promise<Result<FutureLetterRecord>>;
  deleteOwnScheduled(letterId: string, authorId: string): Promise<Result<void>>;
  /** Owner moderation: removes an opened letter only. */
  deleteManaged(letterId: string, serverNow: string): Promise<Result<void>>;
}

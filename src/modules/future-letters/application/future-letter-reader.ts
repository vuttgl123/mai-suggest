import type { Result } from "@/core/application/result";
import type {
  FutureLetter,
  FutureLetterRecord,
} from "@/modules/future-letters/domain/future-letter-models";

export interface FutureLetterReader {
  listOpened(serverNow: string): Promise<Result<FutureLetter[]>>;
  listOwnScheduled(
    authorId: string,
    serverNow: string,
  ): Promise<Result<FutureLetterRecord[]>>;
}

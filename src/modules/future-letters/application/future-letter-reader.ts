import type { Result } from "@/core/application/result";
import type {
  FutureLetter,
  FutureLetterRecord,
  FutureMailboxPage,
} from "@/modules/future-letters/domain/future-letter-models";

export interface ListMailboxQuery {
  page: number;
  query?: string;
}

export interface FutureLetterReader {
  listOpened(serverNow: string): Promise<Result<FutureLetter[]>>;
  listManaged(): Promise<Result<FutureLetter[]>>;
  listOwnScheduled(
    authorId: string,
    serverNow: string,
  ): Promise<Result<FutureLetterRecord[]>>;

  listMailbox(
    query: ListMailboxQuery,
    serverNow: string,
  ): Promise<Result<FutureMailboxPage>>;

  getOpened(
    id: string,
    serverNow: string,
  ): Promise<Result<FutureLetter>>;

  getOwnScheduled(
    id: string,
    authorId: string,
    serverNow: string,
  ): Promise<Result<FutureLetter>>;
}

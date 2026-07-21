"use server";

import {
  revalidateAfterMutation,
  runServerAction,
} from "@/lib/backend/run-server-action";
import type { FutureLetterInput } from "@/modules/future-letters/domain/future-letter-models";

export async function createFutureLetterAction(input: FutureLetterInput) {
  const result = await runServerAction((backend, actor) =>
    backend.manageFutureLetters.create(actor, input),
  );

  return revalidateAfterMutation(result);
}

export async function updateFutureLetterAction(
  letterId: string,
  input: FutureLetterInput,
) {
  const result = await runServerAction((backend, actor) =>
    backend.manageFutureLetters.update(actor, letterId, input),
  );

  return revalidateAfterMutation(result);
}

export async function deleteFutureLetterAction(letterId: string) {
  const result = await runServerAction((backend, actor) =>
    backend.manageFutureLetters.delete(actor, letterId),
  );

  return revalidateAfterMutation(result);
}

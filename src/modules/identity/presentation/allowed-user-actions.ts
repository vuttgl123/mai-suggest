"use server";

import {
  revalidateAfterMutation,
  runServerAction,
} from "@/lib/backend/run-server-action";
import type {
  AllowedUserInput,
  AllowedUserUpdateInput,
} from "@/modules/identity/domain/allowed-user";

export async function createAllowedUserAction(input: AllowedUserInput) {
  const result = await runServerAction((backend, actor) =>
    backend.manageAllowedUsers.create(actor, input),
  );

  return revalidateAfterMutation(result);
}

export async function updateAllowedUserAction(
  email: string,
  input: AllowedUserUpdateInput,
) {
  const result = await runServerAction((backend, actor) =>
    backend.manageAllowedUsers.update(actor, email, input),
  );

  return revalidateAfterMutation(result);
}

export async function deleteAllowedUserAction(email: string) {
  const result = await runServerAction((backend, actor) =>
    backend.manageAllowedUsers.delete(actor, email),
  );

  return revalidateAfterMutation(result);
}

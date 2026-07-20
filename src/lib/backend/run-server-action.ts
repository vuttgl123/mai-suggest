import { revalidatePath } from "next/cache";
import { failure, type Result } from "@/core/application/result";
import { createServerBackend } from "@/lib/backend/create-server-backend";
import type { CurrentActor } from "@/modules/identity/domain/current-actor";

type ServerBackend = Awaited<ReturnType<typeof createServerBackend>>;

type ServerActionOperation<T> = (
  backend: ServerBackend,
  actor: CurrentActor,
) => Promise<Result<T>>;

export async function runServerAction<T>(
  operation: ServerActionOperation<T>,
): Promise<Result<T>> {
  try {
    const backend = await createServerBackend();
    const actorResult = await backend.getCurrentActor.execute();

    if (!actorResult.ok) return actorResult;

    return operation(backend, actorResult.value);
  } catch {
    return failure("UNEXPECTED_FAILURE");
  }
}

export function revalidateAfterMutation<T>(result: Result<T>): Result<T> {
  if (result.ok) {
    revalidatePath("/", "layout");
  }

  return result;
}

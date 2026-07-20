import { redirect } from "next/navigation";
import { createServerBackend } from "@/lib/backend/create-server-backend";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";
import { resolveActivePageAccess } from "@/modules/identity/presentation/active-page-access";

export async function requireActivePageActor(): Promise<ActiveActor> {
  const backend = await createServerBackend();
  const access = resolveActivePageAccess(
    await backend.getCurrentActor.execute(),
  );

  if (access.kind === "redirect") {
    redirect(access.to);
  }

  return access.actor;
}

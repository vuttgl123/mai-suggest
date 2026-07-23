import "server-only";

import { redirect } from "next/navigation";
import { createServerBackend } from "@/lib/backend/create-server-backend";
import { resolveActivePageAccess } from "@/modules/identity/presentation/active-page-access";

export async function requireActivePageAccess() {
  const backend = await createServerBackend();
  const access = resolveActivePageAccess(
    await backend.getCurrentActor.execute(),
  );

  if (access.kind === "redirect") {
    redirect(access.to);
  }

  return { actor: access.actor, backend };
}

export async function requireCatalogueOwnerPageAccess() {
  const pageAccess = await requireActivePageAccess();

  if (!pageAccess.actor.canManageCatalogue) {
    redirect("/access-denied");
  }

  return pageAccess;
}

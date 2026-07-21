import { redirect } from "next/navigation";
import { PageTransition } from "@/components/ui/page-transition";
import { RelationshipTimeline } from "@/features/timeline/presentation/relationship-timeline";
import { createServerBackend } from "@/lib/backend/create-server-backend";
import { resolveActivePageAccess } from "@/modules/identity/presentation/active-page-access";

export const dynamic = "force-dynamic";

export default async function RelationshipTimelinePage() {
  const backend = await createServerBackend();
  const access = resolveActivePageAccess(
    await backend.getCurrentActor.execute(),
  );

  if (access.kind === "redirect") {
    redirect(access.to);
  }

  const timelineResult = await backend.listVisibleTimeline.execute(access.actor);

  if (!timelineResult.ok) {
    throw new Error("Unable to load relationship timeline.");
  }

  return (
    <PageTransition>
      <RelationshipTimeline actor={access.actor} entries={timelineResult.value} />
    </PageTransition>
  );
}

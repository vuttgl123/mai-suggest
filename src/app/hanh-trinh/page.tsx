import { PageTransition } from "@/components/ui/page-transition";
import { RelationshipTimeline } from "@/features/timeline/presentation/relationship-timeline";
import { requireActivePageAccess } from "@/lib/backend/require-page-access";

export const dynamic = "force-dynamic";

export default async function RelationshipTimelinePage() {
  const { actor, backend } = await requireActivePageAccess();
  const timelineResult = await backend.listVisibleTimeline.execute(actor);

  if (!timelineResult.ok) {
    throw new Error("Unable to load relationship timeline.");
  }

  return (
    <PageTransition>
      <RelationshipTimeline actor={actor} entries={timelineResult.value} />
    </PageTransition>
  );
}

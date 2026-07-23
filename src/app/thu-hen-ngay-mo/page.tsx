import { PageTransition } from "@/components/ui/page-transition";
import { FutureLettersExperience } from "@/features/future-letters/presentation/future-letters-experience";
import { requireActivePageAccess } from "@/lib/backend/require-page-access";

export const dynamic = "force-dynamic";

export default async function ScheduledFutureLettersPage() {
  const { actor, backend } = await requireActivePageAccess();

  const [openedResult, scheduledResult] = await Promise.all([
    backend.listOpenedFutureLetters.execute(actor),
    backend.listOwnScheduledFutureLetters.execute(actor),
  ]);

  if (!openedResult.ok || !scheduledResult.ok) {
    throw new Error("Unable to load scheduled future letters.");
  }

  return (
    <PageTransition>
      <FutureLettersExperience
        actor={actor}
        openedLetters={openedResult.value}
        scheduledLetters={scheduledResult.value}
      />
    </PageTransition>
  );
}

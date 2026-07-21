import { redirect } from "next/navigation";
import { PageTransition } from "@/components/ui/page-transition";
import { FutureLettersExperience } from "@/features/future-letters/presentation/future-letters-experience";
import { createServerBackend } from "@/lib/backend/create-server-backend";
import { resolveActivePageAccess } from "@/modules/identity/presentation/active-page-access";

export const dynamic = "force-dynamic";

export default async function ScheduledFutureLettersPage() {
  const backend = await createServerBackend();
  const access = resolveActivePageAccess(
    await backend.getCurrentActor.execute(),
  );

  if (access.kind === "redirect") {
    redirect(access.to);
  }

  const [openedResult, scheduledResult] = await Promise.all([
    backend.listOpenedFutureLetters.execute(access.actor),
    backend.listOwnScheduledFutureLetters.execute(access.actor),
  ]);

  if (!openedResult.ok || !scheduledResult.ok) {
    throw new Error("Unable to load scheduled future letters.");
  }

  return (
    <PageTransition>
      <FutureLettersExperience
        actor={access.actor}
        openedLetters={openedResult.value}
        scheduledLetters={scheduledResult.value}
      />
    </PageTransition>
  );
}

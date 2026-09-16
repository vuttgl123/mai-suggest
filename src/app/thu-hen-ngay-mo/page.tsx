import { PageTransition } from "@/components/ui/page-transition";
import { FutureLettersExperience } from "@/features/future-letters/presentation/future-letters-experience";
import { requireActivePageAccess } from "@/lib/backend/require-page-access";

export const dynamic = "force-dynamic";

export default async function ScheduledFutureLettersPage(props: {
  searchParams?: Promise<{ page?: string; q?: string }>;
}) {
  const { actor, backend } = await requireActivePageAccess();

  const searchParams = await props.searchParams;
  const query = {
    page: searchParams?.page ? parseInt(searchParams.page, 10) : 1,
    query: searchParams?.q || "",
  };

  const [mailboxResult, scheduledResult] = await Promise.all([
    backend.listFutureMailbox.execute(actor, query),
    backend.listOwnScheduledFutureLetters.execute(actor),
  ]);

  if (!mailboxResult.ok || !scheduledResult.ok) {
    throw new Error("Unable to load scheduled future letters.");
  }

  return (
    <PageTransition>
      <FutureLettersExperience
        actor={actor}
        mailbox={mailboxResult.value}
        scheduledLetters={scheduledResult.value}
        searchQuery={query.query}
        currentPage={query.page}
      />
    </PageTransition>
  );
}

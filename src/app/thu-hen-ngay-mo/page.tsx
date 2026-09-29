import { PageTransition } from "@/components/ui/page-transition";
import { firstSearchParam, parsePositivePage } from "@/features/catalogue/lib/catalogue-navigation";
import {
  FutureLettersExperience,
  type MailboxTab,
} from "@/features/future-letters/presentation/future-letters-experience";
import { requireActivePageAccess } from "@/lib/backend/require-page-access";

export const dynamic = "force-dynamic";

export default async function ScheduledFutureLettersPage(props: {
  searchParams?: Promise<{ page?: string | string[]; q?: string | string[]; tab?: string | string[] }>;
}) {
  const [{ actor, backend }, searchParams] = await Promise.all([
    requireActivePageAccess(),
    props.searchParams,
  ]);

  const query = {
    page: parsePositivePage(searchParams?.page),
    query: firstSearchParam(searchParams?.q) ?? "",
  };
  const tab: MailboxTab = firstSearchParam(searchParams?.tab) === "da-hen" ? "scheduled" : "shared";

  const [mailboxResult, scheduledResult] = await Promise.all([
    backend.listFutureMailbox.execute(actor, query),
    // Only the viewer's own sealed letters.
    backend.listOwnScheduledFutureLetters.execute(actor),
  ]);

  if (!mailboxResult.ok || !scheduledResult.ok) {
    throw new Error("Unable to load scheduled future letters.");
  }

  return (
    <PageTransition>
      <FutureLettersExperience
        actor={actor}
        currentPage={query.page}
        mailbox={mailboxResult.value}
        scheduledLetters={scheduledResult.value}
        searchQuery={query.query}
        tab={tab}
      />
    </PageTransition>
  );
}

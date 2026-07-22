import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { PageTransition } from "@/components/ui/page-transition";
import { AdminTimeline } from "@/features/timeline/presentation/admin-timeline";
import { createServerBackend } from "@/lib/backend/create-server-backend";
import { resolveActivePageAccess } from "@/modules/identity/presentation/active-page-access";

export const dynamic = "force-dynamic";

interface AdminTimelinePageProps {
  searchParams: Promise<{ entry?: string | string[] }>;
}

export default async function AdminTimelinePage({
  searchParams,
}: AdminTimelinePageProps) {
  const [params, backend] = await Promise.all([searchParams, createServerBackend()]);
  const entryId = firstSearchParam(params.entry);
  const access = resolveActivePageAccess(
    await backend.getCurrentActor.execute(),
  );

  if (access.kind === "redirect") {
    redirect(access.to);
  }

  if (!access.actor.canManageCatalogue) {
    redirect("/access-denied");
  }

  const [entriesResult, selectedEntryResult] = await Promise.all([
    backend.listManagedTimeline.execute(access.actor),
    entryId
      ? backend.getManagedTimelineEntry.execute(access.actor, entryId)
      : Promise.resolve(null),
  ]);

  if (!entriesResult.ok) {
    throw new Error("Unable to load owner timeline management.");
  }

  const selectedEntry = selectedEntryResult?.ok
    ? selectedEntryResult.value
    : null;

  return (
    <PageTransition>
      <div className="diary-shell">
        <a
          className="sr-only absolute left-5 top-4 z-50 rounded-full bg-[var(--color-brand-strong)] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
          href="#admin-timeline-content"
        >
          Đi tới quản trị hành trình
        </a>
        <AppHeader activeSection="admin" actor={access.actor} />
        <AdminTimeline entries={entriesResult.value} selectedEntry={selectedEntry} />
      </div>
    </PageTransition>
  );
}

function firstSearchParam(value: string | string[] | undefined): string | null {
  const first = Array.isArray(value) ? value[0] : value;
  return first?.trim() || null;
}

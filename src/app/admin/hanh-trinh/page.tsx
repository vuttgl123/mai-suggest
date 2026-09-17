
import { AdminTimeline } from "@/features/timeline/presentation/admin-timeline";
import { requireCatalogueOwnerPageAccess } from "@/lib/backend/require-page-access";

export const dynamic = "force-dynamic";

interface AdminTimelinePageProps {
  searchParams: Promise<{ entry?: string | string[] }>;
}

export default async function AdminTimelinePage({
  searchParams,
}: AdminTimelinePageProps) {
  const [params, { actor, backend }] = await Promise.all([
    searchParams,
    requireCatalogueOwnerPageAccess(),
  ]);
  const entryId = firstSearchParam(params.entry);

  const [entriesResult, selectedEntryResult] = await Promise.all([
    backend.listManagedTimeline.execute(actor),
    entryId
      ? backend.getManagedTimelineEntry.execute(actor, entryId)
      : Promise.resolve(null),
  ]);

  if (!entriesResult.ok) {
    throw new Error("Unable to load owner timeline management.");
  }

  const selectedEntry = selectedEntryResult?.ok
    ? selectedEntryResult.value
    : null;

  return (
    <>
      <a
        className="sr-only absolute left-5 top-4 z-50 rounded-full bg-brand-strong px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
        href="#admin-timeline-content"
      >
        Đi tới quản trị hành trình
      </a>
      <AdminTimeline entries={entriesResult.value} selectedEntry={selectedEntry} />
    </>
  );
}

function firstSearchParam(value: string | string[] | undefined): string | null {
  const first = Array.isArray(value) ? value[0] : value;
  return first?.trim() || null;
}

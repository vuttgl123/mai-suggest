import { PageTransition } from "@/components/ui/page-transition";
import { RelationshipTimeline } from "@/features/timeline/presentation/relationship-timeline";
import { requireActivePageAccess } from "@/lib/backend/require-page-access";
import { firstSearchParam } from "@/features/catalogue/lib/catalogue-navigation";

export const dynamic = "force-dynamic";

interface TimelinePageProps {
  searchParams: Promise<{
    chapter?: string | string[];
  }>;
}

export default async function RelationshipTimelinePage({ searchParams }: TimelinePageProps) {
  const [params, { actor, backend }] = await Promise.all([
    searchParams,
    requireActivePageAccess(),
  ]);

  const activeChapterId = firstSearchParam(params.chapter);

  const [previewsResult, chapterDetailResult] = await Promise.all([
    backend.listVisibleTimelineChapters.execute(actor),
    activeChapterId
      ? backend.getVisibleTimelineChapter.execute(actor, activeChapterId)
      : Promise.resolve(null),
  ]);

  if (!previewsResult.ok || (chapterDetailResult && !chapterDetailResult.ok)) {
    throw new Error("Unable to load relationship timeline.");
  }

  const previews = previewsResult.value;
  // Auto-select first chapter if none is selected and previews exist
  let activeChapter = chapterDetailResult?.ok ? chapterDetailResult.value : null;
  if (!activeChapter && previews.length > 0) {
    const firstChapterResult = await backend.getVisibleTimelineChapter.execute(actor, previews[0].id);
    if (!firstChapterResult.ok) {
      throw new Error("Unable to load relationship timeline.");
    }
    activeChapter = firstChapterResult.value;
  }

  return (
    <PageTransition>
      <RelationshipTimeline 
        actor={actor} 
        previews={previews} 
        activeChapter={activeChapter}
      />
    </PageTransition>
  );
}

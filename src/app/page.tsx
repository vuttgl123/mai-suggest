import { CatalogueHome, type HomeOverview } from "@/features/catalogue/presentation/catalogue-home";
import { PageTransition } from "@/components/ui/page-transition";
import {
  firstSearchParam,
  parseCatalogueSearchQuery,
  parsePositivePage,
  PUBLIC_PAGE_SIZE,
} from "@/features/catalogue/lib/catalogue-navigation";
import { selectLivingCover, selectTodayNote } from "@/features/home/lib/home-selection";
import { requireActivePageAccess } from "@/lib/backend/require-page-access";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{
    category?: string | string[];
    page?: string | string[];
    q?: string | string[];
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const [params, { actor, backend }] = await Promise.all([
    searchParams,
    requireActivePageAccess(),
  ]);
  const categorySlug = firstSearchParam(params.category);
  const searchQuery = parseCatalogueSearchQuery(params.q);
  const requestedPage = parsePositivePage(params.page);
  const isOverview = !categorySlug && !searchQuery;

  const loadItemPage = (page: number) =>
    backend.listVisibleItemPage.execute(actor, {
      categorySlug: categorySlug ?? undefined,
      page,
      pageSize: PUBLIC_PAGE_SIZE,
      query: searchQuery ?? undefined,
    });

  const [categoriesResult, firstItemPage, chapterPreviewsResult, timelineResult, mailboxResult] =
    await Promise.all([
      backend.listVisibleCategories.execute(actor),
      loadItemPage(requestedPage),
      isOverview
        ? backend.listVisibleChapterPreviews.execute(actor, { itemsPerChapter: 1 })
        : Promise.resolve(null),
      isOverview ? backend.listVisibleTimelineChapters.execute(actor) : Promise.resolve(null),
      // Opened letters only: the mailbox never returns sealed letters.
      isOverview ? backend.listFutureMailbox.execute(actor, { page: 1, query: "" }) : Promise.resolve(null),
    ]);

  if (
    !categoriesResult.ok ||
    !firstItemPage.ok ||
    (chapterPreviewsResult && !chapterPreviewsResult.ok) ||
    (timelineResult && !timelineResult.ok) ||
    (mailboxResult && !mailboxResult.ok)
  ) {
    throw new Error("Unable to load catalogue.");
  }

  let itemPage = firstItemPage.value;
  if (itemPage.pageCount > 0 && requestedPage > itemPage.pageCount) {
    const lastPage = await loadItemPage(itemPage.pageCount);
    if (!lastPage.ok) throw new Error("Unable to load catalogue.");
    itemPage = lastPage.value;
  }

  let overview: HomeOverview | null = null;
  if (isOverview && chapterPreviewsResult?.ok && timelineResult?.ok && mailboxResult?.ok) {
    const chapters = timelineResult.value;
    const coverItem = itemPage.items[0] ?? null;
    const coverItemCategory = categoriesResult.value.find(
      (category) => category.id === coverItem?.categoryId,
    );

    overview = {
      cover: selectLivingCover({
        chapters,
        featuredItem: coverItem,
        featuredItemCategoryName: coverItemCategory?.name ?? null,
      }),
      today: selectTodayNote({
        latestOpenedLetter: mailboxResult.value.items[0] ?? null,
        chapters,
        now: new Date(),
      }),
      chapterPreviews: chapterPreviewsResult.value,
      chapterCount: chapters.length,
      openedLetterCount: mailboxResult.value.totalCount,
    };
  }

  return (
    <PageTransition>
      <CatalogueHome
        actor={actor}
        categories={categoriesResult.value}
        itemPage={itemPage}
        overview={overview}
        searchQuery={searchQuery}
        selectedCategorySlug={categorySlug}
      />
    </PageTransition>
  );
}

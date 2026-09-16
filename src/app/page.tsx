import { CatalogueHome } from "@/features/catalogue/presentation/catalogue-home";
import { PageTransition } from "@/components/ui/page-transition";
import {
  firstSearchParam,
  parseCatalogueSearchQuery,
  parsePositivePage,
  PUBLIC_PAGE_SIZE,
} from "@/features/catalogue/lib/catalogue-navigation";
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

  const [categoriesResult, itemsResult, chapterPreviewsResult] = await Promise.all([
    backend.listVisibleCategories.execute(actor),
    isOverview ? Promise.resolve(null) : backend.listVisibleItemPage.execute(
      actor,
      {
        categorySlug: categorySlug ?? undefined,
        page: requestedPage,
        pageSize: PUBLIC_PAGE_SIZE,
        query: searchQuery ?? undefined,
      },
    ),
    isOverview ? backend.listVisibleChapterPreviews.execute(actor, { itemsPerChapter: 6 }) : Promise.resolve(null),
  ]);

  if (!categoriesResult.ok || (itemsResult && !itemsResult.ok) || (chapterPreviewsResult && !chapterPreviewsResult.ok)) {
    throw new Error("Unable to load catalogue.");
  }

  let itemPage: import("@/core/application/result").Result<import("@/modules/catalogue/domain/catalogue-read-models").CatalogueItemPage> | null = itemsResult;

  if (itemsResult?.ok) {
    if (itemsResult.value.pageCount > 0 && requestedPage > itemsResult.value.pageCount) {
      itemPage = await backend.listVisibleItemPage.execute(actor, {
        categorySlug: categorySlug ?? undefined,
        page: itemsResult.value.pageCount,
        pageSize: PUBLIC_PAGE_SIZE,
        query: searchQuery ?? undefined,
      });

      if (!itemPage.ok) {
        throw new Error("Unable to load catalogue.");
      }
    }
  }

  return (
    <PageTransition>
      <CatalogueHome
        actor={actor}
        categories={categoriesResult.value}
        chapterPreviews={chapterPreviewsResult && chapterPreviewsResult.ok ? chapterPreviewsResult.value : undefined}
        itemPage={itemPage && itemPage.ok ? itemPage.value : undefined}
        searchQuery={searchQuery}
        selectedCategorySlug={categorySlug}
      />
    </PageTransition>
  );
}

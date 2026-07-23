import { CatalogueHome } from "@/features/catalogue/presentation/catalogue-home";
import { PageTransition } from "@/components/ui/page-transition";
import {
  firstSearchParam,
  parsePositivePage,
  PUBLIC_PAGE_SIZE,
} from "@/features/catalogue/lib/catalogue-navigation";
import { requireActivePageAccess } from "@/lib/backend/require-page-access";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{
    category?: string | string[];
    page?: string | string[];
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const [params, { actor, backend }] = await Promise.all([
    searchParams,
    requireActivePageAccess(),
  ]);
  const categorySlug = firstSearchParam(params.category);
  const requestedPage = parsePositivePage(params.page);

  const [categoriesResult, itemsResult] = await Promise.all([
    backend.listVisibleCategories.execute(actor),
    backend.listVisibleItemPage.execute(
      actor,
      { categorySlug: categorySlug ?? undefined, page: requestedPage, pageSize: PUBLIC_PAGE_SIZE },
    ),
  ]);

  if (!categoriesResult.ok || !itemsResult.ok) {
    throw new Error("Unable to load catalogue.");
  }

  const itemPage =
    itemsResult.value.pageCount > 0 && requestedPage > itemsResult.value.pageCount
      ? await backend.listVisibleItemPage.execute(actor, {
          categorySlug: categorySlug ?? undefined,
          page: itemsResult.value.pageCount,
          pageSize: PUBLIC_PAGE_SIZE,
        })
      : itemsResult;

  if (!itemPage.ok) {
    throw new Error("Unable to load catalogue.");
  }

  return (
    <PageTransition>
      <CatalogueHome
        actor={actor}
        categories={categoriesResult.value}
        itemPage={itemPage.value}
        selectedCategorySlug={categorySlug}
      />
    </PageTransition>
  );
}

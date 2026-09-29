
import { AdminCatalogue } from "@/features/catalogue/presentation/admin-catalogue";
import { requireCatalogueOwnerPageAccess } from "@/lib/backend/require-page-access";
import {
  firstSearchParam,
  parsePositivePage,
} from "@/features/catalogue/lib/catalogue-navigation";

export const dynamic = "force-dynamic";

interface AdminPageProps {
  searchParams: Promise<{
    category?: string | string[];
    item?: string | string[];
    page?: string | string[];
  }>;
}

const ADMIN_PAGE_SIZE = 10;

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const [params, { actor, backend }] = await Promise.all([
    searchParams,
    requireCatalogueOwnerPageAccess(),
  ]);
  const selectedCategoryId = firstSearchParam(params.category);
  const requestedPage = parsePositivePage(params.page);
  const selectedItemId = firstSearchParam(params.item);

  const [categoriesResult, itemsResult, selectedItemResult] = await Promise.all([
    backend.listManagedCategories.execute(actor),
    backend.listManagedItemPage.execute(actor, {
      categoryId: selectedCategoryId ?? undefined,
      page: requestedPage,
      pageSize: ADMIN_PAGE_SIZE,
    }),
    selectedItemId
      ? backend.getManagedItemDetail.execute(actor, selectedItemId)
      : Promise.resolve(null),
  ]);

  if (!categoriesResult.ok || !itemsResult.ok) {
    throw new Error("Unable to load owner catalogue management.");
  }

  const itemPage =
    itemsResult.value.pageCount > 0 && requestedPage > itemsResult.value.pageCount
      ? await backend.listManagedItemPage.execute(actor, {
          categoryId: selectedCategoryId ?? undefined,
          page: itemsResult.value.pageCount,
          pageSize: ADMIN_PAGE_SIZE,
        })
      : itemsResult;

  if (!itemPage.ok) {
    throw new Error("Unable to load owner catalogue management.");
  }



  const selectedItem =
    selectedItemResult?.ok &&
    (!selectedCategoryId || selectedItemResult.value.categoryId === selectedCategoryId)
      ? selectedItemResult.value
      : null;

  return (
    <>
      <a
        className="sr-only absolute left-5 top-4 z-50 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-on-brand focus:not-sr-only"
        href="#admin-content"
      >
        Đi tới nội dung quản trị
      </a>
      <AdminCatalogue
        categories={categoriesResult.value}
        itemPage={itemPage.value}
        selectedCategoryId={selectedCategoryId}
        selectedItem={selectedItem}
      />
    </>
  );
}

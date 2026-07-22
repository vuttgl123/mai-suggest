import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { DiaryBook } from "@/components/diary/diary-book";
import { PageTransition } from "@/components/ui/page-transition";
import { AdminCatalogue } from "@/features/catalogue/presentation/admin-catalogue";
import { createServerBackend } from "@/lib/backend/create-server-backend";
import {
  firstSearchParam,
  parsePositivePage,
} from "@/features/catalogue/lib/catalogue-navigation";
import { resolveActivePageAccess } from "@/modules/identity/presentation/active-page-access";

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
  const [params, backend] = await Promise.all([searchParams, createServerBackend()]);
  const selectedCategoryId = firstSearchParam(params.category);
  const requestedPage = parsePositivePage(params.page);
  const selectedItemId = firstSearchParam(params.item);
  const access = resolveActivePageAccess(
    await backend.getCurrentActor.execute(),
  );

  if (access.kind === "redirect") {
    redirect(access.to);
  }

  if (!access.actor.canManageCatalogue) {
    redirect("/access-denied");
  }

  const [categoriesResult, itemsResult, selectedItemResult] = await Promise.all([
    backend.listManagedCategories.execute(access.actor),
    backend.listManagedItemPage.execute(access.actor, {
      categoryId: selectedCategoryId ?? undefined,
      page: requestedPage,
      pageSize: ADMIN_PAGE_SIZE,
    }),
    selectedItemId
      ? backend.getManagedItemDetail.execute(access.actor, selectedItemId)
      : Promise.resolve(null),
  ]);

  if (!categoriesResult.ok || !itemsResult.ok) {
    throw new Error("Unable to load owner catalogue management.");
  }

  const itemPage =
    itemsResult.value.pageCount > 0 && requestedPage > itemsResult.value.pageCount
      ? await backend.listManagedItemPage.execute(access.actor, {
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
    <PageTransition>
      <DiaryBook>
        <a
          className="sr-only absolute left-5 top-4 z-50 rounded-full bg-[var(--color-brand-strong)] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
          href="#admin-content"
        >
          Đi tới nội dung quản trị
        </a>
        <AppHeader activeSection="admin" actor={access.actor} />
        <AdminCatalogue
          categories={categoriesResult.value}
          itemPage={itemPage.value}
          selectedCategoryId={selectedCategoryId}
          selectedItem={selectedItem}
        />
      </DiaryBook>
    </PageTransition>
  );
}

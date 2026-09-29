import { notFound } from "next/navigation";
import { CatalogueDetail } from "@/features/catalogue/presentation/catalogue-detail";
import { PageTransition } from "@/components/ui/page-transition";
import { createCataloguePath } from "@/features/catalogue/lib/catalogue-navigation";
import { sanitizeCatalogueReturnPath } from "@/features/catalogue/lib/catalogue-return-path";
import { requireActivePageAccess } from "@/lib/backend/require-page-access";

export const dynamic = "force-dynamic";

interface CatalogueDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ back?: string | string[] }>;
}

export default async function CatalogueDetailPage({
  params,
  searchParams,
}: CatalogueDetailPageProps) {
  const [{ slug }, { back }, { actor, backend }] = await Promise.all([
    params,
    searchParams,
    requireActivePageAccess(),
  ]);

  const [itemResult, categoriesResult] = await Promise.all([
    backend.getVisibleItemDetail.execute(actor, slug),
    backend.listVisibleCategories.execute(actor),
  ]);

  if (!itemResult.ok) {
    if (itemResult.error.code === "NOT_FOUND") notFound();
    throw new Error("Unable to load catalogue item.");
  }
  if (!categoriesResult.ok) {
    throw new Error("Unable to load catalogue categories.");
  }

  const category = categoriesResult.value.find(
    (entry) => entry.id === itemResult.value.categoryId,
  );
  const engagementResult = await backend.getItemEngagementView.execute(
    actor,
    itemResult.value.id,
  );

  if (!engagementResult.ok) {
    throw new Error("Unable to load catalogue engagement.");
  }

  // Return to the exact list context when it is a safe catalogue path.
  const backPath =
    sanitizeCatalogueReturnPath(back) ??
    createCataloguePath({ categorySlug: category?.slug ?? null, page: 1 });

  return (
    <PageTransition>
      <CatalogueDetail
        actor={actor}
        backHref={`${backPath}#collection`}
        categoryName={category?.name ?? null}
        engagement={engagementResult.value}
        item={itemResult.value}
      />
    </PageTransition>
  );
}

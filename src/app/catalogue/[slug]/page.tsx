import { notFound, redirect } from "next/navigation";
import { CatalogueDetail } from "@/features/catalogue/presentation/catalogue-detail";
import { PageTransition } from "@/components/ui/page-transition";
import { createServerBackend } from "@/lib/backend/create-server-backend";
import { resolveActivePageAccess } from "@/modules/identity/presentation/active-page-access";

export const dynamic = "force-dynamic";

interface CatalogueDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CatalogueDetailPage({
  params,
}: CatalogueDetailPageProps) {
  const [{ slug }, backend] = await Promise.all([params, createServerBackend()]);
  const access = resolveActivePageAccess(
    await backend.getCurrentActor.execute(),
  );

  if (access.kind === "redirect") {
    redirect(access.to);
  }

  const [itemResult, categoriesResult] = await Promise.all([
    backend.getVisibleItemDetail.execute(access.actor, slug),
    backend.listVisibleCategories.execute(access.actor),
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
    access.actor,
    itemResult.value.id,
  );

  if (!engagementResult.ok) {
    throw new Error("Unable to load catalogue engagement.");
  }

  return (
    <PageTransition>
      <CatalogueDetail
        actor={access.actor}
        categoryName={category?.name ?? null}
        engagement={engagementResult.value}
        item={itemResult.value}
      />
    </PageTransition>
  );
}

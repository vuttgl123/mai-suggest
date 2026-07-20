import { redirect } from "next/navigation";
import { CatalogueHome } from "@/features/catalogue/presentation/catalogue-home";
import { createServerBackend } from "@/lib/backend/create-server-backend";
import { resolveActivePageAccess } from "@/modules/identity/presentation/active-page-access";

export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ category?: string | string[] }>;
}

function firstSearchParam(value: string | string[] | undefined): string | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export default async function Home({ searchParams }: HomePageProps) {
  const [params, backend] = await Promise.all([
    searchParams,
    createServerBackend(),
  ]);
  const categorySlug = firstSearchParam(params.category);
  const access = resolveActivePageAccess(
    await backend.getCurrentActor.execute(),
  );

  if (access.kind === "redirect") {
    redirect(access.to);
  }

  const [categoriesResult, itemsResult] = await Promise.all([
    backend.listVisibleCategories.execute(access.actor),
    backend.listVisibleItems.execute(
      access.actor,
      categorySlug ? { categorySlug } : {},
    ),
  ]);

  if (!categoriesResult.ok || !itemsResult.ok) {
    throw new Error("Unable to load catalogue.");
  }

  return (
    <CatalogueHome
      actor={access.actor}
      categories={categoriesResult.value}
      items={itemsResult.value}
      selectedCategorySlug={categorySlug}
    />
  );
}

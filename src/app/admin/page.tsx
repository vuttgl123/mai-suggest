import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { AdminCatalogue } from "@/features/catalogue/presentation/admin-catalogue";
import { createServerBackend } from "@/lib/backend/create-server-backend";
import { resolveActivePageAccess } from "@/modules/identity/presentation/active-page-access";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const backend = await createServerBackend();
  const access = resolveActivePageAccess(
    await backend.getCurrentActor.execute(),
  );

  if (access.kind === "redirect") {
    redirect(access.to);
  }

  if (!access.actor.canManageCatalogue) {
    redirect("/access-denied");
  }

  const [categoriesResult, itemsResult] = await Promise.all([
    backend.listManagedCategories.execute(access.actor),
    backend.listManagedItems.execute(access.actor),
  ]);

  if (!categoriesResult.ok || !itemsResult.ok) {
    throw new Error("Unable to load owner catalogue management.");
  }

  return (
    <div className="diary-shell">
      <a
        className="sr-only absolute left-5 top-4 z-50 rounded-full bg-[var(--color-brand-strong)] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
        href="#admin-content"
      >
        Đi tới nội dung quản trị
      </a>
      <AppHeader actor={access.actor} />
      <AdminCatalogue
        categories={categoriesResult.value}
        items={itemsResult.value}
      />
    </div>
  );
}

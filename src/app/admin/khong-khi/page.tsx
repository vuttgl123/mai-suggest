import { AppHeader } from "@/components/app-header";
import { PageTransition } from "@/components/ui/page-transition";
import { AdminSiteTheme } from "@/features/site-theme/presentation/admin-site-theme";
import { requireCatalogueOwnerPageAccess } from "@/lib/backend/require-page-access";

export const dynamic = "force-dynamic";

export default async function AdminSiteThemePage() {
  const { actor, backend } = await requireCatalogueOwnerPageAccess();

  const management = await backend.getManagedSiteTheme.execute(actor);
  if (!management.ok) {
    throw new Error("Unable to load owner site theme management.");
  }

  return (
    <PageTransition>
      <div className="diary-shell">
        <a
          className="sr-only absolute left-5 top-4 z-50 rounded-full bg-[var(--color-brand-strong)] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
          href="#admin-site-theme-content"
        >
          Đi tới quản trị không khí giao diện
        </a>
        <AppHeader activeSection="admin" actor={actor} />
        <AdminSiteTheme {...management.value} />
      </div>
    </PageTransition>
  );
}

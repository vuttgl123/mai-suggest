import { AppHeader } from "@/components/app-header";
import { AdminWorkspaceSwitcher } from "@/components/admin/admin-workspace-switcher";
import { requireCatalogueOwnerPageAccess } from "@/lib/backend/require-page-access";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { actor } = await requireCatalogueOwnerPageAccess();

  return (
    <div className="diary-shell">
      <AppHeader activeSection="admin" actor={actor} />
      
      <div className="diary-container diary-section pt-8 sm:pt-10 pb-0 sm:pb-0">
        <AdminWorkspaceSwitcher />
      </div>
      
      {children}
    </div>
  );
}

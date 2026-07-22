import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { DiaryBook } from "@/components/diary/diary-book";
import { PageTransition } from "@/components/ui/page-transition";
import { AdminSiteTheme } from "@/features/site-theme/presentation/admin-site-theme";
import { createServerBackend } from "@/lib/backend/create-server-backend";
import { resolveActivePageAccess } from "@/modules/identity/presentation/active-page-access";

export const dynamic = "force-dynamic";

export default async function AdminSiteThemePage() {
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

  const management = await backend.getManagedSiteTheme.execute(access.actor);
  if (!management.ok) {
    throw new Error("Unable to load owner site theme management.");
  }

  return (
    <PageTransition>
      <DiaryBook>
        <a
          className="sr-only absolute left-5 top-4 z-50 rounded-full bg-[var(--color-brand-strong)] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
          href="#admin-site-theme-content"
        >
          Đi tới quản trị không khí giao diện
        </a>
        <AppHeader activeSection="admin" actor={access.actor} />
        <AdminSiteTheme {...management.value} />
      </DiaryBook>
    </PageTransition>
  );
}

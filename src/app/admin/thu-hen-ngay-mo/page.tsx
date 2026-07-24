import { AppHeader } from "@/components/app-header";
import { PageTransition } from "@/components/ui/page-transition";
import { AdminFutureLetters } from "@/features/future-letters/presentation/admin-future-letters";
import { requireCatalogueOwnerPageAccess } from "@/lib/backend/require-page-access";

export const dynamic = "force-dynamic";

export default async function AdminFutureLettersPage() {
  const { actor, backend } = await requireCatalogueOwnerPageAccess();
  const lettersResult = await backend.listManagedFutureLetters.execute(actor);

  if (!lettersResult.ok) {
    throw new Error("Unable to load owner future-letter management.");
  }

  return (
    <PageTransition>
      <div className="diary-shell">
        <a
          className="sr-only absolute left-5 top-4 z-50 rounded-full bg-[var(--color-brand-strong)] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
          href="#admin-future-letters-content"
        >
          Đi tới quản trị thư hẹn
        </a>
        <AppHeader activeSection="admin" actor={actor} />
        <AdminFutureLetters
          letters={lettersResult.value}
          serverNow={new Date().toISOString()}
        />
      </div>
    </PageTransition>
  );
}

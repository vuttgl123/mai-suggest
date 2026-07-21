import { CatalogueDetailHero } from "@/features/catalogue/presentation/catalogue-detail-hero";
import { CatalogueKeepsakeCollection } from "@/features/catalogue/presentation/catalogue-keepsake-collection";
import { readItemKeepsakes } from "@/modules/catalogue/domain/item-keepsakes";
import type {
  CatalogueItemDetail,
} from "@/modules/catalogue/domain/catalogue-read-models";
import type { ItemEngagementView } from "@/modules/engagement/domain/item-engagement-view";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";
import { AppHeader } from "@/components/app-header";
import { CatalogueEngagementPanel } from "@/features/catalogue/presentation/catalogue-engagement-panel";

interface CatalogueDetailProps {
  actor: ActiveActor;
  categoryName: string | null;
  engagement: ItemEngagementView;
  item: CatalogueItemDetail;
}

export function CatalogueDetail({
  actor,
  categoryName,
  engagement,
  item,
}: CatalogueDetailProps) {
  const keepsakes = readItemKeepsakes(item.metadata);

  return (
    <div className="diary-shell">
      <a
        className="sr-only absolute left-5 top-4 z-50 rounded-full bg-[var(--color-brand-strong)] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
        href="#item-content"
      >
        Đi tới nội dung chính
      </a>
      <AppHeader activeSection="catalogue" actor={actor} />

      <main id="item-content" tabIndex={-1}>
        <CatalogueDetailHero categoryName={categoryName} item={item} />

        <CatalogueKeepsakeCollection keepsakes={keepsakes} />

        <section className="relative isolate overflow-hidden border-b border-[var(--color-border)] bg-[rgb(255_252_248_/_62%)]">
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/45 to-transparent"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-5xl px-5 py-11 sm:px-8 sm:py-15 lg:px-10">
            <CatalogueEngagementPanel
              actorId={actor.userId}
              canManage={actor.canManageCatalogue}
              engagement={engagement}
              itemId={item.id}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

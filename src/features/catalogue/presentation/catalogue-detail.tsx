import { AppHeader } from "@/components/app-header";
import { CatalogueDetailHero } from "@/features/catalogue/presentation/catalogue-detail-hero";
import { CatalogueEngagementPanel } from "@/features/catalogue/presentation/catalogue-engagement-panel";
import { CatalogueKeepsakeCollection } from "@/features/catalogue/presentation/catalogue-keepsake-collection";
import { readItemKeepsakes } from "@/modules/catalogue/domain/item-keepsakes";
import type { CatalogueItemDetail } from "@/modules/catalogue/domain/catalogue-read-models";
import type { ItemEngagementView } from "@/modules/engagement/domain/item-engagement-view";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";

interface CatalogueDetailProps {
  actor: ActiveActor;
  backHref: string;
  categoryName: string | null;
  engagement: ItemEngagementView;
  item: CatalogueItemDetail;
}

export function CatalogueDetail({ actor, backHref, categoryName, engagement, item }: CatalogueDetailProps) {
  const keepsakes = readItemKeepsakes(item.metadata);

  return (
    <div className="journey-layout pb-24">
      <a
        className="sr-only absolute left-5 top-4 z-50 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-on-brand focus:not-sr-only"
        href="#item-content"
      >
        Đi tới nội dung chính
      </a>
      <AppHeader activeSection="catalogue" actor={actor} />

      <main id="item-content" tabIndex={-1}>
        <CatalogueDetailHero backHref={backHref} categoryName={categoryName} item={item} />
        <CatalogueKeepsakeCollection keepsakes={keepsakes} />
        <section aria-labelledby="engagement-heading" className="diary-container pt-20 sm:pt-24">
          <h2 className="reveal-rise font-display display-md text-brand-strong" id="engagement-heading">
            Mình nghĩ gì về điều này
          </h2>
          <div className="mt-10">
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

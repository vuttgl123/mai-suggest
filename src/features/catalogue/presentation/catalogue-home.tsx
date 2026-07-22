import Link from "next/link";
import { ViewTransition } from "react";
import { Heart, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { CatalogueChapterRail } from "@/features/catalogue/presentation/catalogue-chapter-rail";
import { CatalogueFeaturedItemCard } from "@/features/catalogue/presentation/catalogue-featured-item-card";
import { CatalogueItemCard } from "@/features/catalogue/presentation/catalogue-item-card";
import { CataloguePagination } from "@/features/catalogue/presentation/catalogue-pagination";
import { CinematicDiaryIntro } from "@/features/catalogue/presentation/cinematic-diary-intro";
import type {
  CatalogueCategory,
  CatalogueItemPage,
} from "@/modules/catalogue/domain/catalogue-read-models";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";

interface CatalogueHomeProps {
  actor: ActiveActor;
  categories: CatalogueCategory[];
  itemPage: CatalogueItemPage;
  selectedCategorySlug: string | null;
}

export function CatalogueHome({
  actor,
  categories,
  itemPage,
  selectedCategorySlug,
}: CatalogueHomeProps) {
  const categoryNames = new Map(
    categories.map((category) => [category.id, category.name]),
  );
  const selectedCategory = categories.find(
    (category) => category.slug === selectedCategorySlug,
  );
  const visibleCollectionTitle = selectedCategory
    ? selectedCategory.name
    : "Tất cả điều em yêu";
  const isFirstPage = itemPage.page === 1;
  const featuredItem = isFirstPage ? (itemPage.items[0] ?? null) : null;
  const gridItems = featuredItem ? itemPage.items.slice(1) : itemPage.items;

  return (
    <div className="diary-shell">
      <a
        className="sr-only absolute left-5 top-4 z-50 rounded-full bg-[var(--color-brand-strong)] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
        href="#main-content"
      >
        Đi tới nội dung chính
      </a>
      <CinematicDiaryIntro />
      <AppHeader activeSection="catalogue" actor={actor} />

      <main id="main-content" tabIndex={-1}>
        <section className="mx-auto grid max-w-7xl gap-7 px-5 pb-9 pt-9 sm:px-8 sm:pb-12 sm:pt-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(17rem,0.55fr)] lg:items-end lg:gap-12 lg:px-10 lg:pb-14 lg:pt-14">
          <div>
            <p className="diary-kicker">Dành riêng cho những điều dịu dàng</p>
            <div className="mt-4 flex items-center gap-3 text-[var(--color-accent)]" aria-hidden="true">
              <span className="diary-rule" />
              <Heart size={15} fill="currentColor" strokeWidth={1.4} />
            </div>
            <h1 className="font-display display-lg mt-4 max-w-3xl text-balance font-semibold text-[var(--color-brand-strong)]">
              Những điều làm em mỉm cười.
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">
              Một nơi nhỏ để gìn giữ những lựa chọn đẹp đẽ, những điểm đến đáng nhớ
              và mọi điều khiến ngày thường trở nên đặc biệt hơn.
            </p>
          </div>

          <aside className="diary-wash relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
            <Sparkles
              className="absolute right-6 top-6 text-[var(--color-accent)] opacity-70"
              size={20}
              strokeWidth={1.25}
              aria-hidden="true"
            />
            <p className="diary-kicker">Bộ sưu tập hôm nay</p>
            <p className="font-display mt-3 text-4xl font-semibold tracking-[-0.06em] text-[var(--color-brand-strong)]">
              {itemPage.total}
            </p>
            <p className="mt-2 max-w-48 text-sm leading-6 text-[var(--color-muted)]">
              điều đang được lưu lại
            </p>
          </aside>
        </section>

        <div id="collection" className="border-y border-[var(--color-border)] bg-[rgb(255_250_247_/_55%)]">
          <CatalogueChapterRail categories={categories} selectedCategorySlug={selectedCategorySlug} />
        </div>

        <section className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-11 lg:px-10 lg:py-14">
          {itemPage.items.length ? (
            <>
              <ViewTransition
                default="none"
                enter={{
                  "collection-change": "fade-in",
                  "page-forward": "nav-forward",
                  "page-back": "nav-back",
                  default: "none",
                }}
                exit={{
                  "collection-change": "fade-out",
                  "page-forward": "nav-forward",
                  "page-back": "nav-back",
                  default: "none",
                }}
                key={`${selectedCategorySlug ?? "all"}-${itemPage.page}`}
              >
                <div>
                  {featuredItem ? (
                    <section aria-labelledby="featured-item-heading">
                      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <p className="diary-kicker">Điều muốn mở ra trước</p>
                          <h2 className="font-display mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]" id="featured-item-heading">
                            {visibleCollectionTitle}
                          </h2>
                        </div>
                        <p className="text-sm text-[var(--color-muted)]">Một gợi ý để bắt đầu chậm rãi.</p>
                      </div>
                      <CatalogueFeaturedItemCard
                        categoryName={categoryNames.get(featuredItem.categoryId) ?? null}
                        item={featuredItem}
                      />
                    </section>
                  ) : null}

                  {gridItems.length ? (
                    <section className={featuredItem ? "mt-8" : ""} aria-labelledby="saved-things-heading">
                      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <p className="diary-kicker">Những điều đã lưu</p>
                          <h2 className="font-display mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]" id="saved-things-heading">
                            {featuredItem ? "Còn rất nhiều điều để khám phá" : visibleCollectionTitle}
                          </h2>
                        </div>
                        <p className="text-sm text-[var(--color-muted)]">{itemPage.total} điều đang được gìn giữ</p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                        {gridItems.map((item) => (
                          <CatalogueItemCard
                            categoryName={categoryNames.get(item.categoryId) ?? null}
                            item={item}
                            key={item.id}
                          />
                        ))}
                      </div>
                    </section>
                  ) : null}
                </div>
              </ViewTransition>
              <CataloguePagination
                categorySlug={selectedCategorySlug}
                page={itemPage.page}
                pageCount={itemPage.pageCount}
              />
            </>
          ) : (
            <EmptyCollection actor={actor} categoryName={selectedCategory?.name ?? null} />
          )}
        </section>
      </main>
    </div>
  );
}

function EmptyCollection({
  actor,
  categoryName,
}: {
  actor: ActiveActor;
  categoryName: string | null;
}) {
  return (
    <div className="diary-wash mx-auto max-w-2xl rounded-[var(--radius-dialog)] border border-[var(--color-border)] px-6 py-10 text-center shadow-[var(--shadow-soft)] sm:px-10 sm:py-12">
      <span
        className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
        aria-hidden="true"
      >
        <Heart size={20} fill="currentColor" strokeWidth={1.3} />
      </span>
      <h3 className="font-display mt-5 text-balance text-2xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)]">
        {categoryName ? `${categoryName} đang chờ một điều đẹp đẽ.` : "Bộ sưu tập đang chờ được bắt đầu."}
      </h3>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--color-muted)]">
        {actor.canManageCatalogue
          ? "Khi em thêm nội dung từ khu vực quản trị, những điều được chọn sẽ xuất hiện tại đây."
          : "Những điều được chọn sẽ xuất hiện ở đây khi bộ sưu tập được cập nhật."}
      </p>
    </div>
  );
}

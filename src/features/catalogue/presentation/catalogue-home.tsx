/* eslint-disable @next/next/no-img-element */

import { ViewTransition } from "react";
import { Heart, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { CatalogueChapterRail } from "@/features/catalogue/presentation/catalogue-chapter-rail";
import { CatalogueFeaturedItemCard } from "@/features/catalogue/presentation/catalogue-featured-item-card";
import { CatalogueItemCard } from "@/features/catalogue/presentation/catalogue-item-card";
import { CataloguePagination } from "@/features/catalogue/presentation/catalogue-pagination";
import { CatalogueSearch } from "@/features/catalogue/presentation/catalogue-search";
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
  searchQuery: string | null;
  selectedCategorySlug: string | null;
}

function getCatalogueCardGridClassName(index: number, itemCount: number) {
  const isCenteredLastCard = itemCount % 2 === 1 && index === itemCount - 1;

  if (isCenteredLastCard) {
    return "lg:col-span-6 lg:col-start-4";
  }

  const pairPosition = index % 4;

  return pairPosition === 0 || pairPosition === 3
    ? "lg:col-span-7"
    : "lg:col-span-5";
}

export function CatalogueHome({
  actor,
  categories,
  itemPage,
  searchQuery,
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
        <section className="diary-container diary-section grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(19rem,0.92fr)] lg:items-center lg:gap-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-[var(--color-accent)]" aria-hidden="true">
              <span className="diary-rule" />
              <Heart size={15} fill="currentColor" strokeWidth={1.4} />
              <span className="diary-rule max-w-12" />
            </div>
            <p className="mt-5 font-display text-lg italic text-[var(--color-brand)]">
              Dành riêng cho những điều dịu dàng
            </p>
            <h1 className="font-display display-xl mt-3 max-w-3xl text-balance font-semibold text-[var(--color-brand-strong)]">
              Những điều làm em mỉm cười.
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-7 text-[var(--color-muted)] sm:text-base sm:leading-8">
              Một nơi nhỏ để gìn giữ những lựa chọn đẹp đẽ, những điểm đến đáng nhớ
              và mọi điều khiến ngày thường trở nên đặc biệt hơn.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[var(--color-muted)]">
              <span className="inline-flex items-center gap-2 font-semibold text-[var(--color-brand)]">
                <Sparkles size={15} aria-hidden="true" />
                {itemPage.total} điều đang được lưu lại
              </span>
              <span className="h-px w-10 bg-[var(--color-border)]" aria-hidden="true" />
              <span>mở từng chương theo nhịp riêng</span>
            </div>
          </div>

          <aside className="relative lg:pl-5">
            <div className="absolute -left-1 top-8 hidden h-32 w-px bg-[var(--color-accent)]/45 lg:block" aria-hidden="true" />
            <div className="diary-image-frame rotate-[1.5deg] p-2 transition duration-500 hover:rotate-0">
              {featuredItem?.primaryImage ? (
                <img
                  alt=""
                  className="aspect-[5/4] w-full rounded-[calc(var(--radius-frame)-0.35rem)] object-cover"
                  decoding="async"
                  fetchPriority="high"
                  height={760}
                  loading="eager"
                  src={featuredItem.primaryImage.url}
                  width={960}
                />
              ) : (
                <div className="grid aspect-[5/4] place-items-center rounded-[calc(var(--radius-frame)-0.35rem)] bg-[linear-gradient(145deg,_var(--color-brand-soft),_var(--color-paper)_62%,_rgb(169_104_82_/_18%))] text-[var(--color-brand)]">
                  <Heart size={32} fill="currentColor" strokeWidth={1.15} aria-hidden="true" />
                  <span className="sr-only">Chưa có hình ảnh cho bộ sưu tập</span>
                </div>
              )}
            </div>
            <div className="relative -mt-5 ml-auto w-[min(87%,18rem)] rounded-[1rem] border border-[var(--color-border)] bg-[var(--surface-elevated)] p-4 shadow-[var(--shadow-card)] sm:p-5">
              <p className="font-display text-xl font-semibold tracking-[-0.035em] text-[var(--color-brand-strong)]">
                {featuredItem?.title ?? "Một trang giấy còn bỏ ngỏ"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                {featuredItem?.summary ?? "Chọn một chương để bắt đầu viết tiếp."}
              </p>
            </div>
          </aside>
        </section>

        <div id="collection" className="diary-section-tint">
          <CatalogueChapterRail
            categories={categories}
            query={searchQuery}
            selectedCategorySlug={selectedCategorySlug}
          />
        </div>

        <section className="diary-container diary-section">
          <CatalogueSearch
            categorySlug={selectedCategorySlug}
            query={searchQuery}
            resultCount={itemPage.total}
            key={`${selectedCategorySlug ?? "all"}:${searchQuery ?? ""}`}
          />
          <div className="mt-12">
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
                key={`${selectedCategorySlug ?? "all"}-${searchQuery ?? "all"}-${itemPage.page}`}
              >
                <div>
                  {featuredItem ? (
                    <section aria-labelledby="featured-item-heading">
                      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-accent)]">Điều muốn mở ra trước</p>
                          <h2 className="font-display mt-1 text-3xl font-semibold tracking-[-0.05em] text-[var(--color-brand-strong)]" id="featured-item-heading">
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
                      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-accent)]">Những điều đã lưu</p>
                          <h2 className="font-display mt-1 text-3xl font-semibold tracking-[-0.05em] text-[var(--color-brand-strong)]" id="saved-things-heading">
                            {featuredItem ? "Còn rất nhiều điều để khám phá" : visibleCollectionTitle}
                          </h2>
                        </div>
                        <p className="text-sm text-[var(--color-muted)]">{itemPage.total} điều đang được gìn giữ</p>
                      </div>
                      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
                        {gridItems.map((item, index) => (
                          <div
                            className={getCatalogueCardGridClassName(index, gridItems.length)}
                            key={item.id}
                          >
                            <CatalogueItemCard
                              categoryName={categoryNames.get(item.categoryId) ?? null}
                              item={item}
                            />
                          </div>
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
                query={searchQuery}
              />
              </>
            ) : (
              <EmptyCollection
                actor={actor}
                categoryName={selectedCategory?.name ?? null}
                searchQuery={searchQuery}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function EmptyCollection({
  actor,
  categoryName,
  searchQuery,
}: {
  actor: ActiveActor;
  categoryName: string | null;
  searchQuery: string | null;
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
        {searchQuery
          ? `Chưa tìm thấy điều nào cho “${searchQuery}”.`
          : categoryName
            ? `${categoryName} đang chờ một điều đẹp đẽ.`
            : "Bộ sưu tập đang chờ được bắt đầu."}
      </h3>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--color-muted)]">
        {searchQuery
          ? "Em thử đổi một vài từ khác, hoặc mở lại toàn bộ những điều đã lưu nhé."
          : actor.canManageCatalogue
            ? "Khi em thêm nội dung từ khu vực quản trị, những điều được chọn sẽ xuất hiện tại đây."
            : "Những điều được chọn sẽ xuất hiện ở đây khi bộ sưu tập được cập nhật."}
      </p>
    </div>
  );
}

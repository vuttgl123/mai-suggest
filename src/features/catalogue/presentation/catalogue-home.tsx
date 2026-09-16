 

import { ViewTransition } from "react";
import { Heart } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { CatalogueChapterRail } from "@/features/catalogue/presentation/catalogue-chapter-rail";
import { CatalogueChapterBand } from "@/features/catalogue/presentation/catalogue-chapter-band";
import { CatalogueFeaturedItemCard } from "@/features/catalogue/presentation/catalogue-featured-item-card";
import { CatalogueItemCard } from "@/features/catalogue/presentation/catalogue-item-card";
import { CataloguePagination } from "@/features/catalogue/presentation/catalogue-pagination";
import { CatalogueSearch } from "@/features/catalogue/presentation/catalogue-search";
import { CinematicDiaryIntro } from "@/features/catalogue/presentation/cinematic-diary-intro";
import type {
  CatalogueCategory,
  CatalogueItemPage,
  CatalogueChapterPreview,
} from "@/modules/catalogue/domain/catalogue-read-models";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";

interface CatalogueHomeProps {
  actor: ActiveActor;
  categories: CatalogueCategory[];
  chapterPreviews?: CatalogueChapterPreview[];
  itemPage?: CatalogueItemPage;
  searchQuery: string | null;
  selectedCategorySlug: string | null;
}

export function CatalogueHome({
  actor,
  categories,
  chapterPreviews,
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
  const isFirstPage = itemPage?.page === 1;
  const featuredItem = isFirstPage ? (itemPage?.items[0] ?? null) : null;
  const gridItems = featuredItem ? itemPage?.items.slice(1) : itemPage?.items;
  
  const isOverview = !searchQuery && !selectedCategorySlug && chapterPreviews;

  return (
    <div className="home-layout">
      <a
        className="sr-only absolute left-5 top-4 z-50 rounded-full bg-brand-strong px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
        href="#main-content"
      >
        Đi tới nội dung chính
      </a>
      <AppHeader activeSection="catalogue" actor={actor} />
      <CinematicDiaryIntro />

      <main id="main-content" tabIndex={-1}>
        {/* Hero Section removed as the Cinematic 3D Diary Intro serves this purpose */}

        <section id="collection" className="pt-16 lg:pt-24">
          <div className="diary-container">
            <CatalogueChapterRail
              categories={categories}
              query={searchQuery}
              selectedCategorySlug={selectedCategorySlug}
            />
            
            <div className="mt-8">
              <CatalogueSearch
                categorySlug={selectedCategorySlug}
                query={searchQuery}
                resultCount={isOverview ? 0 : (itemPage?.total ?? 0)}
                key={`${selectedCategorySlug ?? "all"}:${searchQuery ?? ""}`}
              />
            </div>
          </div>
          
          <div className="mt-16 pb-16">
            {isOverview ? (
              <div className="flex flex-col gap-12">
                {chapterPreviews.map((preview) => (
                  <CatalogueChapterBand key={preview.category.id} preview={preview} />
                ))}
              </div>
            ) : itemPage?.items.length ? (
              <div className="diary-container">
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
                            <p className="diary-kicker text-muted">Điều muốn mở ra trước</p>
                            <h2 className="font-display display-md mt-2 font-semibold text-brand-strong" id="featured-item-heading">
                              {visibleCollectionTitle}
                            </h2>
                          </div>
                          <p className="body-text-sm text-muted">Một gợi ý đã bắt đầu chớm nở rồi.</p>
                        </div>
                        <div className="animate-luxury-reveal opacity-0 [animation-fill-mode:forwards]" style={{ animationDelay: '100ms' }}>
                          <CatalogueFeaturedItemCard
                            categoryName={categoryNames.get(featuredItem.categoryId) ?? null}
                            item={featuredItem}
                          />
                        </div>
                      </section>
                    ) : null}

                    {gridItems && gridItems.length > 0 ? (
                      <section className={featuredItem ? "mt-12" : ""} aria-labelledby="saved-things-heading">
                        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                          <div>
                            <p className="diary-kicker text-muted">Những điều đã lưu</p>
                            <h2 className="font-display display-md mt-2 font-semibold text-brand-strong" id="saved-things-heading">
                              {featuredItem ? "Còn rất nhiều điều để khám phá" : visibleCollectionTitle}
                            </h2>
                          </div>
                          <p className="body-text-sm text-muted">{itemPage.total} điều đang được gìn giữ</p>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                          {gridItems.map((item, index) => (
                            <div 
                              className="animate-luxury-reveal opacity-0 [animation-fill-mode:forwards]" 
                              style={{ animationDelay: `${Math.min(index + 2, 5) * 100}ms` }}
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
                <div className="mt-16">
                  <CataloguePagination
                    categorySlug={selectedCategorySlug}
                    page={itemPage.page}
                    pageCount={itemPage.pageCount}
                    query={searchQuery}
                  />
                </div>
              </div>
            ) : (
              <div className="diary-container">
                <EmptyCollection
                  actor={actor}
                  categoryName={selectedCategory?.name ?? null}
                  searchQuery={searchQuery}
                />
              </div>
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
    <div className="diary-wash mx-auto max-w-2xl rounded-[var(--radius-dialog)] border border-border px-6 py-10 text-center shadow-[var(--shadow-soft)] sm:px-10 sm:py-12">
      <span
        className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand"
        aria-hidden="true"
      >
        <Heart size={20} fill="currentColor" strokeWidth={1.3} />
      </span>
      <h3 className="font-display mt-5 text-balance text-2xl font-semibold tracking-[-0.045em] text-brand-strong">
        {searchQuery
          ? `Chưa tìm thấy điều nào cho “${searchQuery}”.`
          : categoryName
            ? `${categoryName} đang chờ một điều đẹp đẽ.`
            : "Bộ sưu tập đang chờ được bắt đầu."}
      </h3>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted">
        {searchQuery
          ? "Em thử đổi một vài từ khác, hoặc mở lại toàn bộ những điều đã lưu nhé."
          : actor.canManageCatalogue
            ? "Khi em thêm nội dung từ khu vực quản trị, những điều được chọn sẽ xuất hiện tại đây."
            : "Những điều được chọn sẽ xuất hiện ở đây khi bộ sưu tập được cập nhật."}
      </p>
    </div>
  );
}

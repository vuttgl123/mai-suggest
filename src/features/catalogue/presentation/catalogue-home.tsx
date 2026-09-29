import { ViewTransition } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { MattedImage } from "@/components/ui/matted-image";
import { createCataloguePath } from "@/features/catalogue/lib/catalogue-navigation";
import { ArchiveObject, CatalogueFeaturedObject } from "@/features/catalogue/presentation/archive-object";
import { CatalogueChapterIndex } from "@/features/catalogue/presentation/catalogue-chapter-index";
import { CatalogueChapterRail } from "@/features/catalogue/presentation/catalogue-chapter-rail";
import { CataloguePagination } from "@/features/catalogue/presentation/catalogue-pagination";
import { CatalogueSearch } from "@/features/catalogue/presentation/catalogue-search";
import type { LivingCover as LivingCoverModel, TodayNote as TodayNoteModel } from "@/features/home/lib/home-selection";
import { HomeEntrances } from "@/features/home/presentation/home-entrances";
import { LivingCover } from "@/features/home/presentation/living-cover";
import { TodayNote } from "@/features/home/presentation/today-note";
import type {
  CatalogueCategory,
  CatalogueChapterPreview,
  CatalogueItemPage,
} from "@/modules/catalogue/domain/catalogue-read-models";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";

export interface HomeOverview {
  cover: LivingCoverModel;
  today: TodayNoteModel | null;
  chapterPreviews: CatalogueChapterPreview[];
  chapterCount: number;
  openedLetterCount: number;
}

interface CatalogueHomeProps {
  actor: ActiveActor;
  categories: CatalogueCategory[];
  itemPage: CatalogueItemPage;
  overview: HomeOverview | null;
  searchQuery: string | null;
  selectedCategorySlug: string | null;
}

export function CatalogueHome({
  actor,
  categories,
  itemPage,
  overview,
  searchQuery,
  selectedCategorySlug,
}: CatalogueHomeProps) {
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const selectedIndex = categories.findIndex((category) => category.slug === selectedCategorySlug);
  const selectedCategory = selectedIndex >= 0 ? categories[selectedIndex] : null;
  const returnPath = createCataloguePath({
    categorySlug: selectedCategorySlug,
    page: itemPage.page,
    query: searchQuery,
  });
  const featuredItem = itemPage.page === 1 ? (itemPage.items[0] ?? null) : null;
  const gridItems = featuredItem ? itemPage.items.slice(1) : itemPage.items;

  return (
    <div className="home-layout pb-24">
      <a
        className="sr-only absolute left-5 top-4 z-50 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-on-brand focus:not-sr-only"
        href="#main-content"
      >
        Đi tới nội dung chính
      </a>
      <AppHeader activeSection="catalogue" actor={actor} />

      <main id="main-content" tabIndex={-1}>
        {overview ? (
          <>
            <LivingCover cover={overview.cover} />
            <HomeEntrances
              chapterCount={overview.chapterCount}
              itemCount={itemPage.total}
              openedLetterCount={overview.openedLetterCount}
            />
            {overview.today ? <TodayNote note={overview.today} /> : null}
          </>
        ) : null}

        <section
          aria-labelledby="collection-heading"
          className={overview ? "pt-24 sm:pt-28" : "pt-10 sm:pt-16"}
          id="collection"
        >
          <div className="diary-container">
            {overview ? (
              <div className="flex flex-wrap items-end justify-between gap-6">
                <h2 className="reveal-rise font-display display-xl max-w-[16ch] text-brand-strong" id="collection-heading">
                  Một hôm nào đó, mình cùng đi nhé
                </h2>
                <CatalogueSearch categorySlug={null} key="search:overview" query={null} />
              </div>
            ) : (
              <CollectionOpener
                category={selectedCategory}
                chapterNumber={selectedIndex + 1}
                searchQuery={searchQuery}
                total={itemPage.total}
              />
            )}

            {overview ? (
              <div className="mt-12">
                <CatalogueChapterIndex chapters={overview.chapterPreviews} />
              </div>
            ) : (
              <div className="mt-8 grid gap-4">
                <CatalogueSearch
                  categorySlug={selectedCategorySlug}
                  key={`search:${selectedCategorySlug ?? "all"}:${searchQuery ?? ""}`}
                  query={searchQuery}
                />
                <CatalogueChapterRail
                  categories={categories}
                  query={searchQuery}
                  selectedCategorySlug={selectedCategorySlug}
                />
              </div>
            )}

            {itemPage.items.length ? (
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
                <div className={overview ? "mt-24" : "mt-12"}>
                  {overview ? (
                    <div className="reveal-rise mb-10 flex flex-wrap items-baseline justify-between gap-3">
                      <h3 className="font-display heading-text text-brand-strong">Mới lưu gần đây</h3>
                      <p className="tabular text-[0.9375rem] text-muted">{itemPage.total} điều đang được giữ</p>
                    </div>
                  ) : null}

                  {featuredItem ? (
                    <CatalogueFeaturedObject
                      categoryName={categoryNames.get(featuredItem.categoryId) ?? null}
                      item={featuredItem}
                      returnPath={returnPath}
                    />
                  ) : null}

                  {gridItems.length ? (
                    <ul className={`grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 ${featuredItem ? "mt-16 sm:mt-20" : ""}`}>
                      {gridItems.map((item) => (
                        <li className="reveal-mount" key={item.id}>
                          <ArchiveObject
                            categoryName={categoryNames.get(item.categoryId) ?? null}
                            item={item}
                            returnPath={returnPath}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mt-16">
                    <CataloguePagination
                      categorySlug={selectedCategorySlug}
                      page={itemPage.page}
                      pageCount={itemPage.pageCount}
                      query={searchQuery}
                    />
                  </div>
                </div>
              </ViewTransition>
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

function CollectionOpener({
  category,
  chapterNumber,
  searchQuery,
  total,
}: {
  category: CatalogueCategory | null;
  chapterNumber: number;
  searchQuery: string | null;
  total: number;
}) {
  if (!category) {
    return (
      <div>
        <h1 className="font-display display-xl text-brand-strong" id="collection-heading">
          {searchQuery ? `Kết quả cho “${searchQuery}”` : "Tất cả điều đã lưu"}
        </h1>
        <p className="tabular mt-3 text-muted">{total} điều</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {category.coverImageUrl ? (
        <div className="-mx-[var(--page-edge)] md:mx-0">
          <div className="aspect-[4/3] md:aspect-[21/9]">
            <MattedImage alt={`Ảnh bìa chương ${category.name}`} bare className="h-full" priority ratio="fill" src={category.coverImageUrl} />
          </div>
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-12 md:gap-x-6">
        <p className="tabular text-[0.9375rem] font-semibold text-brand md:col-span-12">
          Chương {chapterNumber}
        </p>
        <h1 className="font-display display-xl text-brand-strong md:col-span-7" id="collection-heading">
          {category.name}
        </h1>
        <div className="md:col-span-4 md:col-start-9 md:self-end">
          {category.description ? <p className="text-ink">{category.description}</p> : null}
          <p className="tabular mt-2 text-muted">
            {searchQuery ? `${total} kết quả cho “${searchQuery}”` : `${total} điều`}
          </p>
        </div>
      </div>
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
    <div className="mt-12 max-w-xl border-t border-border pt-8">
      <h2 className="font-display heading-text text-brand-strong">
        {searchQuery
          ? `Chưa tìm thấy điều nào cho “${searchQuery}”.`
          : categoryName
            ? `Chương ${categoryName} chưa có điều nào.`
            : "Bộ sưu tập chưa có điều nào."}
      </h2>
      <p className="mt-3 text-muted">
        {searchQuery
          ? "Thử một từ khác, hoặc xem lại toàn bộ bộ sưu tập."
          : actor.canManageCatalogue
            ? "Thêm điều đầu tiên trong khu quản trị, nó sẽ xuất hiện ở đây."
            : "Những điều được thêm vào sẽ xuất hiện ở đây."}
      </p>
      <div className="mt-4 flex flex-wrap gap-4">
        {searchQuery || categoryName ? (
          <Link className="text-link" href="/#collection">
            Xem toàn bộ bộ sưu tập
          </Link>
        ) : null}
        {actor.canManageCatalogue ? (
          <Link className="text-link" href="/admin">
            Mở khu quản trị
          </Link>
        ) : null}
      </div>
    </div>
  );
}

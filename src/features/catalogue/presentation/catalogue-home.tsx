import Link from "next/link";
import { ViewTransition } from "react";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { CatalogueItemCard } from "@/features/catalogue/presentation/catalogue-item-card";
import { CataloguePagination } from "@/features/catalogue/presentation/catalogue-pagination";
import { createCataloguePath } from "@/features/catalogue/lib/catalogue-navigation";
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

  return (
    <div className="diary-shell">
      <a
        className="sr-only absolute left-5 top-4 z-50 rounded-full bg-[var(--color-brand-strong)] px-4 py-2 text-sm font-semibold text-white focus:not-sr-only"
        href="#main-content"
      >
        Đi tới nội dung chính
      </a>
      <AppHeader activeSection="catalogue" actor={actor} />

      <main id="main-content" tabIndex={-1}>
        <section className="mx-auto grid max-w-7xl gap-9 px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.65fr)] lg:items-end lg:gap-14 lg:px-10 lg:pb-20 lg:pt-20">
          <div>
            <p className="diary-kicker">Dành riêng cho những điều dịu dàng</p>
            <div className="mt-4 flex items-center gap-3 text-[var(--color-accent)]" aria-hidden="true">
              <span className="diary-rule" />
              <Heart size={15} fill="currentColor" strokeWidth={1.4} />
            </div>
            <h1 className="font-display display-xl mt-5 max-w-3xl text-balance font-semibold text-[var(--color-brand-strong)]">
              Những điều làm em mỉm cười.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--color-muted)] sm:text-lg">
              Một nơi nhỏ để gìn giữ những lựa chọn đẹp đẽ, những điểm đến đáng nhớ
              và mọi điều khiến ngày thường trở nên đặc biệt hơn.
            </p>
          </div>

          <aside className="diary-wash relative overflow-hidden rounded-[var(--radius-dialog)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)] sm:p-7">
            <Sparkles
              className="absolute right-6 top-6 text-[var(--color-accent)] opacity-70"
              size={24}
              strokeWidth={1.25}
              aria-hidden="true"
            />
            <p className="diary-kicker">Bộ sưu tập hôm nay</p>
            <p className="font-display mt-4 text-4xl font-semibold tracking-[-0.06em] text-[var(--color-brand-strong)]">
              {itemPage.total}
            </p>
            <p className="mt-2 max-w-48 text-sm leading-6 text-[var(--color-muted)]">
              điều đang được lưu lại
            </p>
          </aside>
        </section>

        <section
          id="collection"
          className="border-y border-[var(--color-border)] bg-[rgb(255_250_247_/_55%)]"
          aria-labelledby="collection-heading"
        >
          <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="diary-kicker">Khám phá theo tâm trạng</p>
                <h2
                  id="collection-heading"
                  className="font-display mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]"
                >
                  {visibleCollectionTitle}
                </h2>
              </div>
              {selectedCategory ? (
                <Link
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-4 text-sm font-semibold text-[var(--color-brand)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)]"
                  href={createCataloguePath({ categorySlug: null, page: 1 })}
                  transitionTypes={["collection-change"]}
                >
                  Xem tất cả
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ) : null}
            </div>

            {categories.length ? (
              <nav aria-label="Lọc theo danh mục" className="mt-5 flex flex-wrap gap-2.5">
                <CategoryLink active={!selectedCategorySlug} href={createCataloguePath({ categorySlug: null, page: 1 })} label="Tất cả" />
                {categories.map((category) => (
                  <CategoryLink
                    active={category.slug === selectedCategorySlug}
                    href={createCataloguePath({ categorySlug: category.slug, page: 1 })}
                    key={category.id}
                    label={category.name}
                  />
                ))}
              </nav>
            ) : null}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                  {itemPage.items.map((item) => (
                    <CatalogueItemCard
                      categoryName={categoryNames.get(item.categoryId) ?? null}
                      item={item}
                      key={item.id}
                    />
                  ))}
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

function CategoryLink({
  active,
  href,
  label,
}: {
  active: boolean;
  href: string;
  label: string;
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold transition duration-[var(--duration-fast)] ${
        active
          ? "border-[var(--color-brand)] bg-[var(--color-brand)] text-white shadow-[0_6px_16px_rgb(122_16_37_/_18%)]"
          : "border-[var(--color-border)] bg-[rgb(255_250_247_/_70%)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-brand)]"
      }`}
      href={href}
      transitionTypes={["collection-change"]}
    >
      {label}
    </Link>
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

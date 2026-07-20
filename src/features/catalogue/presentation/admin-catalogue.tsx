"use client";

import Link from "next/link";
import { ExternalLink, Sparkles } from "lucide-react";
import { useState } from "react";
import { ViewTransition } from "react";
import { AdminCatalogueSidebar } from "@/features/catalogue/presentation/admin-catalogue-sidebar";
import type { AdminFeedback } from "@/features/catalogue/presentation/admin-catalogue-feedback";
import { AdminItemEditor } from "@/features/catalogue/presentation/admin-item-editor";
import { AdminItemList } from "@/features/catalogue/presentation/admin-item-list";
import type {
  ManagedCatalogueCategory,
  ManagedCatalogueItemDetail,
  ManagedCatalogueItemPage,
} from "@/modules/catalogue/domain/catalogue-admin-models";

interface AdminCatalogueProps {
  categories: ManagedCatalogueCategory[];
  itemPage: ManagedCatalogueItemPage;
  selectedCategoryId: string | null;
  selectedItem: ManagedCatalogueItemDetail | null;
}

export function AdminCatalogue({
  categories,
  itemPage,
  selectedCategoryId,
  selectedItem,
}: AdminCatalogueProps) {
  const [feedback, setFeedback] = useState<AdminFeedback | null>(null);
  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  );
  const defaultCategoryId = selectedCategoryId ?? categories[0]?.id ?? null;

  return (
    <main
      id="admin-content"
      className="mx-auto max-w-[96rem] px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16"
      tabIndex={-1}
    >
      <section className="relative overflow-hidden rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--color-paper)] px-6 py-8 shadow-[var(--shadow-card)] sm:px-9 sm:py-10">
        <Sparkles className="absolute right-7 top-7 text-[var(--color-accent)] opacity-65" size={25} strokeWidth={1.25} aria-hidden="true" />
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="diary-kicker">Owner workspace</p>
            <h1 className="font-display mt-4 max-w-3xl text-balance text-5xl font-semibold tracking-[-0.06em] text-[var(--color-brand-strong)] sm:text-6xl">
              Những điều đẹp đẽ được chăm chút ở đây.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">
              Sắp xếp bộ sưu tập, viết những lời riêng tư và chọn cách chúng xuất hiện với người em yêu.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[var(--color-brand-soft)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-brand)]">
              {categories.length} danh mục
            </span>
            <span className="rounded-full bg-[rgb(166_91_69_/_12%)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-accent)]">
              {itemPage.total} item{selectedCategory ? ` · ${selectedCategory.name}` : ""}
            </span>
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-4 text-sm font-semibold text-[var(--color-brand)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)]"
              href="/"
            >
              Xem bộ sưu tập
              <ExternalLink size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {feedback ? (
        <p
          aria-live="polite"
          className={`mt-6 rounded-[var(--radius-card)] border px-4 py-3 text-sm leading-6 ${
            feedback.tone === "success"
              ? "border-[var(--color-positive)]/25 bg-[var(--color-positive)]/10 text-[var(--color-positive)]"
              : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      <section className="mt-8 grid gap-6 xl:grid-cols-[15rem_minmax(19rem,0.65fr)_minmax(30rem,1.15fr)] xl:items-start">
        <AdminCatalogueSidebar
          categories={categories}
          onFeedback={setFeedback}
          selectedCategoryId={selectedCategoryId}
        />
        <AdminItemList
          categoryId={selectedCategoryId}
          itemPage={itemPage}
          onFeedback={setFeedback}
          selectedItemId={selectedItem?.id ?? null}
        />
        <ViewTransition
          default="none"
          enter={{ "admin-select": "fade-in", default: "none" }}
          exit={{ "admin-select": "fade-out", default: "none" }}
          key={selectedItem?.id ?? `new-${defaultCategoryId ?? "none"}`}
        >
          <AdminItemEditor
            categories={categories}
            defaultCategoryId={defaultCategoryId}
            onFeedback={setFeedback}
            selectedItem={selectedItem}
          />
        </ViewTransition>
      </section>
    </main>
  );
}

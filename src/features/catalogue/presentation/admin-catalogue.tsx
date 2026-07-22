"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { ViewTransition } from "react";
import { AdminWorkspaceHeader } from "@/components/admin/admin-workspace-header";
import { AdminWorkspaceSwitcher } from "@/components/admin/admin-workspace-switcher";
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
      className="mx-auto max-w-[96rem] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12"
      tabIndex={-1}
    >
      <AdminWorkspaceHeader
        actions={
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-4 text-sm font-semibold text-[var(--color-brand)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)]"
            href="/"
          >
            Xem bộ sưu tập
            <ExternalLink aria-hidden="true" size={16} />
          </Link>
        }
        description="Sắp xếp bộ sưu tập, viết những lời riêng tư và chọn cách chúng xuất hiện với người em yêu."
        eyebrow="Quản trị · bộ sưu tập"
        summary={
          <>
            <span className="rounded-full bg-[var(--color-brand-soft)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-brand)]">
              {categories.length} danh mục
            </span>
            <span className="rounded-full bg-[rgb(166_91_69_/_12%)] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-accent)]">
              {itemPage.total} item{selectedCategory ? ` · ${selectedCategory.name}` : ""}
            </span>
          </>
        }
        title="Những điều đẹp đẽ được chăm chút ở đây."
      />
      <AdminWorkspaceSwitcher active="catalogue" />

      {feedback ? (
        <p
          aria-live="polite"
          className={`mt-5 rounded-[var(--radius-card)] border px-4 py-3 text-sm leading-6 ${
            feedback.tone === "success"
              ? "border-[var(--color-positive)]/25 bg-[var(--color-positive)]/10 text-[var(--color-positive)]"
              : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      <section className="diary-section-rule mt-5 grid gap-5 py-5 xl:grid-cols-[minmax(23rem,0.82fr)_minmax(34rem,1.18fr)] xl:items-start">
        <div className="grid gap-5 lg:grid-cols-[13rem_minmax(0,1fr)] xl:items-start">
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
        </div>
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

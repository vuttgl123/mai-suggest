"use client";

import Link from "next/link";
import { FolderPlus, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import type { AdminFeedback } from "@/features/catalogue/presentation/admin-catalogue-feedback";
import { feedbackForFailure } from "@/features/catalogue/presentation/admin-catalogue-feedback";
import { createAdminCataloguePath } from "@/features/catalogue/lib/admin-catalogue-navigation";
import type { ManagedCatalogueCategory } from "@/modules/catalogue/domain/catalogue-admin-models";
import {
  createCatalogueCategoryAction,
  deleteCatalogueCategoryAction,
} from "@/modules/catalogue/presentation/catalogue-admin-actions";

interface AdminCatalogueSidebarProps {
  categories: ManagedCatalogueCategory[];
  selectedCategoryId: string | null;
  onFeedback: (feedback: AdminFeedback) => void;
}

export function AdminCatalogueSidebar({
  categories,
  selectedCategoryId,
  onFeedback,
}: AdminCatalogueSidebarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [confirmingCategoryId, setConfirmingCategoryId] = useState<string | null>(null);

  function runMutation(operation: () => Promise<void>) {
    startTransition(operation);
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const name = textValue(values, "name");

    if (!name) {
      onFeedback({ tone: "error", message: "Hãy đặt tên cho danh mục." });
      return;
    }

    runMutation(async () => {
      const result = await createCatalogueCategoryAction({
        name,
        slug: textValue(values, "slug") ?? slugify(name),
        description: textValue(values, "description"),
        icon: null,
        coverImageUrl: null,
        sortOrder: numberValue(values, "sortOrder", categories.length * 10 + 10),
        isActive: values.get("isActive") === "on",
      });

      if (!result.ok) {
        onFeedback(feedbackForFailure(result));
        return;
      }

      onFeedback({ tone: "success", message: "Đã tạo danh mục mới." });
      setShowCreateForm(false);
      router.push(
        createAdminCataloguePath({
          categoryId: result.value.id,
          itemId: null,
          page: 1,
        }),
      );
      router.refresh();
    });
  }

  function deleteEmptyCategory(category: ManagedCatalogueCategory) {
    runMutation(async () => {
      const result = await deleteCatalogueCategoryAction(category.id);
      if (!result.ok) {
        onFeedback({
          tone: "error",
          message: "Chỉ có thể xóa danh mục khi không còn item bên trong.",
        });
        return;
      }

      onFeedback({ tone: "success", message: "Đã xóa danh mục trống." });
      setConfirmingCategoryId(null);
      router.replace("/admin");
      router.refresh();
    });
  }

  return (
    <aside className="rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[rgb(255_249_243_/_78%)] p-3 shadow-[var(--shadow-soft)] xl:sticky xl:top-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="diary-kicker">Bộ sưu tập</p>
          <h2 className="font-display mt-1 text-lg font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]">
            Danh mục
          </h2>
        </div>
        <Button
          aria-expanded={showCreateForm}
          onClick={() => setShowCreateForm((visible) => !visible)}
          size="icon"
          type="button"
          variant="secondary"
        >
          <Plus size={17} aria-hidden="true" />
          <span className="sr-only">Thêm danh mục</span>
        </Button>
      </div>

      {showCreateForm ? (
        <form className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-paper)] p-3" onSubmit={handleCreate}>
          <div className="flex items-start gap-2">
            <FolderPlus className="mt-0.5 text-[var(--color-accent)]" size={18} aria-hidden="true" />
            <p className="text-sm font-semibold text-[var(--color-brand-strong)]">Danh mục mới</p>
          </div>
          <label className="mt-3 block text-sm font-semibold text-[var(--color-brand-strong)]">
            Tên danh mục
            <input className={inputClassName} name="name" required />
          </label>
          <label className="mt-3 block text-sm font-semibold text-[var(--color-brand-strong)]">
            Slug <span className="font-normal text-[var(--color-muted)]">(tự tạo nếu trống)</span>
            <input className={inputClassName} name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" spellCheck={false} />
          </label>
          <label className="mt-3 block text-sm font-semibold text-[var(--color-brand-strong)]">
            Mô tả <span className="font-normal text-[var(--color-muted)]">(không bắt buộc)</span>
            <textarea className={`${inputClassName} min-h-20 py-3`} name="description" />
          </label>
          <input name="sortOrder" type="hidden" value={categories.length * 10 + 10} readOnly />
          <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-strong)]">
            <input defaultChecked className="h-4 w-4 accent-[var(--color-brand)]" name="isActive" type="checkbox" />
            Hiển thị ngay
          </label>
          <div className="mt-4 flex gap-2">
            <Button disabled={isPending} size="compact" type="submit">
              {isPending ? "Đang lưu…" : "Tạo danh mục"}
            </Button>
            <Button disabled={isPending} onClick={() => setShowCreateForm(false)} size="compact" type="button" variant="quiet">
              Hủy
            </Button>
          </div>
        </form>
      ) : null}

      <nav aria-label="Danh mục quản trị" className="mt-4 space-y-1">
        <Link
          aria-current={selectedCategoryId === null ? "page" : undefined}
          className={categoryLinkClassName(selectedCategoryId === null)}
          href={createAdminCataloguePath({ categoryId: null, itemId: null, page: 1 })}
        >
          Tất cả item
        </Link>
        {categories.map((category) => (
          <div key={category.id}>
            <Link
              aria-current={selectedCategoryId === category.id ? "page" : undefined}
              className={categoryLinkClassName(selectedCategoryId === category.id)}
              href={createAdminCataloguePath({ categoryId: category.id, itemId: null, page: 1 })}
            >
              <span className="min-w-0 truncate">{category.name}</span>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] opacity-70">
                {category.isActive ? "Live" : "Ẩn"}
              </span>
            </Link>
            {confirmingCategoryId === category.id ? (
              <div className="mt-2 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-3">
                <p className="text-xs leading-5 text-[var(--color-danger)]">Xóa danh mục này nếu nó đã trống?</p>
                <div className="mt-2 flex gap-2">
                  <Button disabled={isPending} onClick={() => setConfirmingCategoryId(null)} size="compact" type="button" variant="quiet">
                    Hủy
                  </Button>
                  <Button disabled={isPending} onClick={() => deleteEmptyCategory(category)} size="compact" type="button" variant="danger">
                    Xóa
                  </Button>
                </div>
              </div>
            ) : (
              selectedCategoryId === category.id ? (
                <Button
                  className="mt-1 w-full justify-start px-3 text-[11px]"
                  disabled={isPending}
                  onClick={() => setConfirmingCategoryId(category.id)}
                  size="compact"
                  type="button"
                  variant="quiet"
                >
                  <Trash2 size={13} aria-hidden="true" />
                  Xóa nếu danh mục trống
                </Button>
              ) : null
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}

function categoryLinkClassName(active: boolean): string {
  return `flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 text-sm font-semibold transition ${
    active
      ? "bg-[var(--color-brand)] text-white shadow-[0_7px_17px_rgb(49_5_12_/_20%)]"
      : "text-[var(--color-muted)] hover:bg-[var(--color-brand-soft)] hover:text-[var(--color-brand)]"
  }`;
}

function textValue(values: FormData, name: string): string | null {
  const value = values.get(name);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(values: FormData, name: string, fallback: number): number {
  const value = textValue(values, name);
  return value === null ? fallback : Number(value);
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const inputClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-focus)]";

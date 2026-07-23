"use client";

import { Check, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  feedbackForFailure,
  type AdminFeedback,
} from "@/features/catalogue/presentation/admin-catalogue-feedback";
import type {
  CatalogueCategoryInput,
  ManagedCatalogueCategory,
} from "@/modules/catalogue/domain/catalogue-admin-models";
import { updateCatalogueCategoryAction } from "@/modules/catalogue/presentation/catalogue-admin-actions";

interface AdminCategoryEditorProps {
  category: ManagedCatalogueCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onFeedback: (feedback: AdminFeedback) => void;
}

interface CategoryDraft {
  coverImageUrl: string;
  description: string;
  icon: string;
  isActive: boolean;
  name: string;
  slug: string;
  sortOrder: string;
}

export function AdminCategoryEditor({
  category,
  isOpen,
  onClose,
  onFeedback,
}: AdminCategoryEditorProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [draft, setDraft] = useState<CategoryDraft>(() => createDraft(null));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && category) {
      setDraft(createDraft(category));
      setFeedback(null);
      if (!dialog.open) dialog.showModal();
      return;
    }

    if (dialog.open) dialog.close();
  }, [category, isOpen]);

  function updateDraft(patch: Partial<CategoryDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!category) return;

    const name = draft.name.trim();
    const sortOrder = Number(draft.sortOrder);

    if (!name) {
      setFeedback("Hãy đặt tên cho danh mục.");
      return;
    }

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setFeedback("Thứ tự hiển thị phải là số nguyên từ 0 trở lên.");
      return;
    }

    const input: CatalogueCategoryInput = {
      name,
      slug: draft.slug.trim(),
      description: optionalText(draft.description),
      icon: optionalText(draft.icon),
      coverImageUrl: optionalText(draft.coverImageUrl),
      sortOrder,
      isActive: draft.isActive,
    };

    startTransition(async () => {
      const result = await updateCatalogueCategoryAction(category.id, input);

      if (!result.ok) {
        setFeedback(feedbackForFailure(result).message);
        return;
      }

      dialogRef.current?.close();
      onFeedback({ tone: "success", message: "Đã lưu thay đổi danh mục." });
      router.refresh();
    });
  }

  return (
    <dialog
      aria-labelledby="admin-category-editor-title"
      className="w-[min(100%_-_1.5rem,44rem)] rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--color-paper)] p-0 text-[var(--color-ink)] shadow-[var(--shadow-card)]"
      onClose={onClose}
      ref={dialogRef}
    >
      <form
        className="max-h-[min(46rem,calc(100vh_-_1.5rem))] overflow-y-auto p-5 sm:p-7"
        onSubmit={submit}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="diary-kicker">Bộ sưu tập · một chương nhỏ</p>
            <div
              aria-hidden="true"
              className="mt-3 flex items-center gap-2 text-[var(--color-accent)]"
            >
              <span className="diary-rule" />
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
            </div>
            <h2
              className="font-display mt-3 text-3xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)]"
              id="admin-category-editor-title"
            >
              Sửa danh mục
            </h2>
          </div>
          <Button
            aria-label="Đóng hộp sửa danh mục"
            disabled={isPending}
            onClick={() => dialogRef.current?.close()}
            size="icon"
            type="button"
            variant="quiet"
          >
            <X size={18} aria-hidden="true" />
          </Button>
        </div>

        <p className="mt-4 max-w-2xl rounded-[var(--radius-card)] bg-[rgb(101_12_28_/_4%)] px-4 py-3 text-sm leading-6 text-[var(--color-muted)]">
          Những thay đổi này sẽ sắp xếp lại cách chương này xuất hiện trong bộ
          sưu tập của hai đứa.
        </p>

        <div className="mt-6 grid gap-4">
          <fieldset className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--theme-card-surface)] p-4">
            <legend className="px-1 text-sm font-semibold text-[var(--color-brand-strong)]">
              Nội dung danh mục
            </legend>
            <div className="mt-3 grid gap-4">
              <label className="block text-sm font-semibold text-[var(--color-brand-strong)]">
                <span>Tên danh mục</span>
                <input
                  autoComplete="off"
                  className={inputClassName}
                  disabled={isPending}
                  name="category-name"
                  onChange={(event) => updateDraft({ name: event.target.value })}
                  required
                  value={draft.name}
                />
              </label>
              <label className="block text-sm font-semibold text-[var(--color-brand-strong)]">
                <span>Slug</span>
                <input
                  autoComplete="off"
                  className={inputClassName}
                  disabled={isPending}
                  name="category-slug"
                  onChange={(event) => updateDraft({ slug: event.target.value })}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  required
                  spellCheck={false}
                  value={draft.slug}
                />
                <small>Chỉ dùng chữ thường, số và dấu gạch ngang.</small>
              </label>
              <label className="block text-sm font-semibold text-[var(--color-brand-strong)]">
                <span>Mô tả</span>
                <textarea
                  className={`${inputClassName} min-h-28 py-3 leading-7`}
                  disabled={isPending}
                  name="category-description"
                  onChange={(event) =>
                    updateDraft({ description: event.target.value })
                  }
                  value={draft.description}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-4">
            <legend className="px-1 text-sm font-semibold text-[var(--color-brand-strong)]">
              Diện mạo và thứ tự
            </legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-[var(--color-brand-strong)]">
                <span>Biểu tượng</span>
                <input
                  autoComplete="off"
                  className={inputClassName}
                  disabled={isPending}
                  name="category-icon"
                  onChange={(event) => updateDraft({ icon: event.target.value })}
                  placeholder="Ví dụ: ✦"
                  value={draft.icon}
                />
              </label>
              <label className="block text-sm font-semibold text-[var(--color-brand-strong)]">
                <span>Thứ tự hiển thị</span>
                <input
                  className={inputClassName}
                  disabled={isPending}
                  min={0}
                  name="category-sort-order"
                  onChange={(event) =>
                    updateDraft({ sortOrder: event.target.value })
                  }
                  required
                  step={1}
                  type="number"
                  value={draft.sortOrder}
                />
              </label>
            </div>
            <label className="mt-4 block text-sm font-semibold text-[var(--color-brand-strong)]">
              <span>URL ảnh bìa</span>
              <input
                autoComplete="url"
                className={inputClassName}
                disabled={isPending}
                inputMode="url"
                name="category-cover-image"
                onChange={(event) =>
                  updateDraft({ coverImageUrl: event.target.value })
                }
                placeholder="https://…"
                type="url"
                value={draft.coverImageUrl}
              />
            </label>
            <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-strong)]">
              <input
                checked={draft.isActive}
                className="h-4 w-4 accent-[var(--color-brand)]"
                disabled={isPending}
                name="category-is-active"
                onChange={(event) => updateDraft({ isActive: event.target.checked })}
                type="checkbox"
              />
              Hiển thị ngay
            </label>
          </fieldset>
        </div>

        {feedback ? (
          <p
            aria-live="polite"
            className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3 text-sm leading-6 text-[var(--color-danger)]"
          >
            {feedback}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-[var(--color-border)] pt-5">
          <Button
            disabled={isPending}
            onClick={() => dialogRef.current?.close()}
            type="button"
            variant="quiet"
          >
            Hủy
          </Button>
          <Button disabled={isPending} type="submit">
            <Check size={16} aria-hidden="true" />
            {isPending ? "Đang lưu…" : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}

function createDraft(category: ManagedCatalogueCategory | null): CategoryDraft {
  return {
    coverImageUrl: category?.coverImageUrl ?? "",
    description: category?.description ?? "",
    icon: category?.icon ?? "",
    isActive: category?.isActive ?? true,
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    sortOrder: category ? String(category.sortOrder) : "0",
  };
}

function optionalText(value: string): string | null {
  const normalized = value.trim();
  return normalized || null;
}

const inputClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white/70 px-3 text-sm text-[var(--color-ink)] shadow-sm outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-focus)] disabled:bg-[var(--color-surface)]";

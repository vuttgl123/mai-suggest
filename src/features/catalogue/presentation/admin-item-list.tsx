"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { AdminFeedback } from "@/features/catalogue/presentation/admin-catalogue-feedback";
import { feedbackForFailure } from "@/features/catalogue/presentation/admin-catalogue-feedback";
import { createAdminCataloguePath } from "@/features/catalogue/lib/admin-catalogue-navigation";
import type {
  ManagedCatalogueItem,
  ManagedCatalogueItemPage,
} from "@/modules/catalogue/domain/catalogue-admin-models";
import { deleteCatalogueItemAction } from "@/modules/catalogue/presentation/catalogue-admin-actions";

interface AdminItemListProps {
  categoryId: string | null;
  itemPage: ManagedCatalogueItemPage;
  selectedItemId: string | null;
  onFeedback: (feedback: AdminFeedback) => void;
}

export function AdminItemList({
  categoryId,
  itemPage,
  selectedItemId,
  onFeedback,
}: AdminItemListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmingItemId, setConfirmingItemId] = useState<string | null>(null);

  function selectPath(itemId: string | null, page = itemPage.page): string {
    return createAdminCataloguePath({ categoryId, itemId, page });
  }

  function deleteItem(item: ManagedCatalogueItem) {
    startTransition(async () => {
      const result = await deleteCatalogueItemAction(item.id);
      if (!result.ok) {
        onFeedback(feedbackForFailure(result));
        return;
      }

      onFeedback({ tone: "success", message: "Đã xóa item khỏi bộ sưu tập." });
      setConfirmingItemId(null);
      router.replace(selectPath(null, 1));
      router.refresh();
    });
  }

  return (
    <section className="diary-surface diary-surface--ledger p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="diary-kicker">Nội dung</p>
          <h2 className="font-display mt-1 text-2xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)]">
            {itemPage.total} item
          </h2>
        </div>
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-brand)] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgb(49_5_12_/_22%)] transition hover:-translate-y-0.5 hover:bg-[var(--color-brand-strong)]"
          href={selectPath(null, 1)}
        >
          <Plus size={16} aria-hidden="true" />
          Item mới
        </Link>
      </div>

      {itemPage.items.length ? (
        <ul className="mt-4 space-y-1.5" aria-label="Danh sách item">
          {itemPage.items.map((item) => (
            <li key={item.id}>
              <Link
                aria-current={item.id === selectedItemId ? "page" : undefined}
                className={`diary-ledger-row block rounded-[var(--radius-card)] border p-3 transition ${
                  item.id === selectedItemId
                    ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] shadow-[var(--shadow-soft)]"
                    : "border-transparent hover:border-[var(--color-border)] hover:bg-[rgb(255_249_243_/_72%)]"
                }`}
                href={selectPath(item.id)}
                transitionTypes={["admin-select"]}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-brand-strong)]">{item.title}</p>
                    <p className="mt-1 flex flex-wrap gap-x-1.5 text-xs leading-5 text-[var(--color-muted)]">
                      <span>{item.isPublished ? "Đang hiển thị" : "Bản nháp"}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.kind}</span>
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${item.isPublished ? "bg-[var(--color-positive)]/10 text-[var(--color-positive)]" : "bg-[var(--color-brand-soft)] text-[var(--color-brand)]"}`}>
                    {item.isPublished ? "Live" : "Draft"}
                  </span>
                </div>
              </Link>
              {confirmingItemId === item.id ? (
                <div className="mt-2 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-3">
                  <p className="text-xs leading-5 text-[var(--color-danger)]">Xóa “{item.title}”? Thao tác này không thể hoàn tác.</p>
                  <div className="mt-2 flex gap-2">
                    <Button disabled={isPending} onClick={() => setConfirmingItemId(null)} size="compact" type="button" variant="quiet">
                      Giữ lại
                    </Button>
                    <Button disabled={isPending} onClick={() => deleteItem(item)} size="compact" type="button" variant="danger">
                      Xóa item
                    </Button>
                  </div>
                </div>
              ) : item.id === selectedItemId ? (
                <Button
                  className="mt-1 w-full justify-start px-3 text-[11px]"
                  disabled={isPending}
                  onClick={() => setConfirmingItemId(item.id)}
                  size="compact"
                  type="button"
                  variant="quiet"
                >
                  <Trash2 size={13} aria-hidden="true" />
                  Xóa item
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] px-4 py-8 text-center text-sm leading-6 text-[var(--color-muted)]">
          Chưa có item trong vùng này. Hãy bắt đầu bằng một điều thật riêng.
        </div>
      )}

      {itemPage.pageCount > 1 ? (
        <nav aria-label="Phân trang item quản trị" className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
          {itemPage.page > 1 ? (
            <Link className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-[var(--color-brand)]" href={selectPath(null, itemPage.page - 1)}>
              <ChevronLeft size={16} aria-hidden="true" />
              Trước
            </Link>
          ) : <span className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-[var(--color-muted)] opacity-45"><ChevronLeft size={16} aria-hidden="true" />Trước</span>}
          <span className="text-xs font-semibold text-[var(--color-muted)]">Trang {itemPage.page}/{itemPage.pageCount}</span>
          {itemPage.page < itemPage.pageCount ? (
            <Link className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-[var(--color-brand)]" href={selectPath(null, itemPage.page + 1)}>
              Sau
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          ) : <span className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-[var(--color-muted)] opacity-45">Sau<ChevronRight size={16} aria-hidden="true" /></span>}
        </nav>
      ) : null}
    </section>
  );
}

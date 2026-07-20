"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { ExternalLink, FolderPlus, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Failure } from "@/core/application/result";
import {
  createCatalogueCategoryAction,
  createCatalogueItemAction,
  createCatalogueItemImageAction,
  createCatalogueItemLinkAction,
  deleteCatalogueCategoryAction,
  deleteCatalogueItemAction,
} from "@/modules/catalogue/presentation/catalogue-admin-actions";
import type {
  ManagedCatalogueCategory,
  ManagedCatalogueItem,
} from "@/modules/catalogue/domain/catalogue-admin-models";
import type { CatalogueItemKind } from "@/modules/catalogue/domain/catalogue-read-models";

const inputClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[rgb(255_250_247_/_88%)] px-3 text-sm text-[var(--color-ink)] shadow-sm outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-focus)]";
const labelClassName = "block text-sm font-semibold text-[var(--color-brand-strong)]";

type Feedback = { tone: "error" | "success"; message: string } | null;

interface AdminCatalogueProps {
  categories: ManagedCatalogueCategory[];
  items: ManagedCatalogueItem[];
}

export function AdminCatalogue({ categories, items }: AdminCatalogueProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const itemCountByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item.categoryId, (counts.get(item.categoryId) ?? 0) + 1);
    }
    return counts;
  }, [items]);
  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  function runMutation(operation: () => Promise<void>) {
    startTransition(async () => {
      setFeedback(null);
      await operation();
    });
  }

  function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const name = requiredText(values, "name");

    runMutation(async () => {
      const result = await createCatalogueCategoryAction({
        slug: optionalText(values, "slug") || slugify(name),
        name,
        description: optionalText(values, "description"),
        icon: null,
        coverImageUrl: null,
        sortOrder: numberValue(values, "sortOrder", categories.length * 10 + 10),
        isActive: true,
      });

      if (!result.ok) {
        setFeedback(actionFailure(result));
        return;
      }

      form.reset();
      setFeedback({ tone: "success", message: "Đã thêm danh mục mới." });
      router.refresh();
    });
  }

  function handleCreateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const title = requiredText(values, "title");
    const imageUrl = optionalText(values, "imageUrl");
    const sourceUrl = requiredText(values, "sourceUrl");
    const sourceTitle = optionalText(values, "sourceTitle") || "Trang tham khảo";

    runMutation(async () => {
      const itemResult = await createCatalogueItemAction({
        categoryId: requiredText(values, "categoryId"),
        slug: optionalText(values, "slug") || slugify(title),
        kind: requiredText(values, "kind") as CatalogueItemKind,
        title,
        summary: optionalText(values, "summary"),
        description: optionalText(values, "description"),
        address: null,
        latitude: null,
        longitude: null,
        mapUrl: null,
        priceLabel: optionalText(values, "priceLabel"),
        externalRating: null,
        externalReviewCount: null,
        externalRatingSource: null,
        metadata: {},
        isPublished: values.get("isPublished") === "on",
      });

      if (!itemResult.ok) {
        setFeedback(actionFailure(itemResult));
        return;
      }

      const attachmentResults = await Promise.all([
        imageUrl
          ? createCatalogueItemImageAction({
              itemId: itemResult.value.id,
              imageUrl,
              altText: title,
              sortOrder: 10,
            })
          : Promise.resolve({ ok: true } as const),
        createCatalogueItemLinkAction({
          itemId: itemResult.value.id,
          type: "website",
          title: sourceTitle,
          url: sourceUrl,
          sortOrder: 10,
        }),
      ]);

      if (attachmentResults.some((result) => !result.ok)) {
        setFeedback({
          tone: "error",
          message: "Item đã được tạo, nhưng một ảnh hoặc link chưa được lưu. Hãy mở lại để bổ sung.",
        });
        router.refresh();
        return;
      }

      form.reset();
      setFeedback({ tone: "success", message: "Đã thêm item vào bộ sưu tập." });
      router.refresh();
    });
  }

  function handleDeleteItem(item: ManagedCatalogueItem) {
    if (!window.confirm(`Xóa “${item.title}”? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    runMutation(async () => {
      const result = await deleteCatalogueItemAction(item.id);
      if (!result.ok) {
        setFeedback(actionFailure(result));
        return;
      }

      setFeedback({ tone: "success", message: "Đã xóa item." });
      router.refresh();
    });
  }

  function handleDeleteCategory(category: ManagedCatalogueCategory) {
    if (!window.confirm(`Xóa danh mục “${category.name}”?`)) {
      return;
    }

    runMutation(async () => {
      const result = await deleteCatalogueCategoryAction(category.id);
      if (!result.ok) {
        setFeedback(actionFailure(result));
        return;
      }

      setFeedback({ tone: "success", message: "Đã xóa danh mục trống." });
      router.refresh();
    });
  }

  return (
    <main
      id="admin-content"
      className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20"
      tabIndex={-1}
    >
      <section className="grid gap-8 border-b border-[var(--color-border)] pb-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="diary-kicker">Owner workspace</p>
          <h1 className="font-display mt-4 max-w-2xl text-balance text-5xl font-semibold tracking-[-0.055em] text-[var(--color-brand-strong)] sm:text-6xl">
            Bổ sung những điều em sẽ yêu.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">
            Tất cả thay đổi tại đây đi qua quyền Owner và xuất hiện ở bộ sưu tập sau khi lưu.
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-4 text-sm font-semibold text-[var(--color-brand)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)]"
          href="/"
        >
          Xem bộ sưu tập
          <ExternalLink size={16} aria-hidden="true" />
        </Link>
      </section>

      {feedback ? (
        <p
          aria-live="polite"
          className={`mt-8 rounded-[var(--radius-card)] border px-4 py-3 text-sm leading-6 ${
            feedback.tone === "success"
              ? "border-[var(--color-positive)]/25 bg-[var(--color-positive)]/10 text-[var(--color-positive)]"
              : "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}

      <section className="mt-10 grid gap-7 xl:grid-cols-2" aria-label="Thêm nội dung">
        <form
          autoComplete="off"
          className="diary-wash rounded-[var(--radius-dialog)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)] sm:p-8"
          onSubmit={handleCreateCategory}
        >
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]" aria-hidden="true">
              <FolderPlus size={19} strokeWidth={1.5} />
            </span>
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]">
                Thêm danh mục
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
                Ví dụ: “Những bữa tối muốn hẹn lại”.
              </p>
            </div>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <label className={labelClassName}>
              Tên danh mục
              <input className={inputClassName} name="name" required />
            </label>
            <label className={labelClassName}>
              Slug <span className="font-normal text-[var(--color-muted)]">(tự tạo nếu để trống)</span>
              <input className={inputClassName} name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" spellCheck={false} />
            </label>
            <label className={`${labelClassName} sm:col-span-2`}>
              Mô tả <span className="font-normal text-[var(--color-muted)]">(không bắt buộc)</span>
              <textarea className={`${inputClassName} min-h-24 py-3`} name="description" />
            </label>
            <label className={labelClassName}>
              Thứ tự hiển thị
              <input className={inputClassName} defaultValue={categories.length * 10 + 10} min="0" name="sortOrder" type="number" />
            </label>
          </div>
          <Button className="mt-7" disabled={isPending} type="submit">
            <Plus size={16} aria-hidden="true" />
            {isPending ? "Đang lưu…" : "Lưu danh mục"}
          </Button>
        </form>

        <form
          autoComplete="off"
          className="rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--color-paper)] p-6 shadow-[var(--shadow-soft)] sm:p-8"
          onSubmit={handleCreateItem}
        >
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-brand)] text-white" aria-hidden="true">
              <Sparkles size={18} strokeWidth={1.5} />
            </span>
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]">
                Thêm một điều mới
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
                Link nguồn là bắt buộc; URL ảnh chỉ là tùy chọn.
              </p>
            </div>
          </div>
          {categories.length ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className={labelClassName}>
                Danh mục
                <select className={inputClassName} name="categoryId" required>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClassName}>
                Loại nội dung
                <select className={inputClassName} defaultValue="product" name="kind">
                  <option value="product">Sản phẩm</option>
                  <option value="place">Địa điểm</option>
                  <option value="experience">Trải nghiệm</option>
                  <option value="article">Bài viết</option>
                  <option value="other">Khác</option>
                </select>
              </label>
              <label className={labelClassName}>
                Tên item
                <input className={inputClassName} name="title" required />
              </label>
              <label className={labelClassName}>
                Slug <span className="font-normal text-[var(--color-muted)]">(tự tạo nếu để trống)</span>
                <input className={inputClassName} name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" spellCheck={false} />
              </label>
              <label className={`${labelClassName} sm:col-span-2`}>
                Mô tả ngắn <span className="font-normal text-[var(--color-muted)]">(không bắt buộc)</span>
                <textarea className={`${inputClassName} min-h-20 py-3`} name="summary" />
              </label>
              <label className={labelClassName}>
                Nhãn giá <span className="font-normal text-[var(--color-muted)]">(không bắt buộc)</span>
                <input className={inputClassName} name="priceLabel" placeholder="Ví dụ: Từ 1.000.000đ" />
              </label>
              <label className={labelClassName}>
                URL ảnh <span className="font-normal text-[var(--color-muted)]">(không bắt buộc)</span>
                <input className={inputClassName} name="imageUrl" placeholder="https://…" type="url" />
              </label>
              <label className={labelClassName}>
                Tên nguồn
                <input className={inputClassName} name="sourceTitle" placeholder="Ví dụ: Trang chính thức" />
              </label>
              <label className={labelClassName}>
                URL nguồn
                <input className={inputClassName} name="sourceUrl" required placeholder="https://…" type="url" />
              </label>
              <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-[var(--color-brand-strong)] sm:col-span-2">
                <input defaultChecked className="h-4 w-4 accent-[var(--color-brand)]" name="isPublished" type="checkbox" />
                Hiển thị item này ngay trong bộ sưu tập
              </label>
            </div>
          ) : (
            <p className="mt-7 rounded-[var(--radius-card)] bg-[var(--color-brand-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-brand)]">
              Hãy tạo ít nhất một danh mục trước khi thêm item.
            </p>
          )}
          <Button className="mt-7" disabled={isPending || categories.length === 0} type="submit">
            <Plus size={16} aria-hidden="true" />
            {isPending ? "Đang lưu…" : "Lưu item"}
          </Button>
        </form>
      </section>

      <section className="mt-16" aria-labelledby="admin-categories-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="diary-kicker">Cấu trúc bộ sưu tập</p>
            <h2 id="admin-categories-heading" className="font-display mt-2 text-4xl font-semibold tracking-[-0.05em] text-[var(--color-brand-strong)]">
              {categories.length} danh mục
            </h2>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const itemCount = itemCountByCategory.get(category.id) ?? 0;
            return (
              <article key={category.id} className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[rgb(255_250_247_/_74%)] p-5 shadow-[var(--shadow-soft)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-display break-words text-2xl font-semibold tracking-[-0.035em] text-[var(--color-brand-strong)]">
                      {category.name}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      {itemCount} item · {category.isActive ? "Đang hiển thị" : "Đang ẩn"}
                    </p>
                  </div>
                  <Button
                    aria-label={itemCount ? `Không thể xóa ${category.name} khi còn item` : `Xóa ${category.name}`}
                    disabled={isPending || itemCount > 0}
                    onClick={() => handleDeleteCategory(category)}
                    size="compact"
                    variant="quiet"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    Xóa
                  </Button>
                </div>
                {category.description ? (
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-muted)]">
                    {category.description}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-16" aria-labelledby="admin-items-heading">
        <p className="diary-kicker">Nội dung hiện có</p>
        <h2 id="admin-items-heading" className="font-display mt-2 text-4xl font-semibold tracking-[-0.05em] text-[var(--color-brand-strong)]">
          {items.length} item đang quản lý
        </h2>
        <div className="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-paper)] shadow-[var(--shadow-soft)]">
          <ul className="divide-y divide-[var(--color-border)]">
            {items.map((item) => (
              <li className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6" key={item.id}>
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-[var(--color-brand-strong)]">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                    {categoryNames.get(item.categoryId) ?? "Danh mục đã xóa"} · {item.isPublished ? "Đang hiển thị" : "Bản nháp"}
                  </p>
                </div>
                <Button disabled={isPending} onClick={() => handleDeleteItem(item)} size="compact" variant="danger">
                  <Trash2 size={15} aria-hidden="true" />
                  Xóa
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

function requiredText(values: FormData, name: string): string {
  const value = optionalText(values, name);
  if (!value) throw new Error(`Missing form value: ${name}`);
  return value;
}

function optionalText(values: FormData, name: string): string | null {
  const value = values.get(name);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(values: FormData, name: string, fallback: number): number {
  const rawValue = optionalText(values, name);
  return rawValue === null ? fallback : Number(rawValue);
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

function actionFailure(result: Failure): Feedback {
  const messages = {
    ACCESS_DENIED: "Tài khoản hiện tại không có quyền Owner.",
    NOT_FOUND: "Không tìm thấy nội dung cần thay đổi.",
    UNAUTHENTICATED: "Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.",
    UNEXPECTED_FAILURE: "Không thể lưu thay đổi lúc này. Hãy thử lại.",
    VALIDATION_FAILED: "Một vài thông tin chưa hợp lệ. Hãy kiểm tra lại slug và URL.",
  } as const;

  return { tone: "error", message: messages[result.error.code] };
}

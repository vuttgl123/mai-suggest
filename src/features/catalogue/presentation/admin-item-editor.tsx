"use client";

import {
  ImagePlus,
  Link2,
  PencilLine,
  Save,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import type { AdminFeedback } from "@/features/catalogue/presentation/admin-catalogue-feedback";
import { feedbackForFailure } from "@/features/catalogue/presentation/admin-catalogue-feedback";
import { createAdminCataloguePath } from "@/features/catalogue/lib/admin-catalogue-navigation";
import { ItemKeepsakeEditor } from "@/features/catalogue/presentation/item-keepsake-editor";
import type {
  CatalogueItemInput,
  ManagedCatalogueCategory,
  ManagedCatalogueItemDetail,
  ManagedItemImage,
  ManagedItemLink,
} from "@/modules/catalogue/domain/catalogue-admin-models";
import { mergeItemKeepsakes, readItemKeepsakes, type ItemKeepsake } from "@/modules/catalogue/domain/item-keepsakes";
import type {
  CatalogueItemKind,
  CatalogueLinkType,
} from "@/modules/catalogue/domain/catalogue-read-models";
import {
  createCatalogueItemAction,
  createCatalogueItemImageAction,
  createCatalogueItemLinkAction,
  deleteCatalogueItemImageAction,
  deleteCatalogueItemLinkAction,
  updateCatalogueItemAction,
  updateCatalogueItemImageAction,
  updateCatalogueItemLinkAction,
} from "@/modules/catalogue/presentation/catalogue-admin-actions";

interface AdminItemEditorProps {
  categories: ManagedCatalogueCategory[];
  defaultCategoryId: string | null;
  selectedItem: ManagedCatalogueItemDetail | null;
  onFeedback: (feedback: AdminFeedback) => void;
}

const itemKinds: Array<{ value: CatalogueItemKind; label: string }> = [
  { value: "product", label: "Sản phẩm" },
  { value: "place", label: "Địa điểm" },
  { value: "experience", label: "Trải nghiệm" },
  { value: "article", label: "Bài viết" },
  { value: "other", label: "Khác" },
];

const linkTypes: Array<{ value: CatalogueLinkType; label: string }> = [
  { value: "website", label: "Website" },
  { value: "shopping", label: "Mua sắm" },
  { value: "map", label: "Bản đồ" },
  { value: "menu", label: "Menu" },
  { value: "review", label: "Đánh giá" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "other", label: "Khác" },
];

export function AdminItemEditor({
  categories,
  defaultCategoryId,
  selectedItem,
  onFeedback,
}: AdminItemEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [keepsakes, setKeepsakes] = useState<ItemKeepsake[]>(() =>
    readItemKeepsakes(selectedItem?.metadata ?? {}),
  );
  const isEditing = selectedItem !== null;
  const defaultCategory = selectedItem?.categoryId ?? defaultCategoryId;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const input = createItemInput({
      values,
      keepsakes,
      metadata: selectedItem?.metadata ?? {},
    });

    if (!input) {
      onFeedback({
        tone: "error",
        message: "Tên item và danh mục là bắt buộc. Hãy kiểm tra lại thông tin.",
      });
      return;
    }

    startTransition(async () => {
      const result = selectedItem
        ? await updateCatalogueItemAction(selectedItem.id, input)
        : await createCatalogueItemAction(input);

      if (!result.ok) {
        onFeedback(feedbackForFailure(result));
        return;
      }

      onFeedback({
        tone: "success",
        message: isEditing
          ? "Đã lưu các thay đổi của item."
          : "Đã tạo item. Bây giờ bạn có thể thêm hình và đường dẫn.",
      });

      if (!isEditing) {
        router.push(
          createAdminCataloguePath({
            categoryId: result.value.categoryId,
            itemId: result.value.id,
            page: 1,
          }),
        );
      }
      router.refresh();
    });
  }

  return (
    <section className="rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--color-paper)] p-4 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="diary-kicker">{isEditing ? "Item đang chọn" : "Bắt đầu một điều mới"}</p>
          <h2 className="font-display mt-2 text-3xl font-semibold tracking-[-0.055em] text-[var(--color-brand-strong)]">
            {isEditing ? selectedItem.title : "Tạo item"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
            Mỗi item có thể là một món quà, điểm đến hoặc trải nghiệm cùng những điều riêng bạn muốn gửi gắm.
          </p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.11em] ${selectedItem?.isPublished ? "bg-[var(--color-positive)]/10 text-[var(--color-positive)]" : "bg-[var(--color-brand-soft)] text-[var(--color-brand)]"}`}>
          {selectedItem?.isPublished ? "Published" : "Draft"}
        </span>
      </div>

      {categories.length ? (
        <form className="mt-6" onSubmit={handleSubmit}>
          <section
            aria-labelledby="item-information-heading"
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--theme-control-surface)] p-4 sm:p-5"
          >
            <div className="flex items-center gap-2">
              <PencilLine className="text-[var(--color-accent)]" size={18} aria-hidden="true" />
              <h3 id="item-information-heading" className="font-display text-2xl font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]">
                Thông tin item
              </h3>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className={labelClassName}>
                Danh mục
                <select className={inputClassName} defaultValue={defaultCategory ?? undefined} name="categoryId" required>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
              <label className={labelClassName}>
                Loại nội dung
                <select className={inputClassName} defaultValue={selectedItem?.kind ?? "product"} name="kind">
                  {itemKinds.map((kind) => <option key={kind.value} value={kind.value}>{kind.label}</option>)}
                </select>
              </label>
              <label className={labelClassName}>
                Tên item
                <input className={inputClassName} defaultValue={selectedItem?.title ?? ""} name="title" required />
              </label>
              <label className={labelClassName}>
                Slug <span className="font-normal text-[var(--color-muted)]">(tự tạo nếu trống)</span>
                <input className={inputClassName} defaultValue={selectedItem?.slug ?? ""} name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" spellCheck={false} />
              </label>
              <label className={`${labelClassName} sm:col-span-2`}>
                Mô tả ngắn
                <textarea className={`${inputClassName} min-h-22 py-3`} defaultValue={selectedItem?.summary ?? ""} name="summary" />
              </label>
              <label className={`${labelClassName} sm:col-span-2`}>
                Mô tả chi tiết
                <textarea className={`${inputClassName} min-h-36 py-3 leading-7`} defaultValue={selectedItem?.description ?? ""} name="description" />
              </label>
              <label className={labelClassName}>
                Nhãn giá
                <input className={inputClassName} defaultValue={selectedItem?.priceLabel ?? ""} name="priceLabel" placeholder="Ví dụ: Từ 1.000.000đ" />
              </label>
              <label className={labelClassName}>
                Địa chỉ
                <input className={inputClassName} defaultValue={selectedItem?.address ?? ""} name="address" />
              </label>
              <label className={`${labelClassName} sm:col-span-2`}>
                Link bản đồ
                <input className={inputClassName} defaultValue={selectedItem?.mapUrl ?? ""} name="mapUrl" placeholder="https://…" type="url" />
              </label>
              <label className={labelClassName}>
                Vĩ độ
                <input className={inputClassName} defaultValue={selectedItem?.latitude ?? ""} name="latitude" step="any" type="number" />
              </label>
              <label className={labelClassName}>
                Kinh độ
                <input className={inputClassName} defaultValue={selectedItem?.longitude ?? ""} name="longitude" step="any" type="number" />
              </label>
              <label className={labelClassName}>
                Điểm đánh giá
                <input className={inputClassName} defaultValue={selectedItem?.externalRating ?? ""} max="5" min="0" name="externalRating" step="0.1" type="number" />
              </label>
              <label className={labelClassName}>
                Số lượt đánh giá
                <input className={inputClassName} defaultValue={selectedItem?.externalReviewCount ?? ""} min="0" name="externalReviewCount" step="1" type="number" />
              </label>
              <label className={`${labelClassName} sm:col-span-2`}>
                Nguồn đánh giá
                <input className={inputClassName} defaultValue={selectedItem?.externalRatingSource ?? ""} name="externalRatingSource" />
              </label>
              <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-[var(--color-brand-strong)] sm:col-span-2">
                <input defaultChecked={selectedItem?.isPublished ?? true} className="h-4 w-4 accent-[var(--color-brand)]" name="isPublished" type="checkbox" />
                Hiển thị item này trong bộ sưu tập công khai
              </label>
            </div>
          </section>

          <ItemKeepsakeEditor disabled={isPending} onChange={setKeepsakes} value={keepsakes} />

          <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-4 lg:sticky lg:bottom-4 lg:z-10 lg:rounded-[var(--radius-card)] lg:border lg:bg-[var(--color-paper)]/95 lg:px-4 lg:py-3 lg:shadow-[var(--shadow-soft)] lg:backdrop-blur">
            <Button disabled={isPending} type="submit">
              <Save size={16} aria-hidden="true" />
              {isPending ? "Đang lưu…" : isEditing ? "Lưu item" : "Tạo item"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-6 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] px-4 py-8 text-center text-sm leading-6 text-[var(--color-muted)]">
          Hãy tạo ít nhất một danh mục trước khi thêm item.
        </div>
      )}

      {selectedItem ? (
        <AttachmentSection item={selectedItem} onFeedback={onFeedback} />
      ) : null}
    </section>
  );
}

function AttachmentSection({
  item,
  onFeedback,
}: {
  item: ManagedCatalogueItemDetail;
  onFeedback: (feedback: AdminFeedback) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<string | null>(null);

  function runAttachmentAction(operation: () => Promise<void>) {
    startTransition(operation);
  }

  function handleCreateImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const imageUrl = textValue(values, "imageUrl");
    if (!imageUrl) return;

    runAttachmentAction(async () => {
      const result = await createCatalogueItemImageAction({
        itemId: item.id,
        imageUrl,
        altText: textValue(values, "altText"),
        sortOrder: numberValue(values, "sortOrder", item.images.length * 10 + 10),
      });
      if (!result.ok) {
        onFeedback(feedbackForFailure(result));
        return;
      }
      onFeedback({ tone: "success", message: "Đã thêm hình ảnh." });
      router.refresh();
    });
  }

  function handleCreateLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const title = textValue(values, "title");
    const url = textValue(values, "url");
    if (!title || !url) return;

    runAttachmentAction(async () => {
      const result = await createCatalogueItemLinkAction({
        itemId: item.id,
        type: values.get("type") as CatalogueLinkType,
        title,
        url,
        sortOrder: numberValue(values, "sortOrder", item.links.length * 10 + 10),
      });
      if (!result.ok) {
        onFeedback(feedbackForFailure(result));
        return;
      }
      onFeedback({ tone: "success", message: "Đã thêm đường dẫn." });
      router.refresh();
    });
  }

  function handleUpdateImage(event: FormEvent<HTMLFormElement>, image: ManagedItemImage) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const imageUrl = textValue(values, "imageUrl");
    if (!imageUrl) return;
    runAttachmentAction(async () => {
      const result = await updateCatalogueItemImageAction(image.id, {
        imageUrl,
        altText: textValue(values, "altText"),
        sortOrder: numberValue(values, "sortOrder", image.sortOrder),
      });
      if (!result.ok) {
        onFeedback(feedbackForFailure(result));
        return;
      }
      onFeedback({ tone: "success", message: "Đã cập nhật hình ảnh." });
      router.refresh();
    });
  }

  function handleUpdateLink(event: FormEvent<HTMLFormElement>, link: ManagedItemLink) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const title = textValue(values, "title");
    const url = textValue(values, "url");
    if (!title || !url) return;
    runAttachmentAction(async () => {
      const result = await updateCatalogueItemLinkAction(link.id, {
        type: values.get("type") as CatalogueLinkType,
        title,
        url,
        sortOrder: numberValue(values, "sortOrder", link.sortOrder),
      });
      if (!result.ok) {
        onFeedback(feedbackForFailure(result));
        return;
      }
      onFeedback({ tone: "success", message: "Đã cập nhật đường dẫn." });
      router.refresh();
    });
  }

  function deleteAttachment(kind: "image" | "link", id: string) {
    runAttachmentAction(async () => {
      const result = kind === "image"
        ? await deleteCatalogueItemImageAction(id)
        : await deleteCatalogueItemLinkAction(id);
      if (!result.ok) {
        onFeedback(feedbackForFailure(result));
        return;
      }
      onFeedback({ tone: "success", message: kind === "image" ? "Đã xóa hình ảnh." : "Đã xóa đường dẫn." });
      setConfirming(null);
      router.refresh();
    });
  }

  return (
    <section className="mt-9 border-t border-[var(--color-border)] pt-6" aria-labelledby="attachments-heading">
      <div className="flex items-center gap-2">
        <Link2 className="text-[var(--color-accent)]" size={18} aria-hidden="true" />
        <div>
          <p className="diary-kicker">Tư liệu item</p>
          <h3 id="attachments-heading" className="font-display mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]">Hình và đường dẫn</h3>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[rgb(255_249_243_/_62%)] p-3">
          <div className="flex items-center gap-2 text-[var(--color-brand-strong)]"><ImagePlus size={17} aria-hidden="true" /><h4 className="text-sm font-bold">Hình ảnh</h4></div>
          <div className="mt-4 space-y-3">
            {item.images.map((image) => (
              <form className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-3" key={image.id} onSubmit={(event) => handleUpdateImage(event, image)}>
                <input className={inputClassName} defaultValue={image.imageUrl} name="imageUrl" required type="url" />
                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_6rem]">
                  <input className={inputClassName} defaultValue={image.altText ?? ""} name="altText" placeholder="Mô tả ảnh" />
                  <input className={inputClassName} defaultValue={image.sortOrder} min="0" name="sortOrder" type="number" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button disabled={isPending} size="compact" type="submit" variant="secondary">Lưu ảnh</Button>
                  <Button disabled={isPending} onClick={() => setConfirming(`image:${image.id}`)} size="compact" type="button" variant="quiet"><Trash2 size={14} aria-hidden="true" />Xóa</Button>
                  {confirming === `image:${image.id}` ? <Button disabled={isPending} onClick={() => deleteAttachment("image", image.id)} size="compact" type="button" variant="danger">Xác nhận xóa</Button> : null}
                </div>
              </form>
            ))}
          </div>
          <form className="mt-4 border-t border-[var(--color-border)] pt-4" onSubmit={handleCreateImage}>
            <input className={inputClassName} name="imageUrl" placeholder="URL hình ảnh https://…" required type="url" />
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_6rem]">
              <input className={inputClassName} name="altText" placeholder="Mô tả ảnh" />
              <input className={inputClassName} defaultValue={item.images.length * 10 + 10} min="0" name="sortOrder" type="number" />
            </div>
            <Button className="mt-3" disabled={isPending} size="compact" type="submit" variant="secondary"><ImagePlus size={15} aria-hidden="true" />Thêm ảnh</Button>
          </form>
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[rgb(255_249_243_/_62%)] p-3">
          <div className="flex items-center gap-2 text-[var(--color-brand-strong)]"><Link2 size={17} aria-hidden="true" /><h4 className="text-sm font-bold">Đường dẫn</h4></div>
          <div className="mt-4 space-y-3">
            {item.links.map((link) => (
              <form className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-3" key={link.id} onSubmit={(event) => handleUpdateLink(event, link)}>
                <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
                  <select className={inputClassName} defaultValue={link.type} name="type">{linkTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select>
                  <input className={inputClassName} defaultValue={link.title} name="title" required />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_6rem]">
                  <input className={inputClassName} defaultValue={link.url} name="url" required type="url" />
                  <input className={inputClassName} defaultValue={link.sortOrder} min="0" name="sortOrder" type="number" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button disabled={isPending} size="compact" type="submit" variant="secondary">Lưu link</Button>
                  <Button disabled={isPending} onClick={() => setConfirming(`link:${link.id}`)} size="compact" type="button" variant="quiet"><Trash2 size={14} aria-hidden="true" />Xóa</Button>
                  {confirming === `link:${link.id}` ? <Button disabled={isPending} onClick={() => deleteAttachment("link", link.id)} size="compact" type="button" variant="danger">Xác nhận xóa</Button> : null}
                </div>
              </form>
            ))}
          </div>
          <form className="mt-4 border-t border-[var(--color-border)] pt-4" onSubmit={handleCreateLink}>
            <div className="grid gap-3 sm:grid-cols-[8rem_1fr]"><select className={inputClassName} defaultValue="website" name="type">{linkTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select><input className={inputClassName} name="title" placeholder="Tên đường dẫn" required /></div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_6rem]"><input className={inputClassName} name="url" placeholder="https://…" required type="url" /><input className={inputClassName} defaultValue={item.links.length * 10 + 10} min="0" name="sortOrder" type="number" /></div>
            <Button className="mt-3" disabled={isPending} size="compact" type="submit" variant="secondary"><Link2 size={15} aria-hidden="true" />Thêm link</Button>
          </form>
        </div>
      </div>
    </section>
  );
}

function createItemInput({
  values,
  keepsakes,
  metadata,
}: {
  values: FormData;
  keepsakes: ItemKeepsake[];
  metadata: ManagedCatalogueItemDetail["metadata"];
}): CatalogueItemInput | null {
  const title = textValue(values, "title");
  const categoryId = textValue(values, "categoryId");
  if (!title || !categoryId) return null;

  return {
    categoryId,
    slug: textValue(values, "slug") ?? slugify(title),
    kind: values.get("kind") as CatalogueItemKind,
    title,
    summary: textValue(values, "summary"),
    description: textValue(values, "description"),
    address: textValue(values, "address"),
    latitude: optionalNumber(values, "latitude"),
    longitude: optionalNumber(values, "longitude"),
    mapUrl: textValue(values, "mapUrl"),
    priceLabel: textValue(values, "priceLabel"),
    externalRating: optionalNumber(values, "externalRating"),
    externalReviewCount: optionalNumber(values, "externalReviewCount"),
    externalRatingSource: textValue(values, "externalRatingSource"),
    metadata: mergeItemKeepsakes(metadata, keepsakes),
    isPublished: values.get("isPublished") === "on",
  };
}

function textValue(values: FormData, name: string): string | null {
  const value = values.get(name);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalNumber(values: FormData, name: string): number | null {
  const value = textValue(values, name);
  return value === null ? null : Number(value);
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
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 text-sm text-[var(--color-ink)] shadow-sm outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-focus)]";
const labelClassName = "block text-sm font-semibold text-[var(--color-brand-strong)]";

"use client";

import { BookHeart, Check, ImagePlus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { createAdminTimelinePath } from "@/features/timeline/lib/timeline-navigation";
import type {
  ManagedTimelineEntry,
  TimelineEntryInput,
} from "@/modules/timeline/domain/timeline-models";
import {
  createTimelineEntryAction,
  deleteTimelineEntryAction,
  deleteTimelineResponseAction,
  updateTimelineEntryAction,
} from "@/modules/timeline/presentation/timeline-actions";

interface AdminTimelineEditorProps {
  selectedEntry: ManagedTimelineEntry | null;
  onFeedback: (message: string) => void;
}

export function AdminTimelineEditor({
  selectedEntry,
  onFeedback,
}: AdminTimelineEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingResponseId, setConfirmingResponseId] = useState<string | null>(null);
  const isEditing = selectedEntry !== null;

  function submitEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = createEntryInput(new FormData(event.currentTarget));
    if (!input) {
      onFeedback("Hãy điền nhãn thời điểm, tiêu đề và câu chuyện trước khi lưu.");
      return;
    }

    startTransition(async () => {
      const result = selectedEntry
        ? await updateTimelineEntryAction(selectedEntry.id, input)
        : await createTimelineEntryAction(input);

      if (!result.ok) {
        onFeedback(feedbackFor(result.error.code));
        return;
      }

      onFeedback(selectedEntry ? "Đã lưu mốc hành trình." : "Đã tạo mốc hành trình mới.");
      router.push(createAdminTimelinePath({ entryId: result.value.id }));
      router.refresh();
    });
  }

  function deleteEntry() {
    if (!selectedEntry) return;

    startTransition(async () => {
      const result = await deleteTimelineEntryAction(selectedEntry.id);
      if (!result.ok) {
        onFeedback(feedbackFor(result.error.code));
        return;
      }

      onFeedback("Đã xóa mốc và các hồi đáp liên quan.");
      router.push(createAdminTimelinePath({ entryId: null }));
      router.refresh();
    });
  }

  function deleteResponse(responseId: string) {
    startTransition(async () => {
      const result = await deleteTimelineResponseAction(responseId);
      if (!result.ok) {
        onFeedback(feedbackFor(result.error.code));
        return;
      }

      setConfirmingResponseId(null);
      onFeedback("Đã gỡ hồi đáp khỏi mốc này.");
      router.refresh();
    });
  }

  return (
    <section className="rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--color-paper)] p-4 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="diary-kicker">{isEditing ? "Mốc đang chọn" : "Một chương mới"}</p>
          <h2 className="font-display mt-2 text-3xl font-semibold tracking-[-0.055em] text-[var(--color-brand-strong)]">
            {selectedEntry?.title ?? "Viết mốc đầu tiên"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
            Hãy kể về điều đã xảy ra, điều mình cảm nhận, và một điều cả hai đã cùng học được.
          </p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.11em] ${selectedEntry?.isPublished ? "bg-[var(--color-positive)]/10 text-[var(--color-positive)]" : "bg-[var(--color-brand-soft)] text-[var(--color-brand)]"}`}>
          {selectedEntry?.isPublished ? "Published" : "Draft"}
        </span>
      </div>

      <form className="mt-6" onSubmit={submitEntry}>
        <section
          aria-labelledby="timeline-story-heading"
          className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--theme-control-surface)] p-4 sm:p-5"
        >
          <div className="flex items-center gap-2">
            <BookHeart className="text-[var(--color-accent)]" size={18} aria-hidden="true" />
            <h3 id="timeline-story-heading" className="font-display text-2xl font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]">Thời điểm và câu chuyện</h3>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className={labelClassName}>Nhãn thời điểm<input className={inputClassName} defaultValue={selectedEntry?.dateLabel ?? ""} maxLength={80} name="dateLabel" placeholder="Ví dụ: Mùa thu 2024" required /></label>
            <label className={labelClassName}>Ngày chính xác <span className="font-normal text-[var(--color-muted)]">(không bắt buộc)</span><input className={inputClassName} defaultValue={selectedEntry?.occurredOn ?? ""} name="occurredOn" type="date" /></label>
            <label className={`${labelClassName} sm:col-span-2`}>Tiêu đề<input className={inputClassName} defaultValue={selectedEntry?.title ?? ""} maxLength={160} name="title" required /></label>
            <label className={`${labelClassName} sm:col-span-2`}>Câu chuyện<textarea className={`${inputClassName} min-h-48`} defaultValue={selectedEntry?.story ?? ""} maxLength={8000} name="story" required /></label>
            <label className={`${labelClassName} sm:col-span-2`}>Điều mình đã học được <span className="font-normal text-[var(--color-muted)]">(không bắt buộc)</span><textarea className={`${inputClassName} min-h-28`} defaultValue={selectedEntry?.lesson ?? ""} maxLength={1000} name="lesson" /></label>
          </div>
        </section>

        <section className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[rgb(255_249_243_/_62%)] p-4 sm:p-5" aria-labelledby="timeline-image-heading">
          <div className="flex items-center gap-2"><ImagePlus className="text-[var(--color-accent)]" size={18} aria-hidden="true" /><h3 id="timeline-image-heading" className="font-display text-2xl font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]">Ảnh và hiển thị</h3></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className={`${labelClassName} sm:col-span-2`}>URL hình ảnh <span className="font-normal text-[var(--color-muted)]">(không bắt buộc)</span><input className={inputClassName} defaultValue={selectedEntry?.imageUrl ?? ""} name="imageUrl" placeholder="https://…" type="url" /></label>
            <label className={`${labelClassName} sm:col-span-2`}>Mô tả ảnh <span className="font-normal text-[var(--color-muted)]">(bắt buộc khi có ảnh)</span><input className={inputClassName} defaultValue={selectedEntry?.imageAltText ?? ""} maxLength={280} name="imageAltText" /></label>
            <label className={labelClassName}>Thứ tự kể chuyện<input className={inputClassName} defaultValue={selectedEntry?.sortOrder ?? 0} min="0" name="sortOrder" type="number" /></label>
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-[var(--color-brand-strong)] sm:mt-7"><input defaultChecked={selectedEntry?.isPublished ?? false} className="h-4 w-4 accent-[var(--color-brand)]" name="isPublished" type="checkbox" />Công khai mốc này</label>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-4 lg:sticky lg:bottom-4 lg:z-10 lg:rounded-[var(--radius-card)] lg:border lg:bg-[var(--color-paper)]/95 lg:px-4 lg:py-3 lg:shadow-[var(--shadow-soft)] lg:backdrop-blur">
          <Button disabled={isPending} type="submit"><Save size={16} aria-hidden="true" />{isPending ? "Đang lưu…" : isEditing ? "Lưu mốc" : "Tạo mốc"}</Button>
          {selectedEntry ? <Button disabled={isPending} onClick={() => setConfirmingDelete(true)} type="button" variant="quiet"><Trash2 size={15} aria-hidden="true" />Xóa mốc</Button> : null}
        </div>
      </form>

      {confirmingDelete ? <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3"><p className="text-sm leading-6 text-[var(--color-danger)]">Xóa mốc này và toàn bộ hồi đáp liên quan?</p><span className="flex gap-2"><Button disabled={isPending} onClick={() => setConfirmingDelete(false)} size="compact" type="button" variant="quiet">Giữ lại</Button><Button disabled={isPending} onClick={deleteEntry} size="compact" type="button" variant="danger">Xác nhận xóa</Button></span></div> : null}

      {selectedEntry ? <ResponseModeration entry={selectedEntry} confirmingResponseId={confirmingResponseId} disabled={isPending} onConfirm={setConfirmingResponseId} onDelete={deleteResponse} /> : null}
    </section>
  );
}

function ResponseModeration({ entry, confirmingResponseId, disabled, onConfirm, onDelete }: { entry: ManagedTimelineEntry; confirmingResponseId: string | null; disabled: boolean; onConfirm: (responseId: string | null) => void; onDelete: (responseId: string) => void }) {
  return <section className="mt-9 border-t border-[var(--color-border)] pt-6" aria-labelledby="timeline-responses-heading"><div className="flex items-center gap-2"><Check className="text-[var(--color-accent)]" size={18} aria-hidden="true" /><div><p className="diary-kicker">Góc hồi đáp</p><h3 id="timeline-responses-heading" className="font-display mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]">Những điều đã được gửi lại</h3></div></div>{entry.responses.length ? <ol className="mt-5 space-y-3">{entry.responses.map((response) => <li className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[rgb(255_249_243_/_65%)] p-4" key={response.id}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-[var(--color-brand-strong)]">{response.author.displayName}</p><p className="mt-1 whitespace-pre-line text-sm leading-7 text-[var(--color-ink)]">{response.content}</p></div><Button disabled={disabled} onClick={() => onConfirm(response.id)} size="icon" type="button" variant="quiet"><Trash2 size={15} aria-hidden="true" /><span className="sr-only">Gỡ hồi đáp</span></Button></div>{confirmingResponseId === response.id ? <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2.5"><p className="text-xs leading-5 text-[var(--color-danger)]">Gỡ hồi đáp này khỏi mốc?</p><span className="flex gap-2"><Button disabled={disabled} onClick={() => onConfirm(null)} size="compact" type="button" variant="quiet">Hủy</Button><Button disabled={disabled} onClick={() => onDelete(response.id)} size="compact" type="button" variant="danger">Gỡ</Button></span></div> : null}</li>)}</ol> : <p className="mt-5 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] px-4 py-6 text-sm leading-6 text-[var(--color-muted)]">Mốc này chưa có hồi đáp nào.</p>}</section>;
}

function createEntryInput(values: FormData): TimelineEntryInput | null {
  const dateLabel = textValue(values, "dateLabel");
  const title = textValue(values, "title");
  const story = textValue(values, "story");
  if (!dateLabel || !title || !story) return null;
  return { dateLabel, occurredOn: textValue(values, "occurredOn"), title, story, lesson: textValue(values, "lesson"), imageUrl: textValue(values, "imageUrl"), imageAltText: textValue(values, "imageAltText"), sortOrder: numberValue(values, "sortOrder", 0), isPublished: values.get("isPublished") === "on" };
}

function textValue(values: FormData, name: string): string | null {
  const value = values.get(name);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(values: FormData, name: string, fallback: number): number {
  const value = textValue(values, name);
  return value === null ? fallback : Number(value);
}

function feedbackFor(code: string): string {
  if (code === "ACCESS_DENIED") return "Bạn không có quyền quản lý hành trình.";
  if (code === "NOT_FOUND") return "Nội dung này không còn tồn tại.";
  if (code === "VALIDATION_FAILED") return "Hãy kiểm tra lại nội dung, ngày tháng, ảnh và thứ tự.";
  return "Không thể lưu thay đổi lúc này. Hãy thử lại sau.";
}

const inputClassName = "mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] px-3 py-2 text-sm leading-7 text-[var(--color-ink)] shadow-sm outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-focus)]";
const labelClassName = "block text-sm font-semibold text-[var(--color-brand-strong)]";

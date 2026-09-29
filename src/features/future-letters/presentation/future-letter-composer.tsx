"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  formatFutureLetterOpening,
  toVietnamDateTimeParts,
  toVietnamScheduledInstant,
} from "@/modules/future-letters/domain/future-letter-time";
import type {
  FutureLetterInput,
  FutureLetterRecord,
} from "@/modules/future-letters/domain/future-letter-models";
import {
  createFutureLetterAction,
  updateFutureLetterAction,
} from "@/modules/future-letters/presentation/future-letter-actions";

interface FutureLetterComposerProps {
  isOpen: boolean;
  letter: FutureLetterRecord | null;
  onClose: () => void;
}

interface FutureLetterDraft {
  title: string;
  content: string;
  date: string;
  time: string;
  imageUrl: string;
  imageAltText: string;
  musicUrl: string;
}

export function FutureLetterComposer({
  isOpen,
  letter,
  onClose,
}: FutureLetterComposerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<FutureLetterDraft>(() => createDraft(letter));
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(createDraft(letter));
      setFeedback(null);
      if (!dialog.open) dialog.showModal();
      return;
    }

    if (dialog.open) dialog.close();
  }, [isOpen, letter]);

  function handleCancel(event: React.SyntheticEvent) {
    const isDirty = JSON.stringify(draft) !== JSON.stringify(createDraft(letter));
    if (isDirty && !window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn thoát?')) {
      event.preventDefault();
      return;
    }
    onClose();
  }

  function updateDraft(patch: Partial<FutureLetterDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function submit() {
    const opensAt = toVietnamScheduledInstant(draft.date, draft.time);
    if (!opensAt) {
      setFeedback("Hãy chọn một ngày giờ hợp lệ theo giờ Việt Nam.");
      return;
    }

    const input: FutureLetterInput = {
      title: draft.title,
      content: draft.content,
      opensAt,
      imageUrl: draft.imageUrl || null,
      imageAltText: draft.imageAltText || null,
      musicUrl: draft.musicUrl || null,
    };

    startTransition(async () => {
      const result = letter
        ? await updateFutureLetterAction(letter.id, input)
        : await createFutureLetterAction(input);

      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }

      dialogRef.current?.close();
      router.refresh();
    });
  }

  const scheduledInstant = toVietnamScheduledInstant(draft.date, draft.time);

  return (
    <dialog
      onCancel={handleCancel}
      aria-labelledby="future-letter-composer-title"
      className="future-letter-dialog"
      onClose={onClose}
      ref={dialogRef}
    >
      <form
        className="future-letter-composer"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <header className="future-letter-composer-header">
          <h2 id="future-letter-composer-title" className="font-display heading-text text-brand-strong">
            {letter ? "Sửa lá thư đang hẹn" : "Viết một lá thư"}
          </h2>
          <Button aria-label="Đóng" disabled={isPending} onClick={handleCancel} size="icon" type="button" variant="quiet">
            <X size={18} aria-hidden="true" />
          </Button>
        </header>

        <div className="future-letter-composer-body">
          <label className="future-letter-field">
            <span>Tiêu đề</span>
            <input
              autoComplete="off"
              className={inputClassName}
              disabled={isPending}
              maxLength={160}
              name="future-letter-title"
              onChange={(event) => updateDraft({ title: event.target.value })}
              placeholder="Ví dụ: Mở vào một chiều thật dịu"
              required
              value={draft.title}
            />
            <small className="tabular">{draft.title.length}/160</small>
          </label>

          <label className="future-letter-field mt-5">
            <span>Lá thư</span>
            <textarea
              autoComplete="off"
              className={`${inputClassName} font-prose min-h-[18rem] py-3 text-[1.125rem] leading-[1.75]`}
              disabled={isPending}
              maxLength={8000}
              name="future-letter-content"
              onChange={(event) => updateDraft({ content: event.target.value })}
              placeholder="Viết điều bạn muốn gửi đến ngày ấy…"
              required
              value={draft.content}
            />
            <small className="tabular">{draft.content.length}/8000</small>
          </label>

          <fieldset className="mt-7">
            <legend className="text-[0.9375rem] font-semibold text-ink">Thời điểm mở thư</legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
              <label className="future-letter-field">
                <span>Ngày</span>
                <input
                  className={inputClassName}
                  disabled={isPending}
                  name="future-letter-open-date"
                  onChange={(event) => updateDraft({ date: event.target.value })}
                  required
                  type="date"
                  value={draft.date}
                />
              </label>
              <label className="future-letter-field">
                <span>Giờ</span>
                <input
                  className={inputClassName}
                  disabled={isPending}
                  name="future-letter-open-time"
                  onChange={(event) => updateDraft({ time: event.target.value })}
                  required
                  type="time"
                  value={draft.time}
                />
              </label>
              <p className="flex min-h-11 items-center text-sm font-medium text-muted">Giờ Việt Nam (GMT+7)</p>
            </div>
            <p aria-live="polite" className="tabular mt-3 text-[0.9375rem] text-ink">
              {scheduledInstant
                ? `Thư sẽ ${formatFutureLetterOpening(scheduledInstant, { withTimeZone: true }).replace("Mở", "mở")}.`
                : "Chọn ngày và giờ để xem thời điểm thư mở."}
            </p>
          </fieldset>

          <details className="mt-7 rounded-[var(--radius-card)] border border-border">
            <summary className="flex min-h-12 cursor-pointer items-center px-4 text-[0.9375rem] font-semibold text-ink">
              Ảnh và bài hát đi kèm <span className="ml-1.5 font-normal text-muted">(không bắt buộc)</span>
            </summary>
            <div className="grid gap-4 border-t border-border p-4">
              <label className="future-letter-field">
                <span>Đường dẫn ảnh</span>
                <input
                  autoComplete="url"
                  className={inputClassName}
                  disabled={isPending}
                  inputMode="url"
                  name="future-letter-image-url"
                  onChange={(event) => updateDraft({ imageUrl: event.target.value })}
                  placeholder="https://…"
                  type="url"
                  value={draft.imageUrl}
                />
              </label>
              <label className="future-letter-field">
                <span>Mô tả ảnh{draft.imageUrl.trim() ? " (bắt buộc khi có ảnh)" : ""}</span>
                <input
                  autoComplete="off"
                  className={inputClassName}
                  disabled={isPending}
                  maxLength={280}
                  name="future-letter-image-alt"
                  onChange={(event) => updateDraft({ imageAltText: event.target.value })}
                  placeholder="Mô tả ngắn cho người không xem được ảnh"
                  required={Boolean(draft.imageUrl.trim())}
                  value={draft.imageAltText}
                />
              </label>
              <label className="future-letter-field">
                <span>Liên kết bài hát</span>
                <input
                  autoComplete="url"
                  className={inputClassName}
                  disabled={isPending}
                  inputMode="url"
                  name="future-letter-music-url"
                  onChange={(event) => updateDraft({ musicUrl: event.target.value })}
                  placeholder="https://…"
                  type="url"
                  value={draft.musicUrl}
                />
              </label>
            </div>
          </details>

          {feedback ? <p aria-live="polite" className="mt-4 text-sm text-danger" role="alert">{feedback}</p> : null}
        </div>

        <footer className="future-letter-composer-footer">
          <p className="text-sm text-muted">
            Đến giờ hẹn, thư sẽ xuất hiện trong hòm thư chung và không thể chỉnh sửa hoặc xóa bởi người viết.
          </p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button disabled={isPending} onClick={handleCancel} type="button" variant="quiet">
              Hủy
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Đang lưu…" : letter ? "Lưu thay đổi" : "Hẹn ngày mở"}
            </Button>
          </div>
        </footer>
      </form>
    </dialog>
  );
}

function createDraft(letter: FutureLetterRecord | null): FutureLetterDraft {
  const dateTime = letter ? toVietnamDateTimeParts(letter.opensAt) : null;

  return {
    title: letter?.title ?? "",
    content: letter?.content ?? "",
    date: dateTime?.date ?? "",
    time: dateTime?.time ?? "",
    imageUrl: letter?.imageUrl ?? "",
    imageAltText: letter?.imageAltText ?? "",
    musicUrl: letter?.musicUrl ?? "",
  };
}

function feedbackFor(code: string): string {
  if (code === "UNAUTHENTICATED") return "Phiên đăng nhập đã hết. Hãy đăng nhập lại.";
  if (code === "ACCESS_DENIED") return "Bạn chưa có quyền đặt lá thư này.";
  if (code === "NOT_FOUND") return "Lá thư không còn có thể chỉnh sửa.";
  if (code === "VALIDATION_FAILED") return "Hãy kiểm tra nội dung, ngày giờ và các đường dẫn đã nhập.";
  return "Chưa thể lưu lá thư lúc này. Hãy thử lại sau.";
}

const inputClassName =
  "mt-1.5 min-h-11 w-full rounded-[var(--radius-card)] border border-border-input bg-paper px-3.5 text-base text-ink outline-none placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-60";

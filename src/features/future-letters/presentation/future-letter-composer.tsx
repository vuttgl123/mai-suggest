"use client";

import { Check, Clock3, MailPlus, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
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
  const [draft, setDraft] = useState<FutureLetterDraft>(() => createDraft(null));
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      setDraft(createDraft(letter));
      setFeedback(null);
      if (!dialog.open) dialog.showModal();
      return;
    }

    if (dialog.open) dialog.close();
  }, [isOpen, letter]);

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

  return (
    <dialog
      aria-labelledby="future-letter-composer-title"
      className="future-letter-dialog w-[min(100%_-_1.5rem,44rem)] rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--color-paper)] p-0 text-[var(--color-ink)] shadow-[var(--shadow-card)]"
      onClose={onClose}
      ref={dialogRef}
    >
      <form
        className="max-h-[min(46rem,calc(100vh_-_1.5rem))] overflow-y-auto p-5 sm:p-7"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="diary-kicker">Một điều để ngày mai mở ra</p>
            <h2 id="future-letter-composer-title" className="font-display mt-2 text-3xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)]">
              {letter ? "Sửa lá thư đang hẹn" : "Hẹn một lá thư"}
            </h2>
          </div>
          <Button aria-label="Đóng" disabled={isPending} onClick={() => dialogRef.current?.close()} size="icon" type="button" variant="quiet">
            <X size={18} aria-hidden="true" />
          </Button>
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
          Trước giờ hẹn chỉ mình bạn nhìn thấy lá thư này. Khi đến giờ, nó sẽ mở
          ra với tất cả thành viên đang hoạt động.
        </p>

        <div className="mt-6 grid gap-4">
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
            <small>{draft.title.length}/160</small>
          </label>

          <label className="future-letter-field">
            <span>Lá thư</span>
            <textarea
              autoComplete="off"
              className={`${inputClassName} min-h-48 py-3 leading-7`}
              disabled={isPending}
              maxLength={8000}
              name="future-letter-content"
              onChange={(event) => updateDraft({ content: event.target.value })}
              placeholder="Viết điều bạn muốn giữ lại cho một ngày mai…"
              required
              value={draft.content}
            />
            <small>{draft.content.length}/8000</small>
          </label>

          <fieldset className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[rgb(101_12_28_/_4%)] p-4">
            <legend className="px-1 text-sm font-semibold text-[var(--color-brand-strong)]">Thời điểm mở thư</legend>
            <p className="mt-1 flex items-center gap-2 text-xs leading-5 text-[var(--color-muted)]">
              <Clock3 size={14} aria-hidden="true" />
              Theo giờ Việt Nam (GMT+7).
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="future-letter-field">
                <span>Ngày mở</span>
                <input
                  autoComplete="off"
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
                <span>Giờ mở</span>
                <input
                  autoComplete="off"
                  className={inputClassName}
                  disabled={isPending}
                  name="future-letter-open-time"
                  onChange={(event) => updateDraft({ time: event.target.value })}
                  required
                  type="time"
                  value={draft.time}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-4">
            <legend className="px-1 text-sm font-semibold text-[var(--color-brand-strong)]">Điều đi cùng lá thư <span className="font-normal text-[var(--color-muted)]">(không bắt buộc)</span></legend>
            <div className="mt-3 grid gap-3">
              <label className="future-letter-field">
                <span>Ảnh minh họa</span>
                <input autoComplete="url" className={inputClassName} disabled={isPending} inputMode="url" name="future-letter-image-url" onChange={(event) => updateDraft({ imageUrl: event.target.value })} placeholder="https://…" type="url" value={draft.imageUrl} />
              </label>
              <label className="future-letter-field">
                <span>Mô tả ảnh</span>
                <input autoComplete="off" className={inputClassName} disabled={isPending} maxLength={280} name="future-letter-image-alt" onChange={(event) => updateDraft({ imageAltText: event.target.value })} placeholder="Mô tả ngắn cho ảnh" required={Boolean(draft.imageUrl.trim())} value={draft.imageAltText} />
              </label>
              <label className="future-letter-field">
                <span>Bài hát</span>
                <input autoComplete="url" className={inputClassName} disabled={isPending} inputMode="url" name="future-letter-music-url" onChange={(event) => updateDraft({ musicUrl: event.target.value })} placeholder="https://…" type="url" value={draft.musicUrl} />
              </label>
            </div>
          </fieldset>
        </div>

        {feedback ? <p aria-live="polite" className="mt-4 text-sm leading-6 text-[var(--color-danger)]">{feedback}</p> : null}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-[var(--color-border)] pt-5">
          <Button disabled={isPending} onClick={() => dialogRef.current?.close()} type="button" variant="quiet">
            Hủy
          </Button>
          <Button disabled={isPending} type="submit">
            {letter ? <Check size={16} aria-hidden="true" /> : <MailPlus size={16} aria-hidden="true" />}
            {isPending ? "Đang lưu…" : letter ? "Lưu thay đổi" : "Niêm phong lá thư"}
          </Button>
        </div>
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
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-white/70 px-3 text-sm text-[var(--color-ink)] shadow-sm outline-none placeholder:text-[var(--color-muted)] focus:border-[var(--color-focus)] disabled:bg-[var(--color-surface)]";

"use client";

import { Clock3, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatFutureLetterDateTime } from "@/modules/future-letters/domain/future-letter-time";
import type { FutureLetterRecord } from "@/modules/future-letters/domain/future-letter-models";
import { deleteFutureLetterAction } from "@/modules/future-letters/presentation/future-letter-actions";

interface ScheduledLetterListProps {
  letters: FutureLetterRecord[];
  onEdit: (letter: FutureLetterRecord) => void;
}

export function ScheduledLetterList({ letters, onEdit }: ScheduledLetterListProps) {
  const router = useRouter();
  const [now, setNow] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmingLetterId, setConfirmingLetterId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [featuredLetter, ...sealedLetters] = letters;

  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const nextOpenAt = Math.min(
      ...letters.map((letter) => new Date(letter.opensAt).getTime()),
    );
    if (!Number.isFinite(nextOpenAt)) return;

    const delay = Math.max(nextOpenAt - Date.now() + 100, 0);
    const timeout = window.setTimeout(() => router.refresh(), delay);
    return () => window.clearTimeout(timeout);
  }, [letters, router]);

  function deleteLetter(letterId: string) {
    startTransition(async () => {
      const result = await deleteFutureLetterAction(letterId);
      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }

      setConfirmingLetterId(null);
      setFeedback("Đã hủy lá thư đang hẹn.");
      router.refresh();
    });
  }

  return (
    <section aria-labelledby="scheduled-letters-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="diary-kicker">Bàn niêm phong</p>
          <h2 id="scheduled-letters-heading" className="font-display mt-2 text-3xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)]">
            Những lá thư đang hẹn.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
            Bạn vẫn có thể sửa hoặc hủy trước giờ mở. Khi lá thư đã mở, nội dung
            sẽ được giữ nguyên như khoảnh khắc bạn đã gửi đi.
          </p>
        </div>
        <span className="rounded-full bg-[var(--color-paper)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-brand)] shadow-sm">
          {letters.length} đang chờ
        </span>
      </div>

      {featuredLetter ? (
        <ol className="mt-6">
          <ScheduledLetterCard
            isConfirming={confirmingLetterId === featuredLetter.id}
            isPending={isPending}
            letter={featuredLetter}
            now={now}
            onCancelDelete={() => setConfirmingLetterId(null)}
            onDelete={() => deleteLetter(featuredLetter.id)}
            onEdit={onEdit}
            onRequestDelete={() => setConfirmingLetterId(featuredLetter.id)}
            variant="featured"
          />
        </ol>
      ) : null}

      {sealedLetters.length ? (
        <div className="mt-7 border-t border-[var(--color-border)] pt-6">
          <p className="diary-kicker">Đang chờ đúng ngày</p>
          <ol className="mt-4 grid gap-3 md:grid-cols-2">
            {sealedLetters.map((letter) => (
              <ScheduledLetterCard
                isConfirming={confirmingLetterId === letter.id}
                isPending={isPending}
                key={letter.id}
                letter={letter}
                now={now}
                onCancelDelete={() => setConfirmingLetterId(null)}
                onDelete={() => deleteLetter(letter.id)}
                onEdit={onEdit}
                onRequestDelete={() => setConfirmingLetterId(letter.id)}
                variant="sealed"
              />
            ))}
          </ol>
        </div>
      ) : null}

      {feedback ? <p aria-live="polite" className="mt-3 text-sm leading-6 text-[var(--color-brand)]">{feedback}</p> : null}
    </section>
  );
}

interface ScheduledLetterCardProps {
  isConfirming: boolean;
  isPending: boolean;
  letter: FutureLetterRecord;
  now: number | null;
  onCancelDelete: () => void;
  onDelete: () => void;
  onEdit: (letter: FutureLetterRecord) => void;
  onRequestDelete: () => void;
  variant: "featured" | "sealed";
}

function ScheduledLetterCard({
  isConfirming,
  isPending,
  letter,
  now,
  onCancelDelete,
  onDelete,
  onEdit,
  onRequestDelete,
  variant,
}: ScheduledLetterCardProps) {
  const isFeatured = variant === "featured";

  return (
    <li
      className={
        isFeatured
          ? "relative overflow-hidden rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--theme-card-surface)] p-5 shadow-[var(--shadow-card)] sm:p-6"
          : "rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-paper)] p-4 shadow-[var(--shadow-soft)]"
      }
    >
      {isFeatured ? (
        <span
          className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-[var(--color-brand-soft)] opacity-60 blur-3xl"
          aria-hidden="true"
        />
      ) : null}
      <div className={`relative flex items-start justify-between gap-3 ${isFeatured ? "pr-14" : ""}`}>
        <div className="min-w-0">
          <p className="diary-kicker">
            {isFeatured ? "Sắp đến giờ hẹn" : "Đã niêm phong"}
          </p>
          <h3
            className={
              isFeatured
                ? "font-display mt-3 break-words text-3xl font-semibold tracking-[-0.05em] text-[var(--color-brand-strong)]"
                : "mt-2 break-words text-base font-bold text-[var(--color-brand-strong)]"
            }
          >
            {letter.title}
          </h3>
        </div>
        <span
          className={
            isFeatured
              ? "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--theme-badge-border)] bg-[var(--color-paper)] text-[var(--color-accent)] shadow-[var(--shadow-soft)]"
              : "text-[var(--color-accent)]"
          }
          aria-hidden="true"
        >
          <Clock3 size={isFeatured ? 19 : 18} strokeWidth={1.45} />
        </span>
      </div>
      <time
        className={`relative mt-4 block font-semibold leading-6 text-[var(--color-brand)] ${
          isFeatured ? "text-base" : "text-sm"
        }`}
        dateTime={letter.opensAt}
      >
        {formatFutureLetterDateTime(letter.opensAt)}
      </time>
      <p className="relative mt-1 text-xs leading-5 text-[var(--color-muted)]">
        {formatCountdown(letter.opensAt, now)}
      </p>
      <div className="relative mt-4 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-3">
        <Button disabled={isPending} onClick={() => onEdit(letter)} size="compact" type="button" variant="quiet">
          <Pencil size={14} aria-hidden="true" />
          Sửa
        </Button>
        <Button disabled={isPending} onClick={onRequestDelete} size="compact" type="button" variant="quiet">
          <Trash2 size={14} aria-hidden="true" />
          Hủy lịch
        </Button>
      </div>
      {isConfirming ? (
        <div className="relative mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2.5">
          <p className="text-xs leading-5 text-[var(--color-danger)]">Bạn chắc chắn muốn hủy lá thư này?</p>
          <span className="flex gap-2">
            <Button disabled={isPending} onClick={onCancelDelete} size="compact" type="button" variant="quiet">Giữ lại</Button>
            <Button disabled={isPending} onClick={onDelete} size="compact" type="button" variant="danger">Hủy lá thư</Button>
          </span>
        </div>
      ) : null}
    </li>
  );
}

function formatCountdown(opensAt: string, now: number | null): string {
  if (now === null) return "Đang tính thời gian còn lại…";

  const remainingMinutes = Math.max(
    0,
    Math.ceil((new Date(opensAt).getTime() - now) / 60_000),
  );
  if (!remainingMinutes) return "Đã đến giờ mở thư.";

  const days = Math.floor(remainingMinutes / 1_440);
  const hours = Math.floor((remainingMinutes % 1_440) / 60);
  const minutes = remainingMinutes % 60;
  const parts = [
    days ? `${days} ngày` : null,
    hours ? `${hours} giờ` : null,
    minutes || (!days && !hours) ? `${minutes} phút` : null,
  ].filter(Boolean);

  return `Còn ${parts.join(" ")}.`;
}

function feedbackFor(code: string): string {
  if (code === "UNAUTHENTICATED") return "Phiên đăng nhập đã hết. Hãy đăng nhập lại.";
  if (code === "ACCESS_DENIED") return "Bạn không có quyền hủy lá thư này.";
  if (code === "NOT_FOUND") return "Lá thư đã mở hoặc không còn tồn tại.";
  return "Chưa thể hủy lá thư lúc này. Hãy thử lại sau.";
}

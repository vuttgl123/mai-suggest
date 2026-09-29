"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FutureLetterRefresh } from "./future-letter-refresh";
import { formatFutureLetterOpening, formatTimeUntil } from "@/modules/future-letters/domain/future-letter-time";
import type { FutureLetterRecord } from "@/modules/future-letters/domain/future-letter-models";
import { deleteFutureLetterAction } from "@/modules/future-letters/presentation/future-letter-actions";

interface ScheduledLetterListProps {
  letters: FutureLetterRecord[];
  onEdit: (letter: FutureLetterRecord) => void;
}

let clockSnapshot = 0;

function subscribeToClock(onStoreChange: () => void): () => void {
  clockSnapshot = Date.now();
  onStoreChange();
  const interval = window.setInterval(() => {
    clockSnapshot = Date.now();
    onStoreChange();
  }, 60_000);

  return () => window.clearInterval(interval);
}

const getClockSnapshot = () => clockSnapshot;
const getServerClockSnapshot = () => 0;

/* The author's own sealed letters. Nobody else ever receives this list. */
export function ScheduledLetterList({ letters, onEdit }: ScheduledLetterListProps) {
  const router = useRouter();
  const clockTime = useSyncExternalStore(subscribeToClock, getClockSnapshot, getServerClockSnapshot);
  const [isPending, startTransition] = useTransition();
  const [confirmingLetterId, setConfirmingLetterId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  function deleteLetter(letterId: string) {
    startTransition(async () => {
      const result = await deleteFutureLetterAction(letterId);
      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }

      setConfirmingLetterId(null);
      setFeedback("Đã xóa lá thư đang hẹn.");
      router.refresh();
    });
  }

  return (
    <section aria-labelledby="scheduled-letters-heading">
      <FutureLetterRefresh letters={letters} />
      <h2 className="sr-only" id="scheduled-letters-heading">
        Thư tôi đã hẹn
      </h2>
      <p className="max-w-[60ch] text-muted">
        Chỉ bạn nhìn thấy những lá thư này. Bạn có thể sửa hoặc xóa cho tới giờ mở.
      </p>

      {letters.length ? (
        <ol className="mt-6 border-t border-border">
          {letters.map((letter) => (
            <li className="grid gap-3 border-b border-border py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start" key={letter.id}>
              <div className="min-w-0">
                <h3 className="font-display break-words text-lg font-medium text-brand-strong">{letter.title}</h3>
                <p className="tabular mt-1 text-sm text-muted">
                  <time dateTime={letter.opensAt}>{formatFutureLetterOpening(letter.opensAt, { withTimeZone: true })}</time>
                </p>
              </div>
              <div className="grid gap-2 sm:justify-items-end">
                <p className="tabular text-sm font-semibold text-ink" aria-live="off">
                  {clockTime ? formatTimeUntil(letter.opensAt, new Date(clockTime)) : " "}
                </p>
                <div className="flex flex-wrap gap-1">
                  <Button disabled={isPending} onClick={() => onEdit(letter)} size="compact" type="button" variant="quiet">
                    <Pencil aria-hidden="true" size={14} />
                    Sửa
                  </Button>
                  <Button
                    className="text-danger hover:bg-danger/10"
                    disabled={isPending}
                    onClick={() => setConfirmingLetterId(letter.id)}
                    size="compact"
                    type="button"
                    variant="quiet"
                  >
                    <Trash2 aria-hidden="true" size={14} />
                    Xóa
                  </Button>
                </div>
              </div>
              {confirmingLetterId === letter.id ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-danger/40 px-3 py-2 sm:col-span-2">
                  <p className="text-sm text-danger">Xóa “{letter.title}”? Thao tác này không thể hoàn tác.</p>
                  <span className="flex gap-2">
                    <Button disabled={isPending} onClick={() => setConfirmingLetterId(null)} size="compact" type="button" variant="quiet">
                      Giữ lại
                    </Button>
                    <Button disabled={isPending} onClick={() => deleteLetter(letter.id)} size="compact" type="button" variant="danger">
                      <Trash2 aria-hidden="true" size={14} />
                      Xóa lá thư
                    </Button>
                  </span>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-6 border-t border-border pt-6 text-muted">Bạn chưa hẹn lá thư nào.</p>
      )}

      {feedback ? <p aria-live="polite" className="mt-3 text-sm text-brand">{feedback}</p> : null}
    </section>
  );
}

function feedbackFor(code: string): string {
  if (code === "UNAUTHENTICATED") return "Phiên đăng nhập đã hết. Hãy đăng nhập lại.";
  if (code === "ACCESS_DENIED") return "Bạn không có quyền xóa lá thư này.";
  if (code === "NOT_FOUND") return "Lá thư đã mở hoặc không còn tồn tại, nên không thể xóa.";
  return "Chưa thể xóa lá thư lúc này. Hãy thử lại sau.";
}

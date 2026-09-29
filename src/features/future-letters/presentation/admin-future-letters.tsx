"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminWorkspaceHeader } from "@/components/admin/admin-workspace-header";
import { Button } from "@/components/ui/button";
import { formatFutureLetterOpening } from "@/modules/future-letters/domain/future-letter-time";
import type { FutureLetter } from "@/modules/future-letters/domain/future-letter-models";
import { deleteManagedFutureLetterAction } from "@/modules/future-letters/presentation/future-letter-actions";

interface AdminFutureLettersProps {
  /** Opened letters only. Sealed letters belong to their authors until they open. */
  letters: FutureLetter[];
}

export function AdminFutureLetters({ letters }: AdminFutureLettersProps) {
  const router = useRouter();
  const [confirmingLetterId, setConfirmingLetterId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function deleteLetter(letterId: string) {
    startTransition(async () => {
      const result = await deleteManagedFutureLetterAction(letterId);

      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }

      setConfirmingLetterId(null);
      setFeedback("Đã gỡ lá thư khỏi hòm thư chung.");
      router.refresh();
    });
  }

  return (
    <main className="diary-container pb-20 pt-8 sm:pt-10" id="admin-future-letters-content" tabIndex={-1}>
      <AdminWorkspaceHeader
        actions={
          <Link className="text-link" href="/thu-hen-ngay-mo">
            Xem hộp thư
          </Link>
        }
        description="Gỡ một lá thư đã mở khỏi hòm thư chung khi cần. Thư chưa đến giờ mở chỉ tác giả nhìn thấy, nên không xuất hiện ở đây."
        summary={<span className="tabular text-sm text-muted">{letters.length} lá thư đã mở</span>}
        title="Thư hẹn ngày mở"
      />

      {feedback ? (
        <p aria-live="polite" className="mt-5 text-sm text-brand">
          {feedback}
        </p>
      ) : null}

      {letters.length ? (
        <ol className="mt-8 border-t border-border">
          {letters.map((letter) => (
            <li className="grid gap-3 border-b border-border py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" key={letter.id}>
              <div className="min-w-0">
                <h2 className="font-display break-words text-lg font-medium text-brand-strong">{letter.title}</h2>
                <p className="tabular mt-0.5 text-sm text-muted">
                  Từ {letter.author.displayName}. {formatFutureLetterOpening(letter.opensAt)}.
                </p>
              </div>
              <Button
                className="text-danger hover:bg-danger/10"
                disabled={isPending}
                onClick={() => setConfirmingLetterId(letter.id)}
                size="compact"
                type="button"
                variant="quiet"
              >
                <Trash2 aria-hidden="true" size={14} />
                Gỡ thư
              </Button>
              {confirmingLetterId === letter.id ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-danger/40 px-3 py-2 sm:col-span-2">
                  <p className="text-sm text-danger">
                    Gỡ “{letter.title}” khỏi hòm thư chung? Thao tác này không thể hoàn tác.
                  </p>
                  <span className="flex gap-2">
                    <Button disabled={isPending} onClick={() => setConfirmingLetterId(null)} size="compact" type="button" variant="quiet">
                      Giữ lại
                    </Button>
                    <Button disabled={isPending} onClick={() => deleteLetter(letter.id)} size="compact" type="button" variant="danger">
                      <Trash2 aria-hidden="true" size={14} />
                      Gỡ lá thư
                    </Button>
                  </span>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-8 border-t border-border pt-6 text-muted">Chưa có lá thư nào đến ngày mở.</p>
      )}
    </main>
  );
}

function feedbackFor(code: string): string {
  if (code === "UNAUTHENTICATED") return "Phiên đăng nhập đã hết. Hãy đăng nhập lại.";
  if (code === "ACCESS_DENIED") return "Chỉ Owner mới có thể gỡ lá thư.";
  if (code === "NOT_FOUND") return "Lá thư không còn tồn tại, đã được gỡ hoặc chưa đến giờ mở.";
  return "Chưa thể gỡ lá thư lúc này. Hãy thử lại sau.";
}

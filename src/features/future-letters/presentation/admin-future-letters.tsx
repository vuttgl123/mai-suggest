"use client";

import Link from "next/link";
import { MailOpen, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminWorkspaceHeader } from "@/components/admin/admin-workspace-header";
import { AdminWorkspaceSwitcher } from "@/components/admin/admin-workspace-switcher";
import { Button } from "@/components/ui/button";
import { formatFutureLetterDateTime } from "@/modules/future-letters/domain/future-letter-time";
import type { FutureLetter } from "@/modules/future-letters/domain/future-letter-models";
import { deleteManagedFutureLetterAction } from "@/modules/future-letters/presentation/future-letter-actions";

interface AdminFutureLettersProps {
  letters: FutureLetter[];
  serverNow: string;
}

type LetterStatus = "opened" | "scheduled";
const MAX_TIMEOUT_DELAY = 2_147_483_647;

export function AdminFutureLetters({
  letters,
  serverNow,
}: AdminFutureLettersProps) {
  const router = useRouter();
  const [confirmingLetterId, setConfirmingLetterId] = useState<string | null>(
    null,
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const serverNowTime = new Date(serverNow).getTime();
  const [openedLetters, scheduledLetters] = splitLetters(letters, serverNowTime);
  const nextOpeningTime = getNextOpeningTime(scheduledLetters);

  useEffect(() => {
    if (!Number.isFinite(nextOpeningTime)) return;

    const delay = Math.min(
      Math.max(nextOpeningTime - Date.now() + 100, 0),
      MAX_TIMEOUT_DELAY,
    );
    const timer = window.setTimeout(() => router.refresh(), delay);
    return () => window.clearTimeout(timer);
  }, [nextOpeningTime, router]);

  function deleteLetter(letterId: string) {
    startTransition(async () => {
      const result = await deleteManagedFutureLetterAction(letterId);

      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }

      setConfirmingLetterId(null);
      setFeedback("Đã gỡ lá thư khỏi không gian chung.");
      router.refresh();
    });
  }

  return (
    <main
      className="mx-auto max-w-[82rem] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12"
      id="admin-future-letters-content"
      tabIndex={-1}
    >
      <AdminWorkspaceHeader
        actions={
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-4 text-sm font-semibold text-[var(--color-brand)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)]"
            href="/thu-hen-ngay-mo"
          >
            <MailOpen aria-hidden="true" size={16} />
            Xem trang thư
          </Link>
        }
        description="Rà soát những lá thư đang niêm phong và gìn giữ không gian chung sau khi thư đã mở."
        eyebrow="Quản trị · thư hẹn"
        summary={
          <div className="flex flex-wrap justify-end gap-2">
            <StatusSummary count={scheduledLetters.length} label="đang hẹn" />
            <StatusSummary count={openedLetters.length} label="đã mở" tone="opened" />
          </div>
        }
        title="Giữ gìn những điều đã được gửi đi."
      />
      <AdminWorkspaceSwitcher active="letters" />

      {feedback ? (
        <p
          aria-live="polite"
          className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-brand)]/15 bg-[var(--color-brand-soft)]/50 px-4 py-3 text-sm leading-6 text-[var(--color-brand)]"
        >
          {feedback}
        </p>
      ) : null}

      <div className="mt-5 grid gap-5 xl:grid-cols-2 xl:items-start">
        <ManagedLetterGroup
          confirmingLetterId={confirmingLetterId}
          emptyCopy="Chưa có lá thư nào đang chờ ngày mở."
          isPending={isPending}
          letters={scheduledLetters}
          onCancelDelete={() => setConfirmingLetterId(null)}
          onDelete={deleteLetter}
          onRequestDelete={setConfirmingLetterId}
          status="scheduled"
        />
        <ManagedLetterGroup
          confirmingLetterId={confirmingLetterId}
          emptyCopy="Chưa có lá thư nào đã đến ngày mở."
          isPending={isPending}
          letters={openedLetters}
          onCancelDelete={() => setConfirmingLetterId(null)}
          onDelete={deleteLetter}
          onRequestDelete={setConfirmingLetterId}
          status="opened"
        />
      </div>
    </main>
  );
}

interface ManagedLetterGroupProps {
  confirmingLetterId: string | null;
  emptyCopy: string;
  isPending: boolean;
  letters: FutureLetter[];
  onCancelDelete: () => void;
  onDelete: (letterId: string) => void;
  onRequestDelete: (letterId: string) => void;
  status: LetterStatus;
}

function ManagedLetterGroup({
  confirmingLetterId,
  emptyCopy,
  isPending,
  letters,
  onCancelDelete,
  onDelete,
  onRequestDelete,
  status,
}: ManagedLetterGroupProps) {
  const isOpened = status === "opened";
  const headingId = `managed-future-letters-${status}`;

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--theme-card-surface)] p-4 shadow-[var(--shadow-soft)] sm:p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <div>
          <p className="diary-kicker text-[var(--color-accent)]">
            {isOpened ? "Lưu trữ chung" : "Bàn niêm phong"}
          </p>
          <h2
            className="font-display mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]"
            id={headingId}
          >
            {isOpened ? "Đã mở" : "Đang hẹn"}
          </h2>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.11em] ${
            isOpened
              ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
              : "bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
          }`}
        >
          {letters.length} lá thư
        </span>
      </div>

      {letters.length ? (
        <ol className="mt-4 space-y-3">
          {letters.map((letter) => (
            <ManagedLetterRow
              isConfirming={confirmingLetterId === letter.id}
              isPending={isPending}
              key={letter.id}
              letter={letter}
              onCancelDelete={onCancelDelete}
              onDelete={() => onDelete(letter.id)}
              onRequestDelete={() => onRequestDelete(letter.id)}
              status={status}
            />
          ))}
        </ol>
      ) : (
        <p className="mt-4 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] px-4 py-8 text-center text-sm leading-6 text-[var(--color-muted)]">
          {emptyCopy}
        </p>
      )}
    </section>
  );
}

interface ManagedLetterRowProps {
  isConfirming: boolean;
  isPending: boolean;
  letter: FutureLetter;
  onCancelDelete: () => void;
  onDelete: () => void;
  onRequestDelete: () => void;
  status: LetterStatus;
}

function ManagedLetterRow({
  isConfirming,
  isPending,
  letter,
  onCancelDelete,
  onDelete,
  onRequestDelete,
  status,
}: ManagedLetterRowProps) {
  const isOpened = status === "opened";

  return (
    <li className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-paper)] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="diary-kicker text-[var(--color-accent)]">
            {isOpened ? "Đã đến ngày" : "Đang niêm phong"}
          </p>
          <h3 className="font-display mt-2 break-words text-xl font-semibold tracking-[-0.035em] text-[var(--color-brand-strong)]">
            {letter.title}
          </h3>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${
            isOpened
              ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
              : "bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
          }`}
        >
          {isOpened ? "Đã mở" : "Đang hẹn"}
        </span>
      </div>
      <dl className="mt-4 grid gap-2 border-t border-[var(--color-border)] pt-3 text-sm leading-6 sm:grid-cols-2">
        <div>
          <dt className="diary-kicker text-[9px]">Người viết</dt>
          <dd className="mt-0.5 break-words font-semibold text-[var(--color-brand-strong)]">
            {letter.author.displayName}
          </dd>
        </div>
        <div>
          <dt className="diary-kicker text-[9px]">Thời điểm mở</dt>
          <dd className="mt-0.5 font-semibold text-[var(--color-brand-strong)]">
            {formatFutureLetterDateTime(letter.opensAt)}
          </dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button
          disabled={isPending}
          onClick={onRequestDelete}
          size="compact"
          type="button"
          variant="quiet"
        >
          <Trash2 aria-hidden="true" size={14} />
          Gỡ thư
        </Button>
      </div>
      {isConfirming ? (
        <div className="mt-3 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-3">
          <p className="text-xs leading-5 text-[var(--color-danger)]">
            Gỡ “{letter.title}” khỏi không gian chung? Thao tác này không thể hoàn tác.
          </p>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <Button
              disabled={isPending}
              onClick={onCancelDelete}
              size="compact"
              type="button"
              variant="quiet"
            >
              Giữ lại
            </Button>
            <Button
              disabled={isPending}
              onClick={onDelete}
              size="compact"
              type="button"
              variant="danger"
            >
              <Trash2 aria-hidden="true" size={14} />
              Gỡ lá thư
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );
}

function StatusSummary({
  count,
  label,
  tone = "scheduled",
}: {
  count: number;
  label: string;
  tone?: LetterStatus;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.11em] ${
        tone === "opened"
          ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
          : "bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
      }`}
    >
      {count} {label}
    </span>
  );
}

function splitLetters(letters: FutureLetter[], serverNowTime: number) {
  const openedLetters: FutureLetter[] = [];
  const scheduledLetters: FutureLetter[] = [];

  for (const letter of letters) {
    if (new Date(letter.opensAt).getTime() <= serverNowTime) {
      openedLetters.push(letter);
    } else {
      scheduledLetters.push(letter);
    }
  }

  return [openedLetters, scheduledLetters] as const;
}

function getNextOpeningTime(letters: FutureLetter[]): number {
  let nextOpeningTime = Number.POSITIVE_INFINITY;

  for (const letter of letters) {
    nextOpeningTime = Math.min(
      nextOpeningTime,
      new Date(letter.opensAt).getTime(),
    );
  }

  return nextOpeningTime;
}

function feedbackFor(code: string): string {
  if (code === "UNAUTHENTICATED") {
    return "Phiên đăng nhập đã hết. Hãy đăng nhập lại.";
  }
  if (code === "ACCESS_DENIED") {
    return "Chỉ Owner mới có thể gỡ lá thư này.";
  }
  if (code === "NOT_FOUND") {
    return "Lá thư không còn tồn tại hoặc đã được gỡ.";
  }

  return "Chưa thể gỡ lá thư lúc này. Hãy thử lại sau.";
}

import Link from "next/link";
import { WaxSeal } from "@/components/ui/wax-seal";
import type { TodayNote as TodayNoteModel } from "@/features/home/lib/home-selection";
import { formatFutureLetterOpening } from "@/modules/future-letters/domain/future-letter-time";

export function TodayNote({ note }: { note: TodayNoteModel }) {
  const content =
    note.kind === "letter"
      ? {
          title: "Một lá thư vừa đến ngày mở",
          line: `“${note.letter.title}”, từ ${note.letter.author.displayName}. ${formatFutureLetterOpening(note.letter.opensAt)}.`,
          href: "/thu-hen-ngay-mo",
          action: "Đến hộp thư",
        }
      : {
          title: "Ngày này năm ấy",
          line: `${note.yearsAgo} năm trước: “${note.title}”, chương ${note.sequence} trong Hành trình.`,
          href: `/hanh-trinh?chapter=${encodeURIComponent(note.chapterId)}`,
          action: "Đọc lại chương",
        };

  return (
    <aside aria-label="Hôm nay" className="reveal-rise diary-container mt-10 md:mt-12">
      <div className="grid gap-4 rounded-[var(--radius-card)] border border-border bg-paper p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-5 sm:px-6">
        {note.kind === "letter" ? <WaxSeal /> : <span aria-hidden="true" className="hidden h-11 w-px bg-rose sm:block" />}
        <div className="min-w-0">
          <h2 className="font-display text-lg font-medium text-brand-strong">{content.title}</h2>
          <p className="mt-0.5 text-sm text-muted">{content.line}</p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-border-strong px-5 text-sm font-semibold text-brand transition-colors hover:border-brand hover:bg-brand-soft"
          href={content.href}
        >
          {content.action}
        </Link>
      </div>
    </aside>
  );
}

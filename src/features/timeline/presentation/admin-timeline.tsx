"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { ViewTransition } from "react";
import { AdminTimelineEditor } from "@/features/timeline/presentation/admin-timeline-editor";
import { AdminTimelineList } from "@/features/timeline/presentation/admin-timeline-list";
import type {
  ManagedTimelineEntry,
  ManagedTimelineEntrySummary,
} from "@/modules/timeline/domain/timeline-models";

interface AdminTimelineProps {
  entries: ManagedTimelineEntrySummary[];
  selectedEntry: ManagedTimelineEntry | null;
}

export function AdminTimeline({ entries, selectedEntry }: AdminTimelineProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const publishedCount = entries.filter((entry) => entry.isPublished).length;

  return (
    <main
      id="admin-timeline-content"
      className="mx-auto max-w-[90rem] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12"
      tabIndex={-1}
    >
      <section className="relative overflow-hidden rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-6 shadow-[var(--shadow-card)] sm:px-7 sm:py-8">
        <Sparkles className="absolute right-6 top-6 text-[var(--color-accent)] opacity-65" size={23} strokeWidth={1.25} aria-hidden="true" />
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="diary-kicker">Owner workspace · hành trình</p>
            <h1 className="font-display mt-3 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.06em] text-[var(--color-brand-strong)] sm:text-5xl">
              Chăm chút những chương mình đã cùng đi qua.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-muted)] sm:text-base">
              Viết các cột mốc, giữ chúng ở dạng nháp cho đến khi sẵn sàng, và gìn giữ
              những lời hồi đáp được gửi lại.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--color-brand-soft)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.11em] text-[var(--color-brand)]">
              {publishedCount}/{entries.length} công khai
            </span>
            <Link className="inline-flex min-h-11 items-center rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-4 text-sm font-semibold text-[var(--color-brand)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)]" href="/hanh-trinh">
              Xem hành trình
            </Link>
            <Link className="inline-flex min-h-11 items-center rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-4 text-sm font-semibold text-[var(--color-brand)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)]" href="/admin">
              Quản lý bộ sưu tập
            </Link>
          </div>
        </div>
      </section>

      {feedback ? <p aria-live="polite" className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-brand)]/15 bg-[var(--color-brand-soft)]/50 px-4 py-3 text-sm leading-6 text-[var(--color-brand)]">{feedback}</p> : null}

      <section className="mt-6 grid gap-5 xl:grid-cols-[20rem_minmax(0,1fr)] xl:items-start">
        <AdminTimelineList entries={entries} selectedEntryId={selectedEntry?.id ?? null} />
        <ViewTransition
          default="none"
          enter={{ "admin-select": "fade-in", default: "none" }}
          exit={{ "admin-select": "fade-out", default: "none" }}
          key={selectedEntry?.id ?? "new-timeline-entry"}
        >
          <AdminTimelineEditor onFeedback={setFeedback} selectedEntry={selectedEntry} />
        </ViewTransition>
      </section>
    </main>
  );
}

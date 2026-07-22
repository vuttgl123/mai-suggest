"use client";

import Link from "next/link";
import { useState } from "react";
import { ViewTransition } from "react";
import { AdminWorkspaceHeader } from "@/components/admin/admin-workspace-header";
import { AdminWorkspaceSwitcher } from "@/components/admin/admin-workspace-switcher";
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
      <AdminWorkspaceHeader
        actions={
          <Link
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-4 text-sm font-semibold text-[var(--color-brand)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)]"
            href="/hanh-trinh"
          >
            Xem hành trình
          </Link>
        }
        description="Viết các cột mốc, giữ chúng ở dạng nháp cho đến khi sẵn sàng, và gìn giữ những lời hồi đáp được gửi lại."
        eyebrow="Quản trị · hành trình"
        summary={
          <span className="rounded-full bg-[var(--color-brand-soft)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.11em] text-[var(--color-brand)]">
            {publishedCount}/{entries.length} công khai
          </span>
        }
        title="Chăm chút những chương mình đã cùng đi qua."
      />
      <AdminWorkspaceSwitcher active="timeline" />

      {feedback ? <p aria-live="polite" className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-brand)]/15 bg-[var(--color-brand-soft)]/50 px-4 py-3 text-sm leading-6 text-[var(--color-brand)]">{feedback}</p> : null}

      <section className="diary-section-rule mt-5 grid gap-5 py-5 xl:grid-cols-[20rem_minmax(0,1fr)] xl:items-start">
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

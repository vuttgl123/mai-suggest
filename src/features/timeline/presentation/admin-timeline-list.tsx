import Link from "next/link";
import { Plus } from "lucide-react";
import { createAdminTimelinePath } from "@/features/timeline/lib/timeline-navigation";
import type { ManagedTimelineEntrySummary } from "@/modules/timeline/domain/timeline-models";

interface AdminTimelineListProps {
  entries: ManagedTimelineEntrySummary[];
  selectedEntryId: string | null;
}

export function AdminTimelineList({
  entries,
  selectedEntryId,
}: AdminTimelineListProps) {
  return (
    <aside className="rounded-[var(--radius-frame)] border border-border bg-[color-mix(in_srgb,var(--surface-elevated)_82%,transparent)] p-4 shadow-[var(--shadow-soft)] xl:sticky xl:top-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-accent">Các chương</p>
          <h2 className="font-display mt-1 text-2xl font-semibold tracking-[-0.04em] text-brand-strong">
            Mốc hành trình
          </h2>
        </div>
        <Link className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand px-3 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-strong" href={createAdminTimelinePath({ entryId: null })}>
          <Plus size={15} aria-hidden="true" />
          Mốc mới
        </Link>
      </div>

      {entries.length ? (
        <ol className="mt-5 space-y-2" aria-label="Danh sách mốc hành trình">
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link
                aria-current={selectedEntryId === entry.id ? "page" : undefined}
                className={`block rounded-[var(--radius-card)] border p-3 transition ${
                  selectedEntryId === entry.id
                    ? "border-brand bg-brand-soft shadow-[var(--shadow-soft)]"
                    : "border-transparent hover:border-border hover:bg-paper"
                }`}
                href={createAdminTimelinePath({ entryId: entry.id })}
                transitionTypes={["admin-select"]}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-accent">{entry.dateLabel}</p>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${entry.isPublished ? "bg-positive/10 text-positive" : "bg-brand-soft text-brand"}`}>
                    {entry.isPublished ? "Live" : "Draft"}
                  </span>
                </div>
                <p className="mt-2 text-balance text-sm font-semibold leading-5 text-brand-strong">
                  {entry.title}
                </p>
                <p className="mt-2 flex flex-wrap gap-x-1.5 text-xs leading-5 text-muted">
                  <span>Thứ tự {entry.sortOrder}</span>
                  <span aria-hidden="true">·</span>
                  <span>{entry.responseCount} hồi đáp</span>
                </p>
              </Link>
            </li>
          ))}
        </ol>
      ) : <p className="mt-5 rounded-[var(--radius-card)] border border-dashed border-border px-4 py-7 text-center text-sm leading-6 text-muted">Chưa có mốc nào. Hãy bắt đầu bằng một trang thật riêng.</p>}
    </aside>
  );
}

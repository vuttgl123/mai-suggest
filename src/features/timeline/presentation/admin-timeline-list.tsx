import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
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
    <aside className="rounded-[var(--radius-card)] border border-border bg-[color-mix(in_srgb,var(--surface-elevated)_82%,transparent)] p-4 xl:sticky xl:top-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-accent">Các chương</p>
          <h2 className="font-display mt-1 text-2xl font-medium text-brand-strong">
            Mốc hành trình
          </h2>
        </div>
        <Link className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand px-3 text-xs font-semibold text-on-brand transition-colors hover:bg-brand-strong" href={createAdminTimelinePath({ entryId: null })}>
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
                    ? "border-brand bg-brand-soft"
                    : "border-transparent hover:border-border hover:bg-paper"
                }`}
                href={createAdminTimelinePath({ entryId: entry.id })}
                transitionTypes={["admin-select"]}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-accent">{entry.dateLabel}</p>
                  <StatusBadge active={entry.isPublished} activeLabel="Công khai" inactiveLabel="Nháp" />
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

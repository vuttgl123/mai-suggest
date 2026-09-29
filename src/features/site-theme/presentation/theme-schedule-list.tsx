"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import { Clock3, Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  getSiteThemePreset,
  type SiteThemeSchedule,
} from "@/modules/site-theme/domain/site-theme-models";
import { formatThemeScheduleDateTime } from "@/modules/site-theme/domain/site-theme-time";
import { deleteSiteThemeScheduleAction } from "@/modules/site-theme/presentation/site-theme-actions";

interface ThemeScheduleListProps {
  schedules: SiteThemeSchedule[];
  onEdit: (schedule: SiteThemeSchedule) => void;
  onFeedback: (message: string) => void;
}

export function ThemeScheduleList({
  schedules,
  onEdit,
  onFeedback,
}: ThemeScheduleListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  function removeSchedule(schedule: SiteThemeSchedule) {
    startTransition(async () => {
      const result = await deleteSiteThemeScheduleAction(schedule.id);
      if (!result.ok) {
        onFeedback(feedbackFor(result.error.code));
        return;
      }

      setConfirmingId(null);
      onFeedback("Đã xóa lịch không khí.");
      router.refresh();
    });
  }

  return (
    <section className="rounded-[var(--radius-dialog)] border border-border bg-paper p-5  sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="diary-kicker">Các khoảng đã hẹn</p>
          <h2 className="font-display mt-2 text-2xl font-medium text-brand-strong">
            Lịch không khí
          </h2>
        </div>
        <span className="rounded-full bg-brand-soft px-3 py-1.5 text-[0.8125rem] font-semibold">
          {schedules.length} lịch
        </span>
      </div>

      {schedules.length === 0 ? (
        <div className="mt-5 rounded-[var(--radius-card)] border border-dashed border-border bg-surface px-4 py-7 text-center">
          <Clock3 className="mx-auto text-accent" size={22} strokeWidth={1.3} aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-brand-strong">Chưa có lịch nào được hẹn.</p>
          <p className="mt-1 text-xs leading-5 text-muted">Bordeaux Diary sẽ là không khí mặc định.</p>
        </div>
      ) : (
        <ol className="mt-5 space-y-3">
          {schedules.map((schedule) => {
            const preset = getSiteThemePreset(schedule.themeKey);
            const isConfirming = confirmingId === schedule.id;

            return (
              <li
                className="rounded-[var(--radius-card)] border border-border bg-[var(--theme-control-surface)] p-4"
                key={schedule.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-6 text-brand-strong">
                      {formatThemeScheduleDateTime(schedule.startsAt)} → {formatThemeScheduleDateTime(schedule.endsAt)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-brand" aria-hidden="true" />
                      <p className="font-display text-lg font-medium text-brand-strong">
                        {preset.label}
                      </p>
                      <StatusBadge active={schedule.isEnabled} activeLabel="Đang bật" inactiveLabel="Đang tắt" />
                    </div>
                    <p className="mt-1 text-xs font-semibold text-accent">
                      Ưu tiên {schedule.priority}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button aria-label={`Chỉnh lịch ${preset.label}`} disabled={isPending} onClick={() => onEdit(schedule)} size="icon" variant="quiet">
                      <Pencil size={16} aria-hidden="true" />
                    </Button>
                    <Button aria-label={`Xóa lịch ${preset.label}`} disabled={isPending} onClick={() => setConfirmingId(schedule.id)} size="icon" variant="quiet">
                      <Trash2 size={16} aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                {isConfirming ? (
                  <div className="mt-4 rounded-[var(--radius-card)] border border-danger/30 bg-danger/10 p-3">
                    <p className="text-sm leading-5 text-danger">Xóa hẳn lịch này? Các lịch khác và theme hiện tại sẽ không bị thay đổi.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button disabled={isPending} onClick={() => setConfirmingId(null)} size="compact" variant="quiet">
                        Giữ lại
                      </Button>
                      <Button disabled={isPending} onClick={() => removeSchedule(schedule)} size="compact" variant="danger">
                        {isPending ? "Đang xóa…" : "Xóa lịch"}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function feedbackFor(code: string): string {
  if (code === "UNAUTHENTICATED") return "Phiên đăng nhập đã hết. Hãy đăng nhập lại.";
  if (code === "ACCESS_DENIED") return "Chỉ Owner có thể đổi không khí giao diện.";
  if (code === "NOT_FOUND") return "Lịch này không còn tồn tại.";
  return "Chưa thể xóa lịch lúc này. Hãy thử lại sau.";
}

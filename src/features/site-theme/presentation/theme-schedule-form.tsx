"use client";

import { CalendarPlus, Check, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  getSiteThemePreset,
  SITE_THEME_PRESETS,
  type SiteThemeKey,
  type SiteThemeSchedule,
  type SiteThemeScheduleInput,
} from "@/modules/site-theme/domain/site-theme-models";
import {
  toVietnamThemeDateTimeParts,
  toVietnamThemeInstant,
} from "@/modules/site-theme/domain/site-theme-time";
import {
  createSiteThemeScheduleAction,
  updateSiteThemeScheduleAction,
} from "@/modules/site-theme/presentation/site-theme-actions";

interface ThemeScheduleFormProps {
  schedule: SiteThemeSchedule | null;
  schedules: SiteThemeSchedule[];
  onCancel: () => void;
  onFeedback: (message: string) => void;
}

interface ThemeScheduleDraft {
  themeKey: SiteThemeKey;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  priority: string;
  isEnabled: boolean;
}

export function ThemeScheduleForm({
  schedule,
  schedules,
  onCancel,
  onFeedback,
}: ThemeScheduleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<ThemeScheduleDraft>(() => createDraft(null));
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);
  const priorityRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(createDraft(schedule));
    setValidationMessage(null);
  }, [schedule]);

  const timeRange = useMemo(
    () => resolveTimeRange(draft),
    [draft.endDate, draft.endTime, draft.startDate, draft.startTime],
  );
  const hasOverlap = useMemo(
    () =>
      timeRange !== null &&
      Number.isInteger(Number(draft.priority)) &&
      schedules.some((entry) => {
        if (!entry.isEnabled || entry.id === schedule?.id) return false;
        const entryStart = new Date(entry.startsAt).getTime();
        const entryEnd = new Date(entry.endsAt).getTime();
        const start = new Date(timeRange.startsAt).getTime();
        const end = new Date(timeRange.endsAt).getTime();

        return (
          entryStart < end &&
          entryEnd > start &&
          entry.priority >= Number(draft.priority)
        );
      }),
    [draft.priority, schedule?.id, schedules, timeRange],
  );

  function updateDraft(patch: Partial<ThemeScheduleDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function submit() {
    if (timeRange === null) {
      setValidationMessage("Ngày giờ kết thúc phải muộn hơn ngày giờ bắt đầu.");
      endTimeRef.current?.focus();
      return;
    }

    const priority = Number(draft.priority);
    if (!Number.isInteger(priority) || priority < 0 || priority > 1_000) {
      setValidationMessage("Độ ưu tiên cần là số nguyên từ 0 đến 1000.");
      priorityRef.current?.focus();
      return;
    }

    const input: SiteThemeScheduleInput = {
      themeKey: draft.themeKey,
      startsAt: timeRange.startsAt,
      endsAt: timeRange.endsAt,
      priority,
      isEnabled: draft.isEnabled,
    };

    startTransition(async () => {
      const result = schedule
        ? await updateSiteThemeScheduleAction(schedule.id, input)
        : await createSiteThemeScheduleAction(input);

      if (!result.ok) {
        onFeedback(feedbackFor(result.error.code));
        return;
      }

      onFeedback(schedule ? "Đã cập nhật lịch không khí." : "Đã tạo lịch không khí.");
      setValidationMessage(null);
      if (!schedule) setDraft(createDraft(null));
      onCancel();
      router.refresh();
    });
  }

  const heading = schedule ? "Chỉnh một khoảng không khí" : "Hẹn không khí mới";

  return (
    <section className="rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--color-paper)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="diary-kicker">Lịch tự động · giờ Việt Nam</p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)]">
            {heading}
          </h2>
        </div>
        {schedule ? (
          <Button aria-label="Đóng chỉnh lịch" disabled={isPending} onClick={onCancel} size="icon" variant="quiet">
            <X size={17} aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      <form
        className="mt-5 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <label className={`${fieldLabelClassName} rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--theme-control-surface)] p-3`}>
          Preset
          <select
            autoComplete="off"
            className={inputClassName}
            disabled={isPending}
            name="site-theme-preset"
            onChange={(event) => updateDraft({ themeKey: event.target.value as SiteThemeKey })}
            value={draft.themeKey}
          >
            {SITE_THEME_PRESETS.map((preset) => (
              <option key={preset.key} value={preset.key}>
                {preset.label}
              </option>
            ))}
          </select>
          <small>{getSiteThemePreset(draft.themeKey).description}</small>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className={`${fieldLabelClassName} rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--theme-control-surface)] p-3`}>
            Bắt đầu
            <input
              autoComplete="off"
              className={inputClassName}
              disabled={isPending}
              name="site-theme-start-date"
              onChange={(event) => updateDraft({ startDate: event.target.value })}
              required
              type="date"
              value={draft.startDate}
            />
            <input
              autoComplete="off"
              className={inputClassName}
              disabled={isPending}
              name="site-theme-start-time"
              onChange={(event) => updateDraft({ startTime: event.target.value })}
              required
              ref={endTimeRef}
              type="time"
              value={draft.startTime}
            />
          </label>
          <label className={`${fieldLabelClassName} rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--theme-control-surface)] p-3`}>
            Kết thúc
            <input
              autoComplete="off"
              className={inputClassName}
              disabled={isPending}
              name="site-theme-end-date"
              onChange={(event) => updateDraft({ endDate: event.target.value })}
              required
              type="date"
              value={draft.endDate}
            />
            <input
              autoComplete="off"
              className={inputClassName}
              disabled={isPending}
              name="site-theme-end-time"
              onChange={(event) => updateDraft({ endTime: event.target.value })}
              required
              type="time"
              value={draft.endTime}
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <label className={`${fieldLabelClassName} rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--theme-control-surface)] p-3`}>
            Độ ưu tiên
            <input
              autoComplete="off"
              className={inputClassName}
              disabled={isPending}
              max={1_000}
              min={0}
              name="site-theme-priority"
              onChange={(event) => updateDraft({ priority: event.target.value })}
              required
              ref={priorityRef}
              step={1}
              type="number"
              value={draft.priority}
            />
            <small>Số cao hơn sẽ được ưu tiên khi lịch chồng lên nhau.</small>
          </label>
          <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-semibold text-[var(--color-brand-strong)]">
            <input
              checked={draft.isEnabled}
              className="h-4 w-4 accent-[var(--color-brand)]"
              disabled={isPending}
              name="site-theme-enabled"
              onChange={(event) => updateDraft({ isEnabled: event.target.checked })}
              type="checkbox"
            />
            Bật lịch
          </label>
        </div>

        {validationMessage ? (
          <p aria-live="polite" className="text-sm leading-6 text-[var(--color-danger)]">
            {validationMessage}
          </p>
        ) : null}
        {hasOverlap ? (
          <p className="rounded-xl border border-[var(--color-accent)]/25 bg-[var(--color-brand-soft)]/45 px-3 py-2.5 text-xs leading-5 text-[var(--color-brand)]">
            Lịch này đang chồng với một lịch bật có ưu tiên bằng hoặc cao hơn; nó có thể không trở thành không khí hiệu lực.
          </p>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--color-border)] pt-4">
          {schedule ? (
            <Button disabled={isPending} onClick={onCancel} variant="quiet">
              Hủy
            </Button>
          ) : null}
          <Button disabled={isPending} type="submit">
            {schedule ? <Check size={16} aria-hidden="true" /> : <CalendarPlus size={16} aria-hidden="true" />}
            {isPending ? "Đang lưu…" : schedule ? "Lưu lịch" : "Tạo lịch"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function createDraft(schedule: SiteThemeSchedule | null): ThemeScheduleDraft {
  const start = schedule ? toVietnamThemeDateTimeParts(schedule.startsAt) : null;
  const end = schedule ? toVietnamThemeDateTimeParts(schedule.endsAt) : null;

  return {
    themeKey: schedule?.themeKey ?? "bordeaux",
    startDate: start?.date ?? "",
    startTime: start?.time ?? "",
    endDate: end?.date ?? "",
    endTime: end?.time ?? "",
    priority: String(schedule?.priority ?? 0),
    isEnabled: schedule?.isEnabled ?? true,
  };
}

function resolveTimeRange(draft: ThemeScheduleDraft) {
  const startsAt = toVietnamThemeInstant(draft.startDate, draft.startTime);
  const endsAt = toVietnamThemeInstant(draft.endDate, draft.endTime);

  if (!startsAt || !endsAt || new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
    return null;
  }

  return { startsAt, endsAt };
}

function feedbackFor(code: string): string {
  if (code === "UNAUTHENTICATED") return "Phiên đăng nhập đã hết. Hãy đăng nhập lại.";
  if (code === "ACCESS_DENIED") return "Chỉ Owner có thể đổi không khí giao diện.";
  if (code === "VALIDATION_FAILED") return "Lịch hoặc preset chưa hợp lệ.";
  if (code === "NOT_FOUND") return "Lịch này không còn tồn tại.";
  return "Chưa thể lưu thay đổi lúc này. Hãy thử lại sau.";
}

const fieldLabelClassName =
  "block text-sm font-semibold text-[var(--color-brand-strong)]";

const inputClassName =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--theme-control-surface)] px-3 text-sm font-medium text-[var(--color-ink)] transition focus:border-[var(--color-focus)] disabled:cursor-not-allowed disabled:bg-[var(--color-surface)]";

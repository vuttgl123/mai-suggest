"use client";

import { CalendarClock, Palette } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminWorkspaceHeader } from "@/components/admin/admin-workspace-header";
import { AdminWorkspaceSwitcher } from "@/components/admin/admin-workspace-switcher";
import { Button } from "@/components/ui/button";
import { ThemeScheduleForm } from "@/features/site-theme/presentation/theme-schedule-form";
import { ThemeScheduleList } from "@/features/site-theme/presentation/theme-schedule-list";
import { ThemeScenePicker } from "@/features/site-theme/presentation/theme-scene-picker";
import { ThemeSceneTransitionProgress } from "@/features/site-theme/presentation/theme-scene-transition-progress";
import {
  getSiteThemePreset,
  type ResolvedSiteTheme,
  type SiteThemeKey,
  type SiteThemeSchedule,
  type SiteThemeSettings,
} from "@/modules/site-theme/domain/site-theme-models";
import {
  cancelThemeSceneTransitionAction,
  commitThemeSceneTransitionAction,
  setManualSiteThemeAction,
  startThemeSceneTransitionAction,
} from "@/modules/site-theme/presentation/site-theme-actions";

interface AdminSiteThemeProps {
  settings: SiteThemeSettings;
  schedules: SiteThemeSchedule[];
  resolved: ResolvedSiteTheme;
}

export function AdminSiteTheme({
  settings,
  schedules,
  resolved,
}: AdminSiteThemeProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<SiteThemeSchedule | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState<SiteThemeKey | null>(null);
  const [transitionStep, setTransitionStep] = useState<0 | 1 | 2 | 3>(0);
  const [isCancellingTransition, setIsCancellingTransition] = useState(false);
  const transitionTimerRefs = useRef<ReturnType<typeof window.setTimeout>[]>([]);
  const resolvedPreset = getSiteThemePreset(resolved.key);

  useEffect(() => {
    return () => clearTransitionTimers();
  }, []);

  function clearTransitionTimers() {
    transitionTimerRefs.current.forEach((timer) => window.clearTimeout(timer));
    transitionTimerRefs.current = [];
  }

  function scheduleTransitionTimer(callback: () => void, delay: number) {
    const timer = window.setTimeout(callback, delay);
    transitionTimerRefs.current.push(timer);
  }

  function chooseMode(themeKey: SiteThemeKey | null) {
    if (themeKey !== null) {
      startTransition(async () => {
        const result = await startThemeSceneTransitionAction(themeKey);
        if (!result.ok) {
          setFeedback(transitionFeedbackFor(result.error.code));
          return;
        }

        setFeedback(null);
        setShowComposer(false);
        setEditingSchedule(null);
        setTransitionTarget(themeKey);
        setTransitionStep(0);
        clearTransitionTimers();
        scheduleTransitionTimer(() => setTransitionStep(1), 420);
        scheduleTransitionTimer(() => setTransitionStep(2), 900);
        scheduleTransitionTimer(() => commitSceneTransition(), 1_350);
      });
      return;
    }

    startTransition(async () => {
      const result = await setManualSiteThemeAction(themeKey);
      if (!result.ok) {
        setFeedback(feedbackFor(result.error.code));
        return;
      }

      setFeedback(
        "Đã trở lại chế độ tự động theo lịch.",
      );
      router.refresh();
    });
  }

  function commitSceneTransition() {
    startTransition(async () => {
      const result = await commitThemeSceneTransitionAction();
      if (!result.ok) {
        await recoverFromTransitionFailure(transitionFeedbackFor(result.error.code));
        return;
      }

      setTransitionStep(3);
      setFeedback("Đã mở ra không khí mới cho toàn bộ không gian.");
      scheduleTransitionTimer(() => {
        clearTransitionTimers();
        setTransitionTarget(null);
        setTransitionStep(0);
        router.refresh();
      }, 320);
    });
  }

  async function recoverFromTransitionFailure(message: string) {
    clearTransitionTimers();
    const cancelResult = await cancelThemeSceneTransitionAction();
    setTransitionTarget(null);
    setTransitionStep(0);
    setFeedback(
      cancelResult.ok
        ? message
        : `${message} Chưa thể hủy trạng thái chuyển cảnh; hệ thống sẽ tự mở lại trong tối đa 90 giây.`,
    );
  }

  function cancelSceneTransition() {
    clearTransitionTimers();
    setIsCancellingTransition(true);
    startTransition(async () => {
      const result = await cancelThemeSceneTransitionAction();
      setIsCancellingTransition(false);

      if (!result.ok) {
        setFeedback(transitionFeedbackFor(result.error.code));
        return;
      }

      setTransitionTarget(null);
      setTransitionStep(0);
      setFeedback("Đã dừng chuyển cảnh. Không gian hiện tại vẫn được giữ nguyên.");
      router.refresh();
    });
  }

  function startEditing(schedule: SiteThemeSchedule) {
    setEditingSchedule(schedule);
    setShowComposer(true);
  }

  function closeComposer() {
    setEditingSchedule(null);
    setShowComposer(false);
  }

  return (
    <main
      className="mx-auto max-w-[88rem] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12"
      id="admin-site-theme-content"
      tabIndex={-1}
    >
      <AdminWorkspaceHeader
        description="Chọn một không khí cho hôm nay hoặc hẹn những khoảng chuyển mình dịu dàng cho các ngày đặc biệt."
        eyebrow="Quản trị · không khí"
        summary={
          <div className="min-w-[13rem] rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--theme-control-surface)] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[var(--color-muted)]">
              Đang hiển thị
            </p>
            <p className="font-display mt-1 text-xl font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]">
              {resolvedPreset.label}
            </p>
            <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
              {sourceMessage(resolved)}
            </p>
          </div>
        }
        title="Để mỗi mùa kể lại một chương thật riêng."
      />
      <AdminWorkspaceSwitcher active="theme" />

      {feedback ? (
        <p aria-live="polite" className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-brand)]/20 bg-[var(--color-brand-soft)]/55 px-4 py-3 text-sm leading-6 text-[var(--color-brand)]">
          {feedback}
        </p>
      ) : null}

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(19rem,0.72fr)_minmax(0,1.28fr)] xl:items-start">
        <aside className="space-y-5 xl:sticky xl:top-5">
          <section className="rounded-[var(--radius-dialog)] border border-[var(--color-border)] bg-[var(--color-paper)] p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 text-[var(--color-accent)]">
              <Palette size={18} aria-hidden="true" />
              <p className="diary-kicker">Chọn cho hiện tại</p>
            </div>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)]">
              Tự động hay một lời hẹn riêng?
            </h2>
            <ThemeScenePicker
              disabled={transitionTarget !== null || isPending}
              manualThemeKey={settings.manualThemeKey}
              onChange={chooseMode}
            />
          </section>

          {transitionTarget !== null ? (
            <ThemeSceneTransitionProgress
              isCancelling={isCancellingTransition || isPending}
              onCancel={cancelSceneTransition}
              step={transitionStep}
              targetThemeKey={transitionTarget}
            />
          ) : null}
        </aside>

        <div className="space-y-5">
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-paper)] px-4 py-3 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]">
                <CalendarClock size={18} aria-hidden="true" />
              </span>
              <p className="text-sm leading-5 text-[var(--color-muted)]">Các lịch có thể chồng nhau; độ ưu tiên cao hơn sẽ được dùng trước.</p>
            </div>
            {!showComposer ? (
              <Button
                disabled={transitionTarget !== null || isPending}
                onClick={() => setShowComposer(true)}
              >
                <CalendarClock size={16} aria-hidden="true" />
                Hẹn lịch mới
              </Button>
            ) : null}
          </section>

          {showComposer ? (
            <ThemeScheduleForm
              onCancel={closeComposer}
              onFeedback={setFeedback}
              schedule={editingSchedule}
              schedules={schedules}
            />
          ) : null}

          <ThemeScheduleList
            onEdit={startEditing}
            onFeedback={setFeedback}
            schedules={schedules}
          />
        </div>
      </section>
    </main>
  );
}

function sourceMessage(resolved: ResolvedSiteTheme): string {
  if (resolved.source === "manual") return "Đang ghi đè thủ công.";
  if (resolved.source === "schedule") return "Đang theo lịch đã hẹn.";
  if (resolved.source === "fallback") return "Đang dùng Bordeaux an toàn vì chưa đọc được cấu hình.";
  return "Đang dùng Bordeaux mặc định.";
}

function feedbackFor(code: string): string {
  if (code === "UNAUTHENTICATED") return "Phiên đăng nhập đã hết. Hãy đăng nhập lại.";
  if (code === "ACCESS_DENIED") return "Chỉ Owner có thể đổi không khí giao diện.";
  if (code === "VALIDATION_FAILED") return "Preset chưa hợp lệ.";
  return "Chưa thể đổi không khí lúc này. Hãy thử lại sau.";
}

function transitionFeedbackFor(code: string): string {
  if (code === "NOT_FOUND") {
    return "Lần chuyển cảnh này không còn hiệu lực. Hãy thử chọn lại không khí.";
  }

  return feedbackFor(code);
}

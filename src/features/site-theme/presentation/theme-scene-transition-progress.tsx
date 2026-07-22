import { LoaderCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getSiteThemePreset,
  type SiteThemeKey,
} from "@/modules/site-theme/domain/site-theme-models";

interface ThemeSceneTransitionProgressProps {
  isCancelling: boolean;
  onCancel: () => void;
  step: 0 | 1 | 2 | 3;
  targetThemeKey: SiteThemeKey;
}

const transitionSteps = [
  "Chuẩn bị không gian",
  "Thay khung và nền",
  "Đồng bộ trải nghiệm",
  "Mở ra chương mới",
] as const;

export function ThemeSceneTransitionProgress({
  isCancelling,
  onCancel,
  step,
  targetThemeKey,
}: ThemeSceneTransitionProgressProps) {
  const preset = getSiteThemePreset(targetThemeKey);

  return (
    <section
      aria-live="polite"
      className="theme-scene-transition diary-surface diary-surface--ledger border-[var(--color-accent)]/30 p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="diary-kicker">Đang chuyển scene · {preset.label}</p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.045em] text-[var(--color-brand-strong)]">
            Không khí mới đang thành hình.
          </h2>
        </div>
        <Button
          disabled={isCancelling}
          onClick={onCancel}
          size="compact"
          variant="secondary"
        >
          <X size={15} aria-hidden="true" />
          {isCancelling ? "Đang hủy…" : "Hủy chuyển cảnh"}
        </Button>
      </div>

      <ol className="theme-scene-transition__steps mt-5">
        {transitionSteps.map((label, index) => {
          const state = index < step ? "complete" : index === step ? "current" : "pending";

          return (
            <li data-state={state} key={label}>
              <span aria-hidden="true">{index < step ? "✓" : index + 1}</span>
              <p>
                <strong>{label}</strong>
                {index === step ? <small>Đang thực hiện</small> : null}
              </p>
              {index === step ? (
                <LoaderCircle aria-hidden="true" className="theme-scene-transition__spinner" size={16} />
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

import { Clock3, Heart } from "lucide-react";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";
import type { ResumeSelectionModel } from "@/features/catalogue/hooks/use-catalogue-controller";

interface ResumeSelectionProps {
  model: ResumeSelectionModel | null;
  onContinue(): void;
  onViewSummary(): void;
}

function formatUpdatedAt(value: string | null) {
  if (!value) return "Chưa có thời gian cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có thời gian cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function ResumeSelection({
  model,
  onContinue,
  onViewSummary,
}: ResumeSelectionProps): ReactElement | null {
  if (!model) return null;

  return (
    <section
      className="border-b border-[var(--color-border)] bg-[#edf3ef] px-4 py-5 sm:px-8"
      aria-labelledby="resume-selection-title"
    >
      <div className="mx-auto flex max-w-[78rem] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-semibold text-[var(--color-positive)]">
            <Heart size={15} fill="currentColor" aria-hidden="true" />
            Lựa chọn đã lưu trên thiết bị
          </p>
          <h2
            id="resume-selection-title"
            className="mt-1 text-base font-semibold text-[var(--color-ink)]"
          >
            {model.selectedItemCount} gợi ý trong {model.selectedCategoryCount} danh mục
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
            <Clock3 size={13} aria-hidden="true" />
            Cập nhật {formatUpdatedAt(model.updatedAt)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button variant="secondary" onClick={onContinue}>
            Tiếp tục chọn
          </Button>
          <Button onClick={onViewSummary}>Xem tổng kết</Button>
        </div>
      </div>
    </section>
  );
}

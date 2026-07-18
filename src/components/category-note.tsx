import { PenLine } from "lucide-react";
import type { PersistenceStatus } from "@/features/selection/hooks/use-preference-selection";
import { FieldLabel, TextAreaControl } from "./ui/form-control";

interface CategoryNoteProps {
  categoryId: string;
  categoryName: string;
  placeholder: string;
  value: string;
  persistenceStatus: PersistenceStatus;
  onChange: (value: string) => void;
}

export function CategoryNote({
  categoryId,
  categoryName,
  placeholder,
  value,
  persistenceStatus,
  onChange,
}: CategoryNoteProps) {
  const inputId = `note-${categoryId}`;

  return (
    <div className="mt-8 border-t border-[var(--color-border)] pt-6 sm:mt-10">
      <div className="mb-3 flex items-start justify-between gap-4">
        <FieldLabel htmlFor={inputId} className="flex items-center gap-2 text-sm text-[var(--color-brand)]">
          <PenLine size={16} strokeWidth={1.6} aria-hidden="true" />
          Điều em muốn nhắn thêm về {categoryName.toLocaleLowerCase("vi-VN")}
        </FieldLabel>
        <span className="shrink-0 text-xs text-[var(--color-muted)]">
          {value.length}/500
        </span>
      </div>
      <TextAreaControl
        id={inputId}
        name={inputId}
        autoComplete="off"
        value={value}
        maxLength={500}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="resize-none"
      />
      <div
        className="mt-2 min-h-5 text-xs text-[var(--color-muted)]"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {persistenceStatus === "saving" && "Đang lưu trên thiết bị này..."}
        {persistenceStatus === "saved" && "Đã lưu trên thiết bị này"}
        {persistenceStatus === "unavailable" &&
          "Không thể lưu trên thiết bị này"}
      </div>
    </div>
  );
}

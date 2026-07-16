import { PenLine } from "lucide-react";

interface CategoryNoteProps {
  categoryId: string;
  categoryName: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export function CategoryNote({
  categoryId,
  categoryName,
  placeholder,
  value,
  onChange,
}: CategoryNoteProps) {
  const inputId = `note-${categoryId}`;

  return (
    <div className="mt-8 rounded-[1.5rem] border border-[#5a0d18]/10 bg-[#fffaf4]/80 p-4 shadow-[0_12px_35px_rgba(49,8,14,0.04)] sm:mt-10 sm:p-6">
      <div className="mb-3 flex items-start justify-between gap-4">
        <label htmlFor={inputId} className="flex items-center gap-2 text-sm font-semibold text-[#5a0d18]">
          <PenLine size={16} strokeWidth={1.6} aria-hidden="true" />
          Điều em muốn nhắn thêm về {categoryName.toLocaleLowerCase("vi-VN")}
        </label>
        <span className="shrink-0 text-[0.65rem] text-[#765e62]" aria-live="polite">
          {value.length}/500
        </span>
      </div>
      <textarea
        id={inputId}
        value={value}
        maxLength={500}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="block w-full resize-none rounded-2xl border border-[#5a0d18]/15 bg-white/75 px-4 py-3 text-base leading-7 text-[#2a171a] placeholder:text-[#765e62]/65 focus:border-[#7a1425] focus:outline-none focus:ring-2 focus:ring-[#c8a96b]/40"
      />
    </div>
  );
}

import type { ReactElement, ReactNode } from "react";

interface FilterChipProps {
  selected: boolean;
  onClick(): void;
  children: ReactNode;
}

export function FilterChip({
  selected,
  onClick,
  children,
}: FilterChipProps): ReactElement {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-11 shrink-0 rounded-[var(--radius-control)] border px-4 py-2 text-sm font-semibold transition duration-[var(--duration-fast)] ${
        selected
          ? "border-[var(--color-positive)] bg-[var(--color-positive)] text-white"
          : "border-[var(--color-border)] bg-white text-[var(--color-brand)] hover:border-[var(--color-accent)]"
      }`}
    >
      {children}
    </button>
  );
}

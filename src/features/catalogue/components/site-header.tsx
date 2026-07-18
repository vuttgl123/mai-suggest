import { Heart, SlidersHorizontal } from "lucide-react";
import type { ReactElement } from "react";
import { Button } from "@/components/ui/button";

interface SiteHeaderProps {
  title: string;
  selectedItemCount: number;
  onOpenSelection(): void;
}

export function SiteHeader({
  title,
  selectedItemCount,
  onOpenSelection,
}: SiteHeaderProps): ReactElement {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-paper)] shadow-sm">
      <div className="mx-auto flex min-h-14 max-w-[78rem] items-center gap-3 px-4 sm:px-8">
        <a
          href="#hero"
          className="font-display min-w-0 flex-1 truncate text-xl font-semibold tracking-normal text-[var(--color-brand-strong)]"
        >
          {title}
        </a>
        <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 sm:flex">
          <a
            href="#discovery"
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] px-3 text-sm font-semibold text-[var(--color-brand)] hover:bg-[var(--color-surface)]"
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            Bộ lọc
          </a>
          <a
            href="#catalogue-start"
            className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] px-3 text-sm font-semibold text-[var(--color-brand)] hover:bg-[var(--color-surface)]"
          >
            Danh mục
          </a>
        </nav>
        {selectedItemCount > 0 && (
          <Button
            variant="quiet"
            size="compact"
            onClick={onOpenSelection}
            aria-label={`Xem ${selectedItemCount} lựa chọn`}
          >
            <Heart size={16} fill="currentColor" aria-hidden="true" />
            <span className="tabular-nums">{selectedItemCount}</span>
            <span className="hidden sm:inline">lựa chọn</span>
          </Button>
        )}
      </div>
    </header>
  );
}

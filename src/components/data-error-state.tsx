import { HeartCrack, RefreshCw } from "lucide-react";
import { DecorativeDivider } from "./decorative-elements";
import { Button } from "./ui/button";

export function DataErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-surface)] px-6 py-16 text-center">
      <section className="paper-card max-w-lg rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)] px-7 py-12 sm:px-12">
        <HeartCrack className="mx-auto mb-5 text-[var(--color-danger)]" size={34} strokeWidth={1.3} aria-hidden="true" />
        <p className="mb-3 text-[0.68rem] font-semibold text-[var(--color-accent)]">Không thể tải dữ liệu</p>
        <h1 className="font-display text-4xl font-semibold tracking-normal text-[var(--color-brand-strong)] sm:text-5xl">Chưa thể mở catalogue</h1>
        <div className="my-6"><DecorativeDivider /></div>
        <p className="text-sm leading-7 text-[var(--color-muted)]">Không thể đọc dữ liệu catalogue lúc này. Hãy thử tải lại trang.</p>
        <Button
          onClick={onRetry}
          className="mx-auto mt-8 min-h-12 px-7"
        >
          <RefreshCw size={17} aria-hidden="true" />
          Thử lại
        </Button>
      </section>
    </main>
  );
}

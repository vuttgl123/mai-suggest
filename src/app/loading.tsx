import { ViewTransition } from "react";

export default function Loading() {
  return (
    <ViewTransition default="none" exit="slide-down">
      <div className="diary-shell min-h-[100dvh]" aria-busy="true" aria-label="Đang tải bộ sưu tập">
        <div className="diary-container flex min-h-[4.5rem] items-center justify-between">
          <div className="h-10 w-48 animate-pulse rounded-[0.95rem] bg-[var(--color-skeleton)]" />
          <div className="h-8 w-28 animate-pulse rounded-full bg-[var(--color-skeleton)]" />
        </div>
        <main className="diary-container diary-section">
          <div className="max-w-3xl space-y-4">
            <div className="h-3 w-48 animate-pulse rounded-full bg-[var(--color-skeleton)]" />
            <div className="h-24 w-full max-w-2xl animate-pulse rounded-[var(--radius-card)] bg-[var(--color-skeleton)]" />
            <div className="h-5 w-full max-w-xl animate-pulse rounded-full bg-[var(--color-skeleton)]" />
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
            {[0, 1, 2].map((index) => (
              <div
                className={`overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-paper)] ${index === 0 ? "lg:col-span-5" : "lg:col-span-3"}`}
                key={index}
              >
                <div className="aspect-[4/5] animate-pulse bg-[var(--color-skeleton)]" />
                <div className="space-y-2.5 p-5">
                  <div className="h-3 w-20 animate-pulse rounded-full bg-[var(--color-skeleton)]" />
                  <div className="h-7 w-2/3 animate-pulse rounded-full bg-[var(--color-skeleton)]" />
                  <div className="h-4 w-full animate-pulse rounded-full bg-[var(--color-skeleton)]" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </ViewTransition>
  );
}

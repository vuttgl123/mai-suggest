import { ViewTransition } from "react";

export default function Loading() {
  return (
    <ViewTransition default="none" exit="slide-down">
      <div className="min-h-screen" aria-busy="true" aria-label="Đang tải bộ sưu tập">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className="h-10 w-44 animate-pulse rounded-full bg-[var(--color-skeleton)]" />
          <div className="h-8 w-28 animate-pulse rounded-full bg-[var(--color-skeleton)]" />
        </div>
        <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
          <div className="max-w-3xl space-y-5">
            <div className="h-3 w-48 animate-pulse rounded-full bg-[var(--color-skeleton)]" />
            <div className="h-24 w-full max-w-2xl animate-pulse rounded-[var(--radius-card)] bg-[var(--color-skeleton)]" />
            <div className="h-5 w-full max-w-xl animate-pulse rounded-full bg-[var(--color-skeleton)]" />
          </div>
          <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {[0, 1, 2].map((index) => (
              <div
                className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-paper)]"
                key={index}
              >
                <div className="aspect-[4/5] animate-pulse bg-[var(--color-skeleton)]" />
                <div className="space-y-3 p-6">
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

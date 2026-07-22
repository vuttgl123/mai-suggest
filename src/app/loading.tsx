import { ViewTransition } from "react";
import { DiaryBook } from "@/components/diary/diary-book";
import { DiarySurface } from "@/components/diary/diary-surface";

export default function Loading() {
  return (
    <ViewTransition default="none" exit="slide-down">
      <DiaryBook aria-busy="true" aria-label="Đang tải bộ sưu tập">
        <div className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className="h-10 w-44 animate-pulse rounded-full bg-[var(--color-skeleton)]" />
          <div className="h-8 w-28 animate-pulse rounded-full bg-[var(--color-skeleton)]" />
        </div>
        <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
          <DiarySurface className="max-w-3xl space-y-4 p-6 sm:p-8" kind="ledger">
            <div className="h-3 w-48 animate-pulse rounded-full bg-[var(--color-skeleton)]" />
            <div className="h-24 w-full max-w-2xl animate-pulse rounded-[var(--radius-card)] bg-[var(--color-skeleton)]" />
            <div className="h-5 w-full max-w-xl animate-pulse rounded-full bg-[var(--color-skeleton)]" />
          </DiarySurface>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {[0, 1, 2].map((index) => (
              <DiarySurface
                className="overflow-hidden"
                key={index}
                kind="page"
              >
                <div className="aspect-[4/5] animate-pulse bg-[var(--color-skeleton)]" />
                <div className="space-y-2.5 p-5">
                  <div className="h-3 w-20 animate-pulse rounded-full bg-[var(--color-skeleton)]" />
                  <div className="h-7 w-2/3 animate-pulse rounded-full bg-[var(--color-skeleton)]" />
                  <div className="h-4 w-full animate-pulse rounded-full bg-[var(--color-skeleton)]" />
                </div>
              </DiarySurface>
            ))}
          </div>
        </main>
      </DiaryBook>
    </ViewTransition>
  );
}

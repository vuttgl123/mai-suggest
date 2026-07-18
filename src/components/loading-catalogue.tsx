import {
  PRODUCT_GRID_CLASSNAME,
  PRODUCT_PAGE_SIZES,
} from "@/lib/catalogue-layout";

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-paper)]">
      <div className="aspect-[4/5] animate-pulse bg-[#e5e0dc]" />
      <div className="space-y-2 p-3 sm:p-4">
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#ded9d5]" />
        <div className="h-5 w-full animate-pulse rounded bg-[#e5e0dc]" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-[#e5e0dc]" />
      </div>
      <div className="h-11 animate-pulse border-t border-[var(--color-border)] bg-[var(--color-surface)]" />
    </div>
  );
}

export function LoadingCatalogue() {
  return (
    <main
      className="min-h-screen bg-[var(--color-surface)]"
      aria-busy="true"
      aria-label="Đang mở catalogue gợi ý"
    >
      <section className="flex min-h-[90svh] items-center justify-center bg-[var(--color-brand-strong)] px-6">
        <div className="flex w-full max-w-2xl flex-col items-center gap-5">
          <div className="h-3 w-44 animate-pulse rounded bg-white/25" />
          <div className="h-20 w-full max-w-md animate-pulse rounded-lg bg-white/12" />
          <div className="h-4 w-full max-w-xl animate-pulse rounded bg-white/10" />
          <div className="h-12 w-full max-w-sm animate-pulse rounded-md bg-white/15" />
        </div>
      </section>
      <section className="mx-auto max-w-[78rem] px-4 py-12 sm:px-8 sm:py-16">
        <div className="mb-8 space-y-3 text-center">
          <div className="mx-auto h-8 w-56 animate-pulse rounded bg-[#e5e0dc]" />
          <div className="mx-auto h-4 w-72 max-w-full animate-pulse rounded bg-[#ded9d5]" />
        </div>
        <div className={PRODUCT_GRID_CLASSNAME}>
          {Array.from({ length: PRODUCT_PAGE_SIZES.mobile }, (_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}

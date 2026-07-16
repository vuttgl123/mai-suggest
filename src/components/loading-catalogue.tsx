import {
  PRODUCT_GRID_CLASSNAME,
  PRODUCT_PAGE_SIZES,
} from "@/lib/catalogue-layout";

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[1rem] border border-[#5a0d18]/10 bg-[#fffaf4] sm:rounded-[1.25rem]">
      <div className="aspect-[4/5] animate-pulse bg-[#eadfda]" />
      <div className="space-y-2 p-3 sm:p-4">
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#eee4dd]" />
        <div className="h-5 w-full animate-pulse rounded bg-[#eadfda]" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-[#eadfda]" />
      </div>
      <div className="h-11 animate-pulse border-t border-[#5a0d18]/10 bg-[#f3e9df]" />
    </div>
  );
}

export function LoadingCatalogue() {
  return (
    <main
      className="min-h-screen bg-[#f8f1e8]"
      aria-busy="true"
      aria-label="Đang mở catalogue gợi ý"
    >
      <section className="flex min-h-[90svh] items-center justify-center bg-[#31080e] px-6">
        <div className="flex w-full max-w-2xl flex-col items-center gap-5">
          <div className="h-3 w-44 animate-pulse rounded bg-[#c8a96b]/30" />
          <div className="h-20 w-full max-w-md animate-pulse rounded-2xl bg-[#f8f1e8]/12" />
          <div className="h-4 w-full max-w-xl animate-pulse rounded bg-[#f8f1e8]/10" />
          <div className="h-12 w-full max-w-sm animate-pulse rounded-full bg-[#f8f1e8]/15" />
        </div>
      </section>
      <section className="mx-auto max-w-[78rem] px-4 py-12 sm:px-8 sm:py-16">
        <div className="mb-8 space-y-3 text-center">
          <div className="mx-auto h-8 w-56 animate-pulse rounded bg-[#eadfda]" />
          <div className="mx-auto h-4 w-72 max-w-full animate-pulse rounded bg-[#eee4dd]" />
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

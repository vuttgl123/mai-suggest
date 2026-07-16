import { HeartCrack, RefreshCw } from "lucide-react";
import { DecorativeDivider } from "./decorative-elements";

export function DataErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8f1e8] px-6 py-16 text-center">
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#e8d5d7]/50 blur-3xl" aria-hidden="true" />
      <section className="paper-card relative max-w-lg rounded-[2rem] border border-[#5a0d18]/10 bg-[#fffaf4] px-7 py-12 sm:px-12">
        <HeartCrack className="mx-auto mb-5 text-[#7a1425]" size={34} strokeWidth={1.3} aria-hidden="true" />
        <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.25em] text-[#9b763e]">Một chút gián đoạn</p>
        <h1 className="font-display text-4xl font-semibold text-[#31080e] sm:text-5xl">Cuốn catalogue chưa thể mở</h1>
        <div className="my-6"><DecorativeDivider /></div>
        <p className="text-sm leading-7 text-[#765e62]">Có lẽ kết nối vừa lỡ một nhịp. Em thử mở lại lần nữa nhé.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mx-auto mt-8 flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#5a0d18] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#7a1425]"
        >
          <RefreshCw size={17} aria-hidden="true" />
          Thử lại
        </button>
      </section>
    </main>
  );
}

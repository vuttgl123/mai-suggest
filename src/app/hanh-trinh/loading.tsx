import { Loader2 } from "lucide-react";

export default function TimelineLoading() {
  return (
    <div className="journey-layout">
      <main className="flex min-h-[50vh] flex-col items-center justify-center p-5 text-center">
        <Loader2
          className="animate-spin text-accent"
          size={32}
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <h1 className="font-display mt-6 text-2xl font-semibold tracking-[-0.04em] text-brand-strong">
          Đang lật mở hành trình...
        </h1>
        <p className="body-text-sm mt-3 text-muted">
          Những dòng nhật ký đang được chuẩn bị.
        </p>
      </main>
    </div>
  );
}

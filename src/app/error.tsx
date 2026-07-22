"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="diary-shell grid min-h-screen place-items-center px-5 py-12 sm:px-8">
      <section className="diary-wash w-full max-w-lg rounded-[var(--radius-dialog)] border border-[var(--color-border)] p-8 text-center shadow-[var(--shadow-card)] sm:p-12">
        <span
          className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
          aria-hidden="true"
        >
          <RefreshCw size={21} strokeWidth={1.6} />
        </span>
        <p className="diary-kicker mt-6">Có một nhịp nhỏ bị ngắt quãng</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--color-brand-strong)]">
          Chưa thể mở bộ sưu tập.
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[var(--color-muted)]">
          Hãy thử lại một lần nữa. Nếu vẫn chưa được, em có thể quay lại sau nhé.
        </p>
        <Button className="mt-8" onClick={reset}>
          <RefreshCw size={16} aria-hidden="true" />
          Thử lại
        </Button>
      </section>
    </main>
  );
}

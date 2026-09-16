"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="journey-layout">
      <main className="grid min-h-[50vh] place-items-center px-4">
        <div className="diary-wash max-w-md rounded-[var(--radius-dialog)] border border-border p-8 text-center sm:p-10">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-danger/10 text-danger" aria-hidden="true">
            <AlertCircle size={24} strokeWidth={1.5} />
          </span>
          <h2 className="font-display mt-5 text-2xl font-semibold tracking-tight text-brand-strong">
            Không thể tải hộp thư
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Đã có lỗi xảy ra khi kết nối. Vui lòng thử lại sau.
          </p>
          <Button className="mt-6 w-full" onClick={() => reset()} type="button">
            Thử lại
          </Button>
        </div>
      </main>
    </div>
  );
}

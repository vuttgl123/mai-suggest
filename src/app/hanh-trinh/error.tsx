"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TimelineError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Timeline error:", error);
  }, [error]);

  return (
    <div className="journey-layout">
      <main className="flex min-h-[50vh] flex-col items-center justify-center p-5 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-danger/10 text-danger" aria-hidden="true">
          <AlertTriangle size={24} strokeWidth={1.5} />
        </span>
        <h1 className="font-display mt-6 text-2xl font-semibold tracking-[-0.04em] text-brand-strong">
          Không thể mở hành trình
        </h1>
        <p className="body-text-sm mt-3 max-w-sm text-muted">
          Đã có lỗi xảy ra khi tải các dòng nhật ký. Bạn vui lòng thử lại nhé.
        </p>
        <div className="mt-8">
          <Button onClick={() => reset()} type="button">
            <RotateCcw size={16} aria-hidden="true" />
            Thử lại
          </Button>
        </div>
      </main>
    </div>
  );
}

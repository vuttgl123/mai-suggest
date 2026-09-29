"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RouteErrorState } from "@/components/ui/route-state";

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
    <RouteErrorState
      action={<Button onClick={() => reset()}>Thử lại</Button>}
      description="Không tải được hộp thư từ máy chủ. Kiểm tra kết nối rồi thử lại."
      title="Chưa mở được hộp thư."
    />
  );
}

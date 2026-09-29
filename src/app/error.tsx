"use client";

import { Button } from "@/components/ui/button";
import { RouteErrorState } from "@/components/ui/route-state";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <RouteErrorState
      action={<Button onClick={reset}>Thử lại</Button>}
      description="Không tải được bộ sưu tập từ máy chủ. Kiểm tra kết nối rồi thử lại."
      title="Chưa mở được bộ sưu tập."
    />
  );
}

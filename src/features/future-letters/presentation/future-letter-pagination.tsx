"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FutureLetterPaginationProps {
  currentPage: number;
  hasMore: boolean;
  query: string;
}

export function FutureLetterPagination({
  currentPage,
  hasMore,
  query,
}: FutureLetterPaginationProps) {
  const router = useRouter();

  function navigateTo(page: number) {
    const params = new URLSearchParams();
    if (page > 1) {
      params.set("page", page.toString());
    }
    if (query) {
      params.set("q", query);
    }
    router.push(`?${params.toString()}`);
  }

  if (currentPage === 1 && !hasMore) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-4 mt-10 border-t border-border pt-6">
      <Button
        variant="secondary"
        disabled={currentPage <= 1}
        onClick={() => navigateTo(currentPage - 1)}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Trang trAA c
      </Button>
      <span className="text-sm font-medium text-muted">
        Trang {currentPage}
      </span>
      <Button
        variant="secondary"
        disabled={!hasMore}
        onClick={() => navigateTo(currentPage + 1)}
      >
        Trang sau
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

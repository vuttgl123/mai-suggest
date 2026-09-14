"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createCataloguePath } from "@/features/catalogue/lib/catalogue-navigation";

interface CatalogueSearchProps {
  categorySlug: string | null;
  query: string | null;
  resultCount: number;
}

export function CatalogueSearch({
  categorySlug,
  query,
  resultCount,
}: CatalogueSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(query ?? "");
  const [isPending, startTransition] = useTransition();

  function navigate(nextQuery: string) {
    startTransition(() => {
      router.push(
        createCataloguePath({ categorySlug, page: 1, query: nextQuery }),
        { scroll: false },
      );
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate(value);
  }

  function handleClear() {
    setValue("");
    navigate("");
  }

  return (
    <section
      aria-labelledby="catalogue-search-heading"
      className="mx-auto mt-8 max-w-2xl"
    >
      <form
        className="group relative flex items-center rounded-2xl border border-border/50 bg-[var(--surface-elevated)] p-2 shadow-sm transition-all focus-within:border-accent/40 focus-within:ring-4 focus-within:ring-accent/10"
        onSubmit={handleSubmit}
        role="search"
      >
        <label className="sr-only" htmlFor="catalogue-search-input">
          Tìm trong Bộ sưu tập
        </label>
        
        <div className="flex h-10 w-10 shrink-0 items-center justify-center text-muted group-focus-within:text-accent">
          <Search size={18} strokeWidth={2} aria-hidden="true" />
        </div>
        
        <input
          autoComplete="off"
          className="h-10 flex-1 bg-transparent px-2 text-[15px] text-brand-strong outline-none placeholder:text-muted/70"
          id="catalogue-search-input"
          name="query"
          onChange={(event) => setValue(event.target.value)}
          placeholder="Tìm theo tiêu đề hoặc lời giới thiệu..."
          type="search"
          value={value}
        />

        <div className="flex shrink-0 items-center gap-2 pr-2">
          {query ? (
            <button
              aria-label="Xóa tìm kiếm"
              className="grid h-7 w-7 place-items-center rounded-md text-muted transition hover:bg-[var(--color-surface)] hover:text-brand-strong"
              disabled={isPending}
              onClick={handleClear}
              type="button"
            >
              <X size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          ) : (
            <div className="hidden items-center gap-1 rounded border border-border/60 bg-[var(--color-surface)] px-1.5 py-0.5 text-[10px] font-medium text-muted/60 sm:flex">
              <kbd className="font-sans">⌘</kbd>
              <kbd className="font-sans">K</kbd>
            </div>
          )}
          
          <button
            className="hidden h-8 rounded-lg bg-brand-strong px-4 text-xs font-medium text-white shadow-sm transition hover:bg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-wait disabled:opacity-60 sm:block"
            disabled={isPending}
            type="submit"
          >
            Tìm
          </button>
        </div>
      </form>
      
      {/* Search results summary */}
      <div className="mt-3 flex justify-between px-2 text-xs text-muted/80">
        <p id="catalogue-search-heading" className="sr-only">Điều em đang tìm</p>
        <p aria-atomic="true" aria-live="polite">
          {query
            ? `Đã tìm thấy ${resultCount} kết quả`
            : "Nhấn Enter để bắt đầu tìm kiếm"}
        </p>
      </div>
    </section>
  );
}

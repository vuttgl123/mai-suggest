"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
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

  useEffect(() => {
    setValue(query ?? "");
  }, [query]);

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
      className="diary-wash rounded-[var(--radius-card)] border border-[var(--color-border)] p-4 shadow-[var(--shadow-soft)] sm:p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="diary-kicker">Tìm trong những điều đã lưu</p>
          <h2
            className="font-display mt-1 text-2xl font-semibold tracking-[-0.04em] text-[var(--color-brand-strong)]"
            id="catalogue-search-heading"
          >
            Điều em đang tìm
          </h2>
        </div>
        <p
          aria-atomic="true"
          aria-live="polite"
          className="text-sm leading-6 text-[var(--color-muted)]"
        >
          {query
            ? `${resultCount} điều cho “${query}”`
            : "Tìm theo tiêu đề hoặc lời giới thiệu ngắn."}
        </p>
      </div>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={handleSubmit}
        role="search"
      >
        <label className="sr-only" htmlFor="catalogue-search-input">
          Tìm trong Bộ sưu tập
        </label>
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
            size={17}
            aria-hidden="true"
          />
          <input
            className="min-h-11 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] py-2 pl-11 pr-4 text-sm text-[var(--color-brand-strong)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-focus)]"
            id="catalogue-search-input"
            onChange={(event) => setValue(event.target.value)}
            placeholder="Ví dụ: cà phê, một chuyến đi..."
            type="search"
            value={value}
          />
        </div>
        <div className="flex gap-2">
          <button
            className="min-h-11 rounded-full bg-[var(--color-brand)] px-5 text-sm font-semibold text-white shadow-[var(--theme-button-shadow)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            Tìm
          </button>
          {query ? (
            <button
              aria-label="Xóa tìm kiếm"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-paper)] px-4 text-[var(--color-brand)] transition hover:-translate-y-0.5 hover:border-[var(--color-accent)] disabled:cursor-wait disabled:opacity-60"
              disabled={isPending}
              onClick={handleClear}
              type="button"
            >
              <X size={17} aria-hidden="true" />
              <span className="ml-1.5 text-sm font-semibold">Xóa</span>
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}

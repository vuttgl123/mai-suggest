"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createCataloguePath } from "@/features/catalogue/lib/catalogue-navigation";

interface CatalogueSearchProps {
  categorySlug: string | null;
  query: string | null;
  className?: string;
}

export function CatalogueSearch({ categorySlug, query, className = "" }: CatalogueSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(query ?? "");
  const [isPending, startTransition] = useTransition();

  function navigate(nextQuery: string) {
    startTransition(() => {
      router.push(`${createCataloguePath({ categorySlug, page: 1, query: nextQuery })}#collection`);
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
    <form
      aria-busy={isPending || undefined}
      className={`flex h-12 w-full min-w-0 items-center gap-2 rounded-full border border-border-input bg-paper pl-4 pr-1.5 focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-focus sm:max-w-md ${className}`.trim()}
      onSubmit={handleSubmit}
      role="search"
    >
      <label className="sr-only" htmlFor="catalogue-search-input">
        Tìm trong Bộ sưu tập
      </label>
      <Search aria-hidden="true" className="shrink-0 text-muted" size={18} strokeWidth={1.5} />
      <input
        autoComplete="off"
        className="h-full w-0 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
        enterKeyHint="search"
        id="catalogue-search-input"
        name="query"
        onChange={(event) => setValue(event.target.value)}
        placeholder="Tìm theo tên hoặc lời giới thiệu"
        type="search"
        value={value}
      />
      {query ? (
        <button
          aria-label="Xóa tìm kiếm"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-brand-soft hover:text-brand"
          disabled={isPending}
          onClick={handleClear}
          type="button"
        >
          <X aria-hidden="true" size={16} strokeWidth={1.5} />
        </button>
      ) : null}
      <button
        className="h-9 shrink-0 rounded-full bg-brand px-4 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-strong disabled:cursor-wait disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        Tìm
      </button>
    </form>
  );
}

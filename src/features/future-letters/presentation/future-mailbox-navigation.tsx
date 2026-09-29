"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";

export function FutureMailboxNavigation({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    const serialized = params.toString();
    router.push(serialized ? `/thu-hen-ngay-mo?${serialized}` : "/thu-hen-ngay-mo", { scroll: false });
  }

  return (
    <form
      className="flex h-12 w-full min-w-0 items-center gap-2 rounded-full border border-border-input bg-paper pl-4 pr-1.5 focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-focus sm:max-w-sm"
      onSubmit={handleSubmit}
      role="search"
    >
      <label className="sr-only" htmlFor="mailbox-search">
        Tìm thư theo tiêu đề
      </label>
      <Search aria-hidden="true" className="shrink-0 text-muted" size={18} strokeWidth={1.5} />
      <input
        className="h-full w-0 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
        enterKeyHint="search"
        id="mailbox-search"
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Tìm theo tiêu đề thư"
        type="search"
        value={query}
      />
      <button className="h-9 shrink-0 rounded-full bg-brand px-4 text-sm font-semibold text-on-brand hover:bg-brand-strong" type="submit">
        Tìm
      </button>
    </form>
  );
}

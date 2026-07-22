import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface AdminWorkspaceHeaderProps {
  actions?: ReactNode;
  description: string;
  eyebrow: string;
  summary: ReactNode;
  title: string;
}

export function AdminWorkspaceHeader({
  actions,
  description,
  eyebrow,
  summary,
  title,
}: AdminWorkspaceHeaderProps) {
  return (
    <section className="diary-surface diary-surface--ledger relative px-5 py-6 sm:px-7 sm:py-7">
      <Sparkles
        aria-hidden="true"
        className="absolute right-6 top-6 text-[var(--color-accent)] opacity-65"
        size={22}
        strokeWidth={1.2}
      />
      <div className="relative flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-3xl">
          <p className="diary-kicker">{eyebrow}</p>
          <h1 className="font-display mt-2 text-balance text-4xl font-semibold tracking-[-0.06em] text-[var(--color-brand-strong)] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted)] sm:text-base">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {summary}
          {actions}
        </div>
      </div>
    </section>
  );
}

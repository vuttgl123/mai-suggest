import type { ReactNode } from "react";

interface AdminWorkspaceHeaderProps {
  actions?: ReactNode;
  description: string;
  /** Kept for existing call sites; admin headings carry no eyebrow label. */
  eyebrow?: string;
  summary: ReactNode;
  title: string;
}

export function AdminWorkspaceHeader({
  actions,
  description,
  summary,
  title,
}: AdminWorkspaceHeaderProps) {
  return (
    <section className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-6">
      <div className="max-w-3xl">
        <h1 className="font-display display-md text-brand-strong">{title}</h1>
        <p className="mt-2 max-w-[65ch] text-muted">{description}</p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        {summary}
        {actions}
      </div>
    </section>
  );
}

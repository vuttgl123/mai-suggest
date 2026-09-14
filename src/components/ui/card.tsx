import Link from "next/link";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  href?: string;
  /** Adds the quiet hover treatment: a 2px lift and a border colour shift. */
  interactive?: boolean;
  transitionTypes?: string[];
}

const BASE =
  "relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-paper shadow-[var(--elevation-raised)]";

const INTERACTIVE =
  "transition-[transform,border-color,box-shadow] duration-[var(--motion-base)] ease-[var(--motion-ease)] hover:-translate-y-0.5 hover:border-accent hover:shadow-[var(--elevation-lifted)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-focus";

export function Card({
  children,
  className = "",
  href,
  interactive = false,
  transitionTypes,
}: CardProps) {
  const classes = `${BASE} ${interactive ? INTERACTIVE : ""} ${className}`.trim();

  if (href) {
    return (
      <Link className={classes} href={href} transitionTypes={transitionTypes}>
        {children}
      </Link>
    );
  }

  return <div className={classes}>{children}</div>;
}

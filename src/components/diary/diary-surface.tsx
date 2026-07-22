import type { ReactNode } from "react";

export type DiarySurfaceKind = "page" | "spread" | "ledger" | "note" | "print";

interface DiarySurfaceProps {
  children: ReactNode;
  className?: string;
  kind?: DiarySurfaceKind;
}

export function DiarySurface({
  children,
  className,
  kind = "page",
}: DiarySurfaceProps) {
  return (
    <div
      className={[
        "diary-surface",
        `diary-surface--${kind}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

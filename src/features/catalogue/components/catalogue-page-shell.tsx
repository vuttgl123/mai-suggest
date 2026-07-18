import type { ReactElement, ReactNode } from "react";

interface CataloguePageShellProps {
  hero: ReactNode;
  siteHeader: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}

export function CataloguePageShell({
  hero,
  siteHeader,
  footer,
  children,
}: CataloguePageShellProps): ReactElement {
  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <a
        href="#catalogue-start"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-[var(--radius-control)] bg-white px-4 py-3 text-sm font-semibold text-[var(--color-brand)] shadow-xl transition-transform focus:translate-y-0"
      >
        Bỏ qua để đến danh sách gợi ý
      </a>
      {hero}
      {siteHeader}
      <main className="min-w-0">{children}</main>
      {footer}
    </div>
  );
}

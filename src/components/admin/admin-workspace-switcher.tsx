import { BookHeart, Palette, Shapes, type LucideIcon } from "lucide-react";
import Link from "next/link";

export type AdminWorkspace = "catalogue" | "timeline" | "theme";

interface AdminWorkspaceSwitcherProps {
  active: AdminWorkspace;
}

const workspaces: Array<{
  href: string;
  icon: LucideIcon;
  key: AdminWorkspace;
  label: string;
}> = [
  { href: "/admin", icon: Shapes, key: "catalogue", label: "Bộ sưu tập" },
  {
    href: "/admin/hanh-trinh",
    icon: BookHeart,
    key: "timeline",
    label: "Hành trình",
  },
  {
    href: "/admin/khong-khi",
    icon: Palette,
    key: "theme",
    label: "Không khí",
  },
];

export function AdminWorkspaceSwitcher({ active }: AdminWorkspaceSwitcherProps) {
  return (
    <nav
      aria-label="Khu vực quản trị"
      className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--theme-control-surface)] p-1.5 shadow-[var(--shadow-soft)]"
    >
      <div className="flex min-w-max gap-1">
        {workspaces.map(({ href, icon: Icon, key, label }) => {
          const isActive = key === active;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-[var(--color-brand)] text-white shadow-[0_6px_16px_rgb(49_5_12_/_20%)]"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-paper)] hover:text-[var(--color-brand)]"
              }`}
              href={href}
              key={key}
            >
              <Icon aria-hidden="true" size={16} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

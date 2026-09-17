"use client";

import { BookHeart, MailOpen, Palette, Shapes, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const workspaces: Array<{
  href: string;
  icon: LucideIcon;
  label: string;
}> = [
  { href: "/admin", icon: Shapes, label: "Bộ sưu tập" },
  {
    href: "/admin/hanh-trinh",
    icon: BookHeart,
    label: "Hành trình",
  },
  {
    href: "/admin/khong-khi",
    icon: Palette,
    label: "Không khí",
  },
  {
    href: "/admin/thu-hen-ngay-mo",
    icon: MailOpen,
    label: "Thư hẹn",
  },
];

export function AdminWorkspaceSwitcher() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Khu vực quản trị"
      className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-border bg-paper/60 backdrop-blur-md p-1.5"
    >
      <div className="flex min-w-max gap-1">
        {workspaces.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-paper hover:text-brand"
              }`}
              href={href}
              key={href}
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

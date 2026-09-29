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
    <nav aria-label="Khu vực quản trị" className="-mx-[var(--page-edge)] overflow-x-auto border-b border-border px-[var(--page-edge)] [scrollbar-width:none]">
      <ul className="flex min-w-max gap-6">
        {workspaces.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;

          return (
            <li key={href}>
              <Link
                aria-current={isActive ? "page" : undefined}
                className="mailbox-tab gap-2"
                href={href}
              >
                <Icon aria-hidden="true" size={16} strokeWidth={1.5} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

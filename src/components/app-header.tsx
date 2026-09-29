"use client";

import Link from "next/link";
import { Menu, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";

type Section = "catalogue" | "journey" | "letters" | "admin";

interface AppHeaderProps {
  actor: ActiveActor;
  activeSection?: Section;
}

const NAV_ITEMS: Array<{ section: Exclude<Section, "admin">; href: string; label: string }> = [
  { section: "catalogue", href: "/#collection", label: "Bộ sưu tập" },
  { section: "journey", href: "/hanh-trinh", label: "Hành trình" },
  { section: "letters", href: "/thu-hen-ngay-mo", label: "Hộp thư" },
];

export function AppHeader({ actor, activeSection = "catalogue" }: AppHeaderProps) {
  const displayName = actor.email?.split("@")[0] || "Thành viên";
  const initial = displayName.charAt(0).toLocaleUpperCase("vi");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        toggleRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="app-header" style={{ viewTransitionName: "persistent-nav" }}>
      <div className="app-header__capsule">
        <Link
          className="inline-flex min-h-11 items-center gap-2.5 rounded-full font-display text-[1.125rem] font-medium text-brand-strong"
          href="/"
          onClick={closeMenu}
        >
          <span
            aria-hidden="true"
            className="wax-seal grid place-items-center text-[#f3e3e0]"
            style={{ "--seal-size": "1.625rem" } as React.CSSProperties}
          >
            <svg fill="currentColor" height="11" viewBox="0 0 24 24" width="11">
              <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.9 4.5c2.2 0 3.7 1.2 5.1 3 1.4-1.8 2.9-3 5.1-3 3.9 0 6 3.9 4.5 7.3C19.5 16.4 12 21 12 21z" />
            </svg>
          </span>
          <span translate="no">Điều Em Yêu</span>
        </Link>

        <nav aria-label="Điều hướng chính" className="hidden items-center md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              aria-current={activeSection === item.section ? "page" : undefined}
              className="app-header__nav-link"
              href={item.href}
              key={item.section}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          {actor.canManageCatalogue ? (
            <Link
              aria-current={activeSection === "admin" ? "page" : undefined}
              className="app-header__nav-link hidden gap-1.5 sm:inline-flex"
              href="/admin"
            >
              <ShieldCheck aria-hidden="true" size={16} strokeWidth={1.5} />
              Quản trị
            </Link>
          ) : null}

          <span className="hidden max-w-[9rem] truncate px-2 text-sm text-muted sm:block" title={actor.email ?? undefined}>
            {displayName}
          </span>
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-full border border-border bg-paper-deep font-display text-[0.8125rem] font-medium text-brand-strong"
          >
            {initial}
          </span>

          <button
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Đóng điều hướng" : "Mở điều hướng"}
            className="grid h-11 w-11 place-items-center rounded-full text-brand transition-colors hover:bg-brand-soft md:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
            ref={toggleRef}
            type="button"
          >
            {isMenuOpen ? <X aria-hidden="true" size={20} strokeWidth={1.5} /> : <Menu aria-hidden="true" size={20} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <nav
          aria-label="Điều hướng di động"
          className="absolute inset-x-4 top-full mt-2 grid gap-1 rounded-[var(--radius-dialog)] border border-border bg-paper p-2 shadow-floating md:hidden"
          id="mobile-navigation"
          ref={menuRef}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              aria-current={activeSection === item.section ? "page" : undefined}
              className="app-header__mobile-link"
              href={item.href}
              key={item.section}
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
          {actor.canManageCatalogue ? (
            <Link
              aria-current={activeSection === "admin" ? "page" : undefined}
              className="app-header__mobile-link"
              href="/admin"
              onClick={closeMenu}
            >
              Quản trị
            </Link>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}

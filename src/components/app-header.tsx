"use client";

import Link from "next/link";
import { Heart, Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";

interface AppHeaderProps {
  actor: ActiveActor;
  activeSection?: "catalogue" | "journey" | "letters" | "admin";
}

export function AppHeader({ actor, activeSection = "catalogue" }: AppHeaderProps) {
  const identity = actor.email ?? "Thành viên";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function linkClassName(section: AppHeaderProps["activeSection"]): string {
    const isActive = activeSection === section;
    return `relative inline-flex h-10 items-center px-2 text-[13px] sm:text-[14px] font-medium tracking-wide transition-colors duration-300 ${
      isActive
        ? "text-brand-strong"
        : "text-muted hover:text-brand-strong"
    }`;
  }

  return (
    <header
      className="app-header sticky top-4 z-40 w-full transition-all duration-500 animate-luxury-reveal px-4 sm:px-6"
      style={{ viewTransitionName: "persistent-nav" }}
    >
      <div className="mx-auto flex h-14 max-w-[var(--content-max)] items-center justify-between rounded-full border border-border/40 bg-[var(--surface-elevated)]/70 px-4 pr-1.5 shadow-md backdrop-blur-xl ring-1 ring-black/5">
        
        {/* Brand Logo & Name */}
        <Link
          className="group inline-flex items-center gap-2 outline-none pl-2"
          href="/"
          onClick={closeMenu}
        >
          <span
            className="app-header-mark grid h-7 w-7 place-items-center rounded-full bg-brand-soft/80 text-brand transition-transform duration-500 group-hover:scale-105"
            aria-hidden="true"
          >
            <Heart size={14} fill="currentColor" strokeWidth={1.5} />
          </span>
          <span className="font-display text-[15px] font-medium tracking-tight text-brand-strong" translate="no">
            Điều Em Yêu
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden md:flex items-center gap-x-1 absolute left-1/2 -translate-x-1/2"
          id="primary-navigation"
        >
          <Link className={linkClassName("catalogue")} href="/#collection" onClick={closeMenu}>
            Bộ sưu tập
            {activeSection === "catalogue" && (
              <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand" aria-hidden="true" />
            )}
          </Link>
          <Link className={linkClassName("journey")} href="/hanh-trinh" onClick={closeMenu}>
            Hành trình
            {activeSection === "journey" && (
              <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand" aria-hidden="true" />
            )}
          </Link>
          <Link className={linkClassName("letters")} href="/thu-hen-ngay-mo" onClick={closeMenu}>
            Hộp thư
            {activeSection === "letters" && (
              <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand" aria-hidden="true" />
            )}
          </Link>
        </nav>

        {/* Actor Info, Admin & Mobile Toggle */}
        <div className="flex shrink-0 items-center gap-1.5">
          {actor.canManageCatalogue ? (
            <Link 
              className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium text-brand hover:bg-brand-soft/50 transition-colors"
              href="/admin" 
              onClick={closeMenu}
            >
              <ShieldCheck size={14} aria-hidden="true" />
              Quản trị
            </Link>
          ) : null}

          <div className="hidden h-9 items-center rounded-full bg-[var(--color-surface)] px-3 sm:flex border border-border/50">
            <span className="max-w-[10rem] truncate text-[12px] font-medium text-muted">
              {identity.split('@')[0]}
            </span>
          </div>

          {/* Mobile Toggle Button */}
          <button
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Đóng điều hướng" : "Mở điều hướng"}
            className="grid h-11 w-11 place-items-center rounded-full text-brand transition-colors hover:bg-black/5 md:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
            type="button"
          >
            {isMenuOpen ? <X aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <nav
          aria-label="Điều hướng di động"
          className="absolute left-4 right-4 top-full mt-3 flex flex-col gap-1 rounded-2xl border border-border/50 bg-[var(--surface-elevated)] p-3 shadow-lg backdrop-blur-xl md:hidden"
          id="mobile-navigation"
        >
          <Link className="rounded-xl px-4 py-3 text-sm font-medium text-brand-strong hover:bg-black/5" href="/#collection" onClick={closeMenu}>Bộ sưu tập</Link>
          <Link className="rounded-xl px-4 py-3 text-sm font-medium text-brand-strong hover:bg-black/5" href="/hanh-trinh" onClick={closeMenu}>Hành trình</Link>
          <Link className="rounded-xl px-4 py-3 text-sm font-medium text-brand-strong hover:bg-black/5" href="/thu-hen-ngay-mo" onClick={closeMenu}>Hộp thư</Link>
          {actor.canManageCatalogue && (
            <Link className="rounded-xl px-4 py-3 text-sm font-medium text-brand hover:bg-black/5" href="/admin" onClick={closeMenu}>Quản trị</Link>
          )}
        </nav>
      )}
    </header>
  );
}

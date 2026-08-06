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
    return `relative inline-flex min-h-[44px] items-center px-5 py-2 text-[13px] sm:text-[14px] font-medium tracking-wide transition-all duration-300 rounded-full ${
      isActive
        ? "text-[var(--color-brand-strong)] bg-[color-mix(in_srgb,var(--color-brand-soft)_80%,transparent)] shadow-[0_2px_12px_rgba(49,5,12,0.08)] border border-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]"
        : "text-[var(--color-muted)] hover:text-[var(--color-brand-strong)] hover:bg-[color-mix(in_srgb,var(--color-paper)_60%,transparent)] hover:shadow-sm"
    }`;
  }

  return (
    <header
      className="app-header sticky top-6 z-40 mx-auto max-w-5xl px-4 transition-all duration-500 animate-luxury-reveal"
      style={{ viewTransitionName: "persistent-nav" }}
    >
      <div className="relative flex min-h-[4.5rem] items-center justify-between gap-x-4 rounded-full border border-[var(--theme-frame-border)] bg-[var(--theme-header-surface)] px-5 py-2 shadow-[var(--shadow-luxury-card)] backdrop-blur-xl sm:px-8">
        
        {/* Brand Logo & Name */}
        <Link
          className="group inline-flex items-center gap-3 text-[var(--color-brand-strong)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--color-surface)] rounded-full"
          href="/"
          onClick={closeMenu}
        >
          <span
            className="app-header-mark grid h-11 w-11 place-items-center rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-[var(--color-paper)] shadow-[var(--shadow-luxury-glow)] transition-all duration-500 group-hover:rotate-12 group-hover:scale-105 group-hover:shadow-[var(--shadow-luxury-glow-strong)]"
            aria-hidden="true"
          >
            <Heart size={20} fill="currentColor" strokeWidth={1.5} className="transition-transform duration-500 group-hover:scale-110" />
          </span>
          <span className="flex flex-col">
            <span className="font-display text-[1.25rem] font-bold leading-none tracking-tight text-[var(--color-brand-strong)]" translate="no">
              Điều Em Yêu
            </span>
            <span className="mt-0.5 text-[9.5px] font-bold tracking-[0.14em] uppercase text-[var(--color-accent)]">
              bordeaux diary
            </span>
          </span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          aria-controls="primary-navigation"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Đóng điều hướng" : "Mở điều hướng"}
          className="grid h-11 w-11 place-items-center rounded-full border border-[var(--color-border)] text-[var(--color-brand)] transition-all duration-300 hover:border-[var(--color-accent)] hover:bg-[var(--theme-control-hover)] hover:shadow-sm hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] lg:hidden"
          onClick={() => setIsMenuOpen((current) => !current)}
          type="button"
        >
          {isMenuOpen ? <X aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
        </button>

        {/* Desktop & Mobile Navigation Links */}
        <nav
          aria-label="Điều hướng chính"
          className={`${
            isMenuOpen
              ? "absolute left-0 right-0 top-full mt-3 flex flex-col gap-1.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-paper)] p-4 shadow-[0_16px_40px_rgba(49,5,12,0.2)] backdrop-blur-2xl"
              : "hidden lg:flex"
          } items-center gap-x-1 sm:gap-x-2`}
          id="primary-navigation"
        >
          <Link className={linkClassName("catalogue")} href="/#collection" onClick={closeMenu}>
            Bộ sưu tập
          </Link>
          <Link className={linkClassName("journey")} href="/hanh-trinh" onClick={closeMenu}>
            Hành trình
          </Link>
          <Link className={linkClassName("letters")} href="/thu-hen-ngay-mo" onClick={closeMenu}>
            Thư hẹn ngày mở
          </Link>
          {actor.canManageCatalogue ? (
            <Link className={linkClassName("admin")} href="/admin" onClick={closeMenu}>
              Quản trị
            </Link>
          ) : null}
        </nav>

        {/* Actor Info & Owner Badge */}
        <div className="hidden shrink-0 items-center gap-2 text-right sm:flex">
          {actor.canManageCatalogue ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)] bg-[linear-gradient(135deg,var(--color-brand-soft),color-mix(in_srgb,var(--color-paper)_80%,transparent))] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--color-brand-strong)] shadow-[0_2px_8px_rgba(197,160,89,0.15)]">
              <ShieldCheck size={12} className="text-[var(--color-accent)]" aria-hidden="true" />
              Owner
            </span>
          ) : null}
          <span className="max-w-[10rem] truncate text-xs font-semibold text-[var(--color-muted)] lg:max-w-[14rem]">
            {identity}
          </span>
        </div>
      </div>
    </header>
  );
}

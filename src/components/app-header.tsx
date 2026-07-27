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
    return `inline-flex min-h-10 items-center border-b-2 px-1 text-sm font-semibold transition duration-[var(--duration-fast)] motion-reduce:transition-none ${
      activeSection === section
        ? "border-[var(--color-brand)] text-[var(--color-brand)]"
        : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-brand-strong)]"
    }`;
  }

  return (
    <header
      className="app-header border-b border-[var(--color-border)] bg-[var(--theme-header-surface)] backdrop-blur-sm"
      style={{ viewTransitionName: "persistent-nav" }}
    >
      <div className="mx-auto flex min-h-[4.5rem] max-w-7xl flex-wrap items-center justify-between gap-x-5 gap-y-2 px-5 py-2.5 sm:px-8 lg:px-10">
        <Link
          className="group inline-flex items-center gap-3 text-[var(--color-brand-strong)]"
          href="/"
          onClick={closeMenu}
        >
          <span
            className="app-header-mark grid h-10 w-10 place-items-center rounded-[0.95rem] bg-[var(--color-brand)] text-white shadow-[var(--theme-button-shadow)] transition duration-[var(--duration-fast)] group-hover:-rotate-3 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
            aria-hidden="true"
          >
            <Heart size={17} fill="currentColor" strokeWidth={1.7} />
          </span>
          <span>
            <span className="font-display block text-[1.35rem] font-semibold leading-none tracking-[-0.045em]" translate="no">
              Điều Em Yêu
            </span>
            <span className="mt-1 block text-[10px] font-semibold tracking-[0.08em] text-[var(--color-muted)]">
              một cuốn nhật ký riêng
            </span>
          </span>
        </Link>

        <button
          aria-controls="primary-navigation"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Đóng điều hướng" : "Mở điều hướng"}
          className="grid h-11 w-11 place-items-center rounded-full border border-[var(--color-border)] text-[var(--color-brand)] transition hover:border-[var(--color-accent)] hover:bg-[var(--theme-control-hover)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-focus)] active:scale-[0.98] lg:hidden motion-reduce:transform-none motion-reduce:transition-none"
          onClick={() => setIsMenuOpen((current) => !current)}
          type="button"
        >
          {isMenuOpen ? <X aria-hidden="true" size={19} /> : <Menu aria-hidden="true" size={19} />}
        </button>

        <nav
          aria-label="Điều hướng chính"
          className={`${isMenuOpen ? "flex" : "hidden"} order-3 w-full flex-col gap-1 border-t border-[var(--color-border)] pt-2 lg:order-none lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-x-6 lg:border-t-0 lg:p-0`}
          id="primary-navigation"
        >
          <Link
            className={linkClassName("catalogue")}
            href="/#collection"
            onClick={closeMenu}
          >
            Bộ sưu tập
          </Link>
          <Link
            className={linkClassName("journey")}
            href="/hanh-trinh"
            onClick={closeMenu}
          >
            Hành trình
          </Link>
          <Link
            className={linkClassName("letters")}
            href="/thu-hen-ngay-mo"
            onClick={closeMenu}
          >
            Thư hẹn ngày mở
          </Link>
          {actor.canManageCatalogue ? (
            <Link
              className={linkClassName("admin")}
              href="/admin"
              onClick={closeMenu}
            >
              Quản trị
            </Link>
          ) : null}
        </nav>

        <div className="hidden min-w-0 items-center gap-2 text-right sm:flex">
          {actor.canManageCatalogue ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--theme-badge-border)] bg-[var(--color-brand-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.11em] text-[var(--color-brand)]">
              <ShieldCheck size={13} aria-hidden="true" />
              Owner
            </span>
          ) : null}
          <span className="max-w-36 truncate text-xs font-medium text-[var(--color-muted)] sm:max-w-52">
            {identity}
          </span>
        </div>
      </div>
    </header>
  );
}

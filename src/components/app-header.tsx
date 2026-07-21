import Link from "next/link";
import { Heart, ShieldCheck } from "lucide-react";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";

interface AppHeaderProps {
  actor: ActiveActor;
  activeSection?: "catalogue" | "journey" | "letters" | "admin";
}

export function AppHeader({ actor, activeSection = "catalogue" }: AppHeaderProps) {
  const identity = actor.email ?? "Thành viên";

  return (
    <header
      className="border-b border-[var(--color-border)] bg-[var(--theme-header-surface)] backdrop-blur-sm"
      style={{ viewTransitionName: "persistent-nav" }}
    >
      <div className="mx-auto flex min-h-[4.5rem] max-w-7xl flex-wrap items-center justify-between gap-x-5 gap-y-2 px-5 py-2.5 sm:px-8 lg:px-10">
        <Link
          className="group inline-flex items-center gap-2.5 text-[var(--color-brand-strong)]"
          href="/"
        >
          <span
            className="grid h-9 w-9 place-items-center rounded-full bg-[var(--color-brand)] text-white shadow-[var(--theme-button-shadow)] transition duration-[var(--duration-fast)] group-hover:scale-105"
            aria-hidden="true"
          >
            <Heart size={16} fill="currentColor" strokeWidth={1.7} />
          </span>
          <span>
            <span className="font-display block text-xl font-semibold leading-none tracking-[-0.035em]">
              Điều Em Yêu
            </span>
            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
              A small collection
            </span>
          </span>
        </Link>

        <nav aria-label="Điều hướng chính" className="order-3 flex w-full flex-wrap gap-x-5 sm:order-none sm:w-auto">
          <Link
            className={`inline-flex min-h-10 items-center border-b-2 px-1 text-sm font-semibold transition ${
              activeSection === "catalogue"
                ? "border-[var(--color-brand)] text-[var(--color-brand)]"
                : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-brand-strong)]"
            }`}
            href="/#collection"
          >
            Bộ sưu tập
          </Link>
          <Link
            className={`inline-flex min-h-10 items-center border-b-2 px-1 text-sm font-semibold transition ${
              activeSection === "journey"
                ? "border-[var(--color-brand)] text-[var(--color-brand)]"
                : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-brand-strong)]"
            }`}
            href="/hanh-trinh"
          >
            Hành trình
          </Link>
          <Link
            className={`inline-flex min-h-10 items-center border-b-2 px-1 text-sm font-semibold transition ${
              activeSection === "letters"
                ? "border-[var(--color-brand)] text-[var(--color-brand)]"
                : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-brand-strong)]"
            }`}
            href="/thu-hen-ngay-mo"
          >
            Thư hẹn ngày mở
          </Link>
          {actor.canManageCatalogue ? (
            <Link
              className={`inline-flex min-h-10 items-center border-b-2 px-1 text-sm font-semibold transition ${
                activeSection === "admin"
                  ? "border-[var(--color-brand)] text-[var(--color-brand)]"
                  : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-brand-strong)]"
              }`}
              href="/admin"
            >
              Quản trị
            </Link>
          ) : null}
        </nav>

        <div className="flex min-w-0 items-center gap-2 text-right">
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

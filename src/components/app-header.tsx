import Link from "next/link";
import { Heart, ShieldCheck } from "lucide-react";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";

interface AppHeaderProps {
  actor: ActiveActor;
}

export function AppHeader({ actor }: AppHeaderProps) {
  const identity = actor.email ?? "Thành viên";

  return (
    <header className="border-b border-[var(--color-border)] bg-[rgb(255_250_247_/_74%)] backdrop-blur-sm">
      <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3 sm:px-8 lg:px-10">
        <Link
          className="group inline-flex items-center gap-3 text-[var(--color-brand-strong)]"
          href="/"
        >
          <span
            className="grid h-9 w-9 place-items-center rounded-full bg-[var(--color-brand)] text-white shadow-[0_7px_17px_rgb(122_16_37_/_20%)] transition duration-[var(--duration-fast)] group-hover:scale-105"
            aria-hidden="true"
          >
            <Heart size={16} fill="currentColor" strokeWidth={1.7} />
          </span>
          <span>
            <span className="font-display block text-xl font-semibold leading-none tracking-[-0.035em]">
              Điều Em Yêu
            </span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
              A small collection
            </span>
          </span>
        </Link>

        <nav aria-label="Điều hướng chính" className="order-3 w-full sm:order-none sm:w-auto">
          <Link
            className="inline-flex min-h-10 items-center border-b-2 border-[var(--color-brand)] px-1 text-sm font-semibold text-[var(--color-brand)] transition hover:text-[var(--color-brand-strong)]"
            href="/#collection"
          >
            Bộ sưu tập
          </Link>
        </nav>

        <div className="flex min-w-0 items-center gap-2 text-right">
          {actor.canManageCatalogue ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[rgb(122_16_37_/_18%)] bg-[var(--color-brand-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.11em] text-[var(--color-brand)]">
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

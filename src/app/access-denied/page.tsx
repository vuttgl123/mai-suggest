import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export default function AccessDeniedPage() {
  return (
    <main className="diary-shell grid min-h-[100dvh] place-items-center px-5 py-8">
      <section className="diary-wash w-full max-w-lg rounded-[var(--radius-frame)] border border-[var(--color-border)] p-7 text-center shadow-[var(--shadow-card)] sm:p-10">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand)]" aria-hidden="true"><LockKeyhole size={20} strokeWidth={1.4} /></span>
        <p className="mt-5 text-sm font-semibold text-[var(--color-accent)]">
          Chưa có quyền truy cập
        </p>
        <h1 className="font-display mt-4 text-4xl font-semibold text-[var(--color-brand-strong)]">
          Tài khoản này chưa được kích hoạt
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
          Hãy liên hệ chủ sở hữu không gian này để được cấp quyền sử dụng.
        </p>
        <Link
          href="/login"
          className="mt-7 inline-flex min-h-11 items-center rounded-full bg-[var(--color-brand)] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--color-focus)]"
        >
          Dùng tài khoản Google khác
        </Link>
      </section>
    </main>
  );
}

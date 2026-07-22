import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--color-surface)] px-6 text-center">
      <section className="max-w-md rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-paper)] p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
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
          className="mt-7 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--color-brand)] px-5 text-sm font-semibold text-white"
        >
          Dùng tài khoản Google khác
        </Link>
      </section>
    </main>
  );
}

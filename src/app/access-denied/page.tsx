import Link from "next/link";
import { DiaryBook } from "@/components/diary/diary-book";
import { DiarySurface } from "@/components/diary/diary-surface";

export default function AccessDeniedPage() {
  return (
    <DiaryBook className="grid place-items-center px-6 text-center" role="main">
      <DiarySurface className="max-w-md p-8" kind="note">
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
      </DiarySurface>
    </DiaryBook>
  );
}

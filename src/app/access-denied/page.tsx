import Link from "next/link";

/* Polite and specific, without revealing any content or who the members are. */
export default function AccessDeniedPage() {
  return (
    <main className="diary-container grid min-h-[100dvh] content-center py-16">
      <div className="max-w-xl">
        <h1 className="font-display display-lg text-brand-strong">
          Tài khoản này chưa được mời vào không gian.
        </h1>
        <p className="mt-5 text-ink">
          Bạn đã đăng nhập bằng Google, nhưng tài khoản này chưa có trong danh sách được phép.
          Nếu bạn nghĩ đây là nhầm lẫn, hãy nhắn cho người đã mời bạn.
        </p>
        <Link
          className="mt-8 inline-flex min-h-11 items-center rounded-full bg-brand px-5 text-[0.9375rem] font-semibold text-on-brand transition-colors hover:bg-brand-strong"
          href="/login"
        >
          Đăng nhập bằng tài khoản Google khác
        </Link>
      </div>
    </main>
  );
}

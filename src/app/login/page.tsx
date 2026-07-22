import { GoogleSignInButton } from "@/features/identity/components/google-sign-in-button";
import { DiaryBook } from "@/components/diary/diary-book";
import { DiarySurface } from "@/components/diary/diary-surface";
import { normalizeAuthNextPath } from "@/features/identity/lib/auth-navigation";
import { Heart, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<{
    error?: string | string[];
    next?: string | string[];
  }>;
}

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = normalizeAuthNextPath(firstSearchParam(params.next));
  const hasCallbackError =
    firstSearchParam(params.error) === "oauth_callback_failed";

  return (
    <DiaryBook className="grid place-items-center px-5 py-8 sm:px-8 sm:py-12" role="main">
      <DiarySurface className="grid w-full max-w-5xl lg:grid-cols-[0.95fr_1.05fr]" kind="spread">
        <section className="relative overflow-hidden bg-[var(--color-brand-strong)] px-8 py-12 text-white sm:px-12 sm:py-16">
          <div
            className="absolute -right-20 -top-20 h-56 w-56 rounded-full border border-white/15"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[rgb(169_104_82_/_30%)] blur-3xl"
            aria-hidden="true"
          />
          <div className="relative flex min-h-full flex-col">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/12 text-[var(--soft-rose)]">
              <Heart size={19} fill="currentColor" strokeWidth={1.4} aria-hidden="true" />
            </span>
            <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--soft-rose)]">
              Điều Em Yêu
            </p>
            <h1 className="font-display mt-4 max-w-sm text-balance text-5xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-6xl">
              Một góc nhỏ, dành riêng cho em.
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-7 text-white/72 sm:text-base">
              Giữ lại những nơi muốn đến, những điều muốn thử và mọi lựa chọn khiến em vui.
            </p>
            <span className="mt-auto inline-flex items-center gap-2 pt-14 text-xs font-semibold uppercase tracking-[0.14em] text-white/62">
              <Sparkles size={15} aria-hidden="true" />
              Carefully kept
            </span>
          </div>
        </section>

        <section className="diary-surface diary-surface--page px-8 py-12 sm:px-12 sm:py-16">
          <p className="diary-kicker">Chào mừng trở lại</p>
          <h2 className="font-display mt-4 text-balance text-4xl font-semibold tracking-[-0.05em] text-[var(--color-brand-strong)] sm:text-5xl">
            Mình cùng mở lại bộ sưu tập nhé.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-[var(--color-muted)]">
            Đăng nhập bằng tài khoản Google đã được cấp quyền để tiếp tục.
          </p>
          {hasCallbackError ? (
            <p
              className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3 text-sm leading-6 text-[var(--color-danger)]"
              role="alert"
            >
              Phiên đăng nhập không hoàn tất. Hãy thử lại.
            </p>
          ) : null}
          <div className="mt-9 max-w-md">
            <GoogleSignInButton nextPath={nextPath} />
          </div>
        </section>
      </DiarySurface>
    </DiaryBook>
  );
}

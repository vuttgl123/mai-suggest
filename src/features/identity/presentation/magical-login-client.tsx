import { GoogleSignInButton } from "@/features/identity/components/google-sign-in-button";

interface MagicalLoginClientProps {
  nextPath: string;
  hasCallbackError: boolean;
}

/* The door into a private space: the name set large on paper, one clear way in. */
export function MagicalLoginClient({ nextPath, hasCallbackError }: MagicalLoginClientProps) {
  return (
    <main className="diary-container grid min-h-[100dvh] content-center gap-12 py-16 md:grid-cols-12 md:items-end md:gap-x-6">
      <div className="md:col-span-7">
        <p aria-hidden="true" className="wax-seal grid place-items-center text-[#f3e3e0]" style={{ "--seal-size": "2.75rem" } as React.CSSProperties}>
          <svg fill="currentColor" height="16" viewBox="0 0 24 24" width="16">
            <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.9 4.5c2.2 0 3.7 1.2 5.1 3 1.4-1.8 2.9-3 5.1-3 3.9 0 6 3.9 4.5 7.3C19.5 16.4 12 21 12 21z" />
          </svg>
        </p>
        <h1 className="cover-text mt-8 text-brand-strong" translate="no">
          Điều Em Yêu
        </h1>
        <p className="lead-text mt-6 max-w-[34ch] text-ink">
          Một không gian riêng, chỉ dành cho những người được mời.
        </p>
      </div>

      <div className="md:col-span-4 md:col-start-9">
        <div className="archive-label">
          <p className="archive-label__title">Đăng nhập</p>
          <p className="archive-label__line">Dùng tài khoản Google đã được mời vào không gian này.</p>
        </div>
        {hasCallbackError ? (
          <p className="mt-5 rounded-[var(--radius-card)] border border-danger/40 px-4 py-3 text-sm text-danger" role="alert">
            Đăng nhập chưa hoàn tất. Hãy thử lại.
          </p>
        ) : null}
        <div className="mt-6">
          <GoogleSignInButton nextPath={nextPath} />
        </div>
      </div>
    </main>
  );
}

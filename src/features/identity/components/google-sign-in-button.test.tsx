import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/features/identity/components/google-sign-in-button";

vi.mock("@/lib/supabase/client", () => ({
  createBrowserSupabaseClient: vi.fn(),
}));

describe("GoogleSignInButton", () => {
  const signInWithOAuth = vi.fn();

  beforeEach(() => {
    signInWithOAuth.mockResolvedValue({ error: null });
    vi.mocked(createBrowserSupabaseClient).mockReturnValue({
      auth: { signInWithOAuth },
    } as never);
  });

  it("starts the Google PKCE flow with the internal callback path", async () => {
    const user = userEvent.setup();
    render(<GoogleSignInButton nextPath="/catalogue?tag=gift ideas" />);

    await user.click(
      screen.getByRole("button", { name: "Đăng nhập với Google" }),
    );

    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", "/catalogue?tag=gift ideas");

    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: redirectTo.toString(),
      },
    });
  });
});

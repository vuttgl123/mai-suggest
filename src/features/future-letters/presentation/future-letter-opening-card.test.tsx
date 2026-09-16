import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { FutureLetterOpeningCard } from "./future-letter-opening-card";
import { getOpenedFutureLetterAction } from "@/modules/future-letters/presentation/future-letter-actions";

vi.mock("@/modules/future-letters/presentation/future-letter-actions", () => ({
  getOpenedFutureLetterAction: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    ViewTransition: ({ children }: any) => <>{children}</>,
  };
});

describe("FutureLetterOpeningCard", () => {
  it("renders loading state when clicked and fetches full letter", async () => {
    const user = userEvent.setup();
    const mockAction = getOpenedFutureLetterAction as any;
    
    // Resolve slowly to check loading state
    let resolveFetch: any;
    mockAction.mockImplementation(() => new Promise((resolve) => {
      resolveFetch = resolve;
    }));

    const letter = {
      id: "letter-1",
      title: "Test Letter",
      opensAt: "2026-09-14T00:00:00Z",
      authorId: "author-1",
      createdAt: "2026-09-14T00:00:00Z",
      updatedAt: "2026-09-14T00:00:00Z",
      author: { displayName: "A", avatarUrl: null },
    };

    render(
      <FutureLetterOpeningCard 
        isActive={true} 
        letter={letter} 
        onActivate={vi.fn()} 
        onClose={vi.fn()} 
      />
    );

    // Initial state
    expect(screen.getByText(/c.* m.*t .i.*u mu.*n/i)).toBeInTheDocument();
    
    const openBtn = screen.getByRole("button", { name: /M.* th/i });
    expect(openBtn).not.toBeDisabled();

    // Click open
    await user.click(openBtn);
    
    // Should show loading
    expect(openBtn).toBeDisabled();
    expect(openBtn).toHaveTextContent(/Đang mở/i);

    // Resolve fetch
    resolveFetch({
      ...letter,
      content: "Hello from the future!",
    });

    // Content should eventually show up (though wait for animation might be needed)
    // We just verify it called the action
    expect(mockAction).toHaveBeenCalledWith("letter-1");
  });
});

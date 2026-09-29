import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LetterEnvelope } from "./letter-envelope";
import { getOpenedFutureLetterAction } from "@/modules/future-letters/presentation/future-letter-actions";
import type { FutureLetter, FutureLetterSummary } from "@/modules/future-letters/domain/future-letter-models";

vi.mock("@/modules/future-letters/presentation/future-letter-actions", () => ({
  getOpenedFutureLetterAction: vi.fn(),
}));

const openAction = vi.mocked(getOpenedFutureLetterAction);

const summary: FutureLetterSummary = {
  id: "letter-1",
  authorId: "author-1",
  title: "Gửi mùa đông năm sau",
  opensAt: "2026-09-27T13:30:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  author: { displayName: "Huy", avatarUrl: null },
};

const fullLetter: FutureLetter = {
  ...summary,
  content: "Năm nay đã có nhiều ngày khó.",
  imageUrl: null,
  imageAltText: null,
  musicUrl: null,
};

function renderEnvelope() {
  return render(
    <ul>
      <LetterEnvelope letter={summary} />
    </ul>,
  );
}

describe("LetterEnvelope", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.useRealTimers();
  });

  it("shows only the summary until the reader opens the letter", () => {
    renderEnvelope();

    expect(screen.getByText("Gửi mùa đông năm sau")).toBeInTheDocument();
    expect(screen.getByText("Mở lúc 20:30 ngày 27/09/2026")).toBeInTheDocument();
    expect(screen.queryByText(fullLetter.content)).not.toBeInTheDocument();
  });

  it("fetches the letter from the server, then plays the ritual which can be skipped", async () => {
    const user = userEvent.setup();
    openAction.mockResolvedValue(fullLetter);
    renderEnvelope();

    await user.click(screen.getByRole("button", { name: "Mở thư" }));

    expect(openAction).toHaveBeenCalledWith("letter-1");
    const skip = await screen.findByRole("button", { name: "Bỏ qua" });
    await user.click(skip);

    expect(screen.getByText(fullLetter.content)).toBeVisible();
    expect(screen.queryByRole("button", { name: "Bỏ qua" })).not.toBeInTheDocument();
  });

  it("finishes the ritual by itself after about 2.6 seconds", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    openAction.mockResolvedValue(fullLetter);
    renderEnvelope();

    await user.click(screen.getByRole("button", { name: "Mở thư" }));
    await screen.findByRole("button", { name: "Bỏ qua" });
    await act(async () => {
      vi.advanceTimersByTime(2800);
    });

    expect(screen.getByText(fullLetter.content)).toBeVisible();
  });

  it("goes straight to the letter when reduced motion is preferred", async () => {
    const user = userEvent.setup();
    openAction.mockResolvedValue(fullLetter);
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      ...original(query),
      matches: query.includes("reduce"),
    })) as typeof window.matchMedia;

    try {
      renderEnvelope();
      await user.click(screen.getByRole("button", { name: "Mở thư" }));

      expect(await screen.findByText(fullLetter.content)).toBeVisible();
      expect(screen.queryByRole("button", { name: "Bỏ qua" })).not.toBeInTheDocument();
    } finally {
      window.matchMedia = original;
    }
  });

  it("skips the ritual when re-reading on the same device", async () => {
    const user = userEvent.setup();
    openAction.mockResolvedValue(fullLetter);
    window.localStorage.setItem("dieu-em-yeu:letter-ritual-seen", JSON.stringify(["letter-1"]));
    renderEnvelope();

    await user.click(await screen.findByRole("button", { name: "Đọc lại" }));

    expect(await screen.findByText(fullLetter.content)).toBeVisible();
    expect(screen.queryByRole("button", { name: "Bỏ qua" })).not.toBeInTheDocument();
  });

  it("explains when the letter could not be opened and keeps it sealed", async () => {
    const user = userEvent.setup();
    openAction.mockRejectedValue(new Error("NOT_FOUND"));
    renderEnvelope();

    await user.click(screen.getByRole("button", { name: "Mở thư" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Chưa mở được thư này. Hãy thử lại.");
    expect(screen.queryByText(fullLetter.content)).not.toBeInTheDocument();
  });

  it("renders the reading room outside the envelope so it can never be clipped by it", async () => {
    const user = userEvent.setup();
    openAction.mockResolvedValue(fullLetter);
    const original = HTMLDialogElement.prototype.showModal;
    // In-app browsers without showModal fall back to a plain open dialog.
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: undefined });

    try {
      const { container } = renderEnvelope();
      await user.click(screen.getByRole("button", { name: "Mở thư" }));

      const dialog = await screen.findByRole("dialog");
      expect(container.contains(dialog)).toBe(false);
      expect(dialog.parentElement).toBe(document.body);
      expect(dialog).toHaveAttribute("open");
    } finally {
      Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: original });
    }
  });

  it("locks page scrolling while the letter is open and restores it on close", async () => {
    const user = userEvent.setup();
    openAction.mockResolvedValue(fullLetter);
    renderEnvelope();

    await user.click(screen.getByRole("button", { name: "Mở thư" }));
    await user.click(await screen.findByRole("button", { name: "Bỏ qua" }));
    expect(document.documentElement.style.overflow).toBe("hidden");

    await user.click(screen.getByRole("button", { name: "Đóng thư" }));
    expect(document.documentElement.style.overflow).toBe("");
  });
});

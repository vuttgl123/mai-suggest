import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MyItemStatePanel } from "./my-item-state-panel";
import { setMyItemStateAction } from "@/modules/engagement/presentation/engagement-actions";
import { success } from "@/core/application/result";
import type { ItemUserState } from "@/modules/engagement/domain/engagement-models";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/modules/engagement/presentation/engagement-actions", () => ({
  setMyItemStateAction: vi.fn(),
}));

const setState = vi.mocked(setMyItemStateAction);

const savedState: ItemUserState = {
  id: "state-1",
  itemId: "item-1",
  userId: "user-1",
  isFavorite: false,
  state: "want_to_try",
  note: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("MyItemStatePanel", () => {
  it("offers the five personal states with their existing meaning", () => {
    render(<MyItemStatePanel itemId="item-1" state={null} />);

    for (const label of ["Muốn thử", "Đã thử", "Muốn mua", "Đã mua", "Không quan tâm"]) {
      expect(screen.getByRole("radio", { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: "Yêu thích" })).toHaveAttribute("aria-pressed", "false");
  });

  it("marks the saved state as checked", () => {
    render(<MyItemStatePanel itemId="item-1" state={savedState} />);

    expect(screen.getByRole("radio", { name: "Muốn thử" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Đã thử" })).not.toBeChecked();
  });

  it("saves a new state for the current member only", async () => {
    const user = userEvent.setup();
    setState.mockResolvedValue(success({ ...savedState, state: "tried" }));
    render(<MyItemStatePanel itemId="item-1" state={savedState} />);

    await user.click(screen.getByRole("radio", { name: "Đã thử" }));

    expect(setState).toHaveBeenCalledWith({
      itemId: "item-1",
      isFavorite: false,
      state: "tried",
      note: null,
    });
  });

  it("toggles favourite independently of the state", async () => {
    const user = userEvent.setup();
    setState.mockResolvedValue(success({ ...savedState, isFavorite: true }));
    render(<MyItemStatePanel itemId="item-1" state={savedState} />);

    await user.click(screen.getByRole("button", { name: "Yêu thích" }));

    expect(setState).toHaveBeenLastCalledWith({
      itemId: "item-1",
      isFavorite: true,
      state: "want_to_try",
      note: null,
    });
    expect(screen.getByRole("button", { name: "Yêu thích" })).toHaveAttribute("aria-pressed", "true");
  });

  it("can clear the chosen state", async () => {
    const user = userEvent.setup();
    setState.mockResolvedValue(success({ ...savedState, state: "none" }));
    render(<MyItemStatePanel itemId="item-1" state={savedState} />);

    await user.click(screen.getByRole("button", { name: "Bỏ chọn trạng thái" }));

    expect(setState).toHaveBeenLastCalledWith(expect.objectContaining({ state: "none" }));
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "./dialog";

describe("Dialog", () => {
  it("provides dialog semantics and closes from the backdrop", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Dialog
        open
        titleId="dialog-title"
        descriptionId="dialog-description"
        onClose={onClose}
      >
        <h2 id="dialog-title">Chi tiết món quà</h2>
        <p id="dialog-description">Nội dung</p>
        <button type="button">Đóng</button>
      </Dialog>,
    );

    const dialog = screen.getByRole("dialog", { name: "Chi tiết món quà" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    await user.click(dialog.parentElement!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders nothing while closed", () => {
    render(
      <Dialog open={false} titleId="title" onClose={() => undefined}>
        <h2 id="title">Ẩn</h2>
      </Dialog>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

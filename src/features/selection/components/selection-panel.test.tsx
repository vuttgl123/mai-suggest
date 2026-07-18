import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SelectionPanel } from "./selection-panel";

describe("SelectionPanel", () => {
  it("keeps one dialog, one accessible title and one close action", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <SelectionPanel
        open
        title="Những điều em yêu"
        description="Các lựa chọn đã lưu"
        onClose={onClose}
      >
        <p>Nội dung panel</p>
      </SelectionPanel>,
    );

    expect(
      screen.getAllByRole("dialog", { name: "Những điều em yêu" }),
    ).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Đóng phần tổng kết" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

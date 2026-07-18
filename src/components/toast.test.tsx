import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Toast } from "./toast";

describe("Toast", () => {
  it("offers an optional action without moving focus", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();

    render(
      <Toast
        message="Đã bỏ lựa chọn"
        action={{ label: "Hoàn tác", onClick: onAction }}
        onDismiss={vi.fn()}
      />,
    );

    expect(trigger).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Hoàn tác" }));
    expect(onAction).toHaveBeenCalledOnce();
  });
});

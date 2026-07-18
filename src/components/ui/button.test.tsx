import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { X } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";
import { IconButton } from "./icon-button";

describe("Button", () => {
  it("keeps the native disabled behavior", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Lưu
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "Lưu" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("defaults to a non-submitting button and composes a custom class", () => {
    render(<Button className="consumer-class">Tiếp tục</Button>);

    const button = screen.getByRole("button", { name: "Tiếp tục" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("consumer-class");
  });
});

describe("IconButton", () => {
  it("exposes an accessible label and tooltip", () => {
    render(<IconButton label="Đóng" icon={<X aria-hidden="true" />} />);

    const button = screen.getByRole("button", { name: "Đóng" });
    expect(button).toHaveAttribute("title", "Đóng");
    expect(button).toHaveAttribute("type", "button");
  });
});

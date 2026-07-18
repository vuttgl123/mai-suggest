import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useDialogLifecycle } from "./use-dialog-lifecycle";

function Harness({ open, onClose }: { open: boolean; onClose(): void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  useDialogLifecycle({ open, onClose, containerRef, initialFocusRef });

  return (
    <div>
      <button type="button">Bên ngoài</button>
      {open && (
        <div ref={containerRef}>
          <button ref={initialFocusRef} type="button">
            Đầu tiên
          </button>
          <button type="button">Cuối cùng</button>
        </div>
      )}
    </div>
  );
}

describe("useDialogLifecycle", () => {
  it("locks scroll, focuses initially, handles Escape and restores focus", () => {
    const onClose = vi.fn();
    const view = render(<Harness open={false} onClose={onClose} />);
    const outside = screen.getByRole("button", { name: "Bên ngoài" });
    outside.focus();

    view.rerender(<Harness open onClose={onClose} />);
    expect(screen.getByRole("button", { name: "Đầu tiên" })).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();

    view.rerender(<Harness open={false} onClose={onClose} />);
    expect(document.body.style.overflow).toBe("");
    expect(outside).toHaveFocus();
  });

  it("wraps Tab and Shift+Tab inside the container", () => {
    const view = render(<Harness open={false} onClose={() => undefined} />);
    view.rerender(<Harness open onClose={() => undefined} />);
    const first = screen.getByRole("button", { name: "Đầu tiên" });
    const last = screen.getByRole("button", { name: "Cuối cùng" });

    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(first).toHaveFocus();

    first.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();
  });
});

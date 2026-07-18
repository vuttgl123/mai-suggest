import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResumeSelection } from "./resume-selection";

describe("ResumeSelection", () => {
  it("renders nothing without a hydrated selection model", () => {
    const { container } = render(
      <ResumeSelection
        model={null}
        onContinue={() => undefined}
        onViewSummary={() => undefined}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("summarizes saved work and exposes both next actions", async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    const onViewSummary = vi.fn();
    render(
      <ResumeSelection
        model={{
          selectedItemCount: 2,
          selectedCategoryCount: 1,
          updatedAt: "2026-07-16T08:00:00.000Z",
        }}
        onContinue={onContinue}
        onViewSummary={onViewSummary}
      />,
    );

    expect(screen.getByText(/2 gợi ý trong 1 danh mục/)).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Tiếp tục chọn" }));
    await user.click(screen.getByRole("button", { name: "Xem tổng kết" }));
    expect(onContinue).toHaveBeenCalledOnce();
    expect(onViewSummary).toHaveBeenCalledOnce();
  });
});

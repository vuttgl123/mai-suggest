import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SelectionSummaryActions } from "./selection-summary-actions";

describe("SelectionSummaryActions", () => {
  it("keeps one primary share action and exposes secondary commands", async () => {
    const user = userEvent.setup();
    const onShare = vi.fn();
    const onDownload = vi.fn();

    render(
      <SelectionSummaryActions
        hasContent
        emailUrl="mailto:hello@example.com"
        onShare={onShare}
        onCopy={vi.fn()}
        onDownload={onDownload}
        onContinue={vi.fn()}
        onRequestReset={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Chia sẻ" }));
    expect(onShare).toHaveBeenCalledOnce();

    await user.click(screen.getByText("Cách khác"));
    await user.click(screen.getByRole("button", { name: "Tải file văn bản" }));
    expect(onDownload).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: "Gửi qua email" })).toHaveAttribute(
      "href",
      "mailto:hello@example.com",
    );
  });
});

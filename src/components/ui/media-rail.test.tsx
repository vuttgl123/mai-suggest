import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MediaRailControls } from "@/components/ui/media-rail";

function renderRail(frameClassName: string) {
  document.body.innerHTML = `
    <div id="rail-viewport">
      <div class="${frameClassName}">một</div>
      <div class="${frameClassName}">hai</div>
    </div>
  `;

  return render(
    <MediaRailControls
      frameClassName={frameClassName}
      groupLabel="Điều hướng chương"
      nextLabel="Chương tiếp theo"
      previousLabel="Chương trước"
      viewportId="rail-viewport"
    />,
  );
}

describe("MediaRailControls", () => {
  it("labels its group and buttons from props", () => {
    renderRail("chapter-rail-frame");

    expect(screen.getByRole("group", { name: "Điều hướng chương" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Chương trước" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Chương tiếp theo" })).toBeInTheDocument();
  });

  it("points both buttons at the viewport it controls", () => {
    renderRail("chapter-rail-frame");

    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveAttribute("aria-controls", "rail-viewport");
    }
  });

  it("disables both directions when the viewport does not overflow", () => {
    renderRail("chapter-rail-frame");

    expect(screen.getByRole("button", { name: "Chương trước" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Chương tiếp theo" })).toBeDisabled();
  });
});

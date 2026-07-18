import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CatalogueToolbar } from "./catalogue-toolbar";

describe("CatalogueToolbar", () => {
  it("announces result, filter and selection state through named commands", async () => {
    const user = userEvent.setup();
    const onOpenFilters = vi.fn();
    const onOpenSelection = vi.fn();
    render(
      <CatalogueToolbar
        activeCategoryName="Túi xách"
        resultCount={12}
        activeFilterCount={2}
        selectedItemCount={3}
        viewMode="all"
        onViewModeChange={vi.fn()}
        onOpenFilters={onOpenFilters}
        onOpenSelection={onOpenSelection}
      />,
    );

    expect(screen.getByText("Túi xách")).toBeVisible();
    expect(screen.getByText("12 gợi ý")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Mở 2 bộ lọc đang dùng" }));
    await user.click(screen.getByRole("button", { name: "Xem 3 lựa chọn" }));
    expect(onOpenFilters).toHaveBeenCalledOnce();
    expect(onOpenSelection).toHaveBeenCalledOnce();
  });
});

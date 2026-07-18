import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { SelectedCategory } from "@/features/selection/lib/selection-selectors";
import { SelectedItemsView } from "./selected-items-view";

const selected: SelectedCategory[] = [
  {
    category: {
      id: "gifts",
      name: "Quà tặng",
      description: "",
      notePlaceholder: "",
      items: [],
    },
    items: [
      {
        id: "gift-1",
        name: "Bó hoa",
        imageUrl: "https://example.com/gift.jpg",
        imageAlt: "Bó hoa",
      } as SelectedCategory["items"][number],
    ],
    favoriteItemId: "gift-1",
    note: "Ưu tiên hoa đỏ",
  },
];

describe("SelectedItemsView", () => {
  it("shows an empty state with a route back to all suggestions", async () => {
    const user = userEvent.setup();
    const onShowAll = vi.fn();
    render(
      <SelectedItemsView
        selectedCategories={[]}
        onShowAll={onShowAll}
        onRemove={() => undefined}
        onToggleFavorite={() => undefined}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Xem tất cả gợi ý" }));
    expect(onShowAll).toHaveBeenCalledOnce();
  });

  it("shows favorite and supports removing an item", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <SelectedItemsView
        selectedCategories={selected}
        onShowAll={() => undefined}
        onRemove={onRemove}
        onToggleFavorite={() => undefined}
      />,
    );

    expect(screen.getByText("Lựa chọn số một")).toBeVisible();
    expect(screen.getByText("Ưu tiên hoa đỏ")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Bỏ Bó hoa khỏi lựa chọn" }));
    expect(onRemove).toHaveBeenCalledWith("gifts", "gift-1");
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PreferenceGrid } from "@/components/preference-grid";
import type { PreferenceCategory, PreferenceItem } from "@/types/preference";

function item(id: string): PreferenceItem {
  return {
    id,
    name: `Gợi ý ${id}`,
    description: "Mô tả",
    whyItFits: "Lý do phù hợp",
    imageUrl: `https://example.com/${id}.jpg`,
    imageAlt: `Gợi ý ${id}`,
    messageTitle: "Lời nhắn",
    message: "Nội dung",
    tags: ["Tinh tế", "Thiết thực"],
    occasions: ["ngay-thuong"],
    styles: ["toi-gian"],
    budgetTier: "duoi-500k",
    giftType: "vat-pham",
  };
}

function category(id: string, itemCount: number): PreferenceCategory {
  return {
    id,
    name: id,
    description: "Mô tả",
    notePlaceholder: "Ghi chú",
    items: Array.from({ length: itemCount }, (_, index) => item(`${id}-${index}`)),
  };
}

describe("PreferenceGrid", () => {
  it("resets visible count when category or filtered results change", async () => {
    const user = userEvent.setup();
    const first = category("gifts", 10);
    const view = render(
      <PreferenceGrid
        category={first}
        items={first.items}
        categoryIndex={0}
        likedItemIds={[]}
        onToggleLiked={vi.fn()}
        onToggleFavorite={vi.fn()}
      />,
    );

    expect(screen.getByText("8/10")).toBeVisible();
    const loadMore = screen.getByRole("button", { name: "Xem thêm 2 gợi ý" });
    await user.click(loadMore);
    expect(screen.getByText("10/10")).toBeVisible();
    expect(screen.getByRole("button", { name: "Đã hiển thị tất cả" })).toHaveFocus();

    const second = category("bags", 9);
    view.rerender(
      <PreferenceGrid
        category={second}
        items={second.items}
        categoryIndex={1}
        likedItemIds={[]}
        onToggleLiked={vi.fn()}
        onToggleFavorite={vi.fn()}
      />,
    );
    expect(screen.getByText("8/9")).toBeVisible();
    expect(screen.getByRole("button", { name: "Xem thêm 1 gợi ý" })).toBeVisible();
  });
});

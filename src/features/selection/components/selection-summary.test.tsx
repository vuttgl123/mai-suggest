import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SelectionSummary } from "@/features/selection/components/selection-summary";
import type {
  PreferenceData,
  PreferenceSelectionState,
} from "@/types/preference";

const data: PreferenceData = {
  site: {
    title: "Điều Em Yêu",
    recipientName: "Em",
    eyebrow: "Gợi ý",
    heroMessage: "Lời mở đầu",
    heroSubMessage: "Lời phụ",
    heroImage: "https://example.com/hero.jpg",
    summaryEmail: "hello@example.com",
  },
  taxonomy: { occasions: [], styles: [], budgets: [], giftTypes: [] },
  collections: [],
  categories: [
    {
      id: "gifts",
      name: "Quà và những bất ngờ",
      description: "Mô tả",
      notePlaceholder: "Ghi chú",
      items: [
        {
          id: "gift-1",
          name: "Bó hoa theo mùa",
          description: "Mô tả",
          whyItFits: "Phù hợp",
          imageUrl: "https://example.com/gift.jpg",
          imageAlt: "Bó hoa theo mùa",
          messageTitle: "Lời nhắn",
          message: "Nội dung",
          tags: ["Tinh tế", "Thiết thực"],
          occasions: ["ngay-thuong"],
          styles: ["toi-gian"],
          budgetTier: "duoi-500k",
          giftType: "vat-pham",
        },
      ],
    },
  ],
};

const selection: PreferenceSelectionState = {
  schemaVersion: 2,
  likedItemIds: ["gift-1"],
  favoriteByCategory: { gifts: "gift-1" },
  notesByCategory: { gifts: "Ưu tiên màu đỏ" },
  lastViewedCategoryId: "gifts",
  updatedAt: "2026-07-16T00:00:00.000Z",
};

function renderSummary() {
  const onClose = vi.fn();
  const onReset = vi.fn();
  const onNotify = vi.fn();
  const onRemove = vi.fn();
  const onToggleFavorite = vi.fn();
  const onSetCategoryNote = vi.fn();
  render(
    <SelectionSummary
      open
      data={data}
      selection={selection}
      onClose={onClose}
      onReset={onReset}
      onNotify={onNotify}
      onRemove={onRemove}
      onToggleFavorite={onToggleFavorite}
      onSetCategoryNote={onSetCategoryNote}
    />,
  );

  return {
    onClose,
    onReset,
    onNotify,
    onRemove,
    onToggleFavorite,
    onSetCategoryNote,
  };
}

describe("SelectionSummary", () => {
  it("shows the selected item, favorite marker and note", () => {
    renderSummary();

    expect(
      screen.getByRole("dialog", { name: "Những điều em yêu" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Bó hoa theo mùa")).toBeInTheDocument();
    expect(screen.getByText("Yêu thích nhất")).toBeInTheDocument();
    expect(screen.getByText("Ưu tiên màu đỏ")).toBeInTheDocument();
  });

  it("closes from the explicit close action", async () => {
    const user = userEvent.setup();
    const { onClose } = renderSummary();

    await user.click(screen.getByRole("button", { name: "Đóng phần tổng kết" }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("requires confirmation before reset", async () => {
    const user = userEvent.setup();
    const { onReset } = renderSummary();

    await user.click(screen.getByText("Cách khác"));
    await user.click(screen.getByRole("button", { name: "Làm lại từ đầu" }));
    expect(
      screen.getByRole("alertdialog", { name: "Mình bắt đầu lại nhé?" }),
    ).toBeVisible();
    await user.click(
      screen.getAllByRole("button", { name: "Làm lại từ đầu" }).at(-1)!,
    );

    expect(onReset).toHaveBeenCalledOnce();
  });

  it("edits selected items without leaving the summary", async () => {
    const user = userEvent.setup();
    const { onRemove, onToggleFavorite, onSetCategoryNote } = renderSummary();

    await user.click(
      screen.getByRole("button", { name: "Bỏ Bó hoa theo mùa khỏi lựa chọn" }),
    );
    await user.click(
      screen.getByRole("button", {
        name: "Bỏ Bó hoa theo mùa khỏi lựa chọn số một",
      }),
    );
    fireEvent.change(
      screen.getByRole("textbox", { name: "Lời nhắn của em" }),
      { target: { value: "Thêm thiệp viết tay" } },
    );

    expect(onRemove).toHaveBeenCalledWith("gifts", "gift-1");
    expect(onToggleFavorite).toHaveBeenCalledWith("gifts", "gift-1");
    expect(onSetCategoryNote).toHaveBeenLastCalledWith(
      "gifts",
      "Thêm thiệp viết tay",
    );
  });
});

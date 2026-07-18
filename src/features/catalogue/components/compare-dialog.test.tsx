import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { PreferenceItem } from "@/types/preference";
import { CompareDialog } from "./compare-dialog";

function item(id: string, name: string): PreferenceItem {
  return {
    id,
    name,
    description: `Mô tả ${name}`,
    whyItFits: `Lý do chọn ${name}`,
    imageUrl: `https://example.com/${id}.jpg`,
    imageAlt: name,
    brand: "Thương hiệu thật",
    referencePrice: "Khoảng 500.000 đ",
    sourceName: "Nguồn tham khảo",
    sourceUrl: "https://example.com/source",
    messageTitle: "Lời nhắn",
    message: "Nội dung",
    tags: ["Tinh tế", "Thiết thực"],
    occasions: ["ngay-thuong"],
    styles: ["toi-gian"],
    budgetTier: "duoi-500k",
    giftType: "vat-pham",
  };
}

describe("CompareDialog", () => {
  it("compares only real item fields and closes accessibly", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <CompareDialog
        open
        items={[item("one", "Bó hoa"), item("two", "Túi nhỏ")]}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole("dialog", { name: "So sánh gợi ý" })).toBeVisible();
    expect(screen.getByText("Bó hoa")).toBeVisible();
    expect(screen.getByText("Lý do chọn Túi nhỏ")).toBeVisible();
    expect(screen.getAllByRole("link", { name: "Nguồn tham khảo" })).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Đóng so sánh" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

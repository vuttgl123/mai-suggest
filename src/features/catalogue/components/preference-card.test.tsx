import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PreferenceCard } from "@/components/preference-card";
import type { PreferenceItem } from "@/types/preference";

const item: PreferenceItem = {
  id: "gift-1",
  name: "Bó hoa theo mùa",
  description: "Mô tả",
  whyItFits: "Màu sắc có thể chọn theo sở thích.",
  imageUrl: "https://example.com/gift.jpg",
  imageAlt: "Bó hoa theo mùa",
  brand: "Tiệm hoa",
  messageTitle: "Lời nhắn",
  message: "Nội dung",
  tags: ["Tinh tế", "Thiết thực"],
  occasions: ["ngay-thuong"],
  styles: ["toi-gian"],
  budgetTier: "duoi-500k",
  giftType: "vat-pham",
};

describe("PreferenceCard", () => {
  it("keeps like independent from opening detail", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onToggleLiked = vi.fn();
    render(
      <PreferenceCard
        item={item}
        isLiked={false}
        isFavorite={false}
        onOpen={onOpen}
        onToggleLiked={onToggleLiked}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Thích Bó hoa theo mùa" }));
    expect(onToggleLiked).toHaveBeenCalledOnce();
    expect(onOpen).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Mở chi tiết Bó hoa theo mùa" }));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("keeps the like action unavailable until saved choices hydrate", () => {
    render(
      <PreferenceCard
        item={item}
        isLiked={false}
        isFavorite={false}
        selectionReady={false}
        onOpen={() => undefined}
        onToggleLiked={() => undefined}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Thích Bó hoa theo mùa" }),
    ).toBeDisabled();
  });

  it("shows favorite as stable status instead of a competing card action", () => {
    render(
      <PreferenceCard
        item={item}
        isLiked
        isFavorite
        onOpen={() => undefined}
        onToggleLiked={() => undefined}
      />,
    );

    expect(screen.getByText("Lựa chọn số một")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /lựa chọn số một/i }),
    ).not.toBeInTheDocument();
  });
});

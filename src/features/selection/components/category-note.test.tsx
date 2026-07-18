import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryNote } from "@/components/category-note";

describe("CategoryNote", () => {
  it("labels the note, enforces its limit and confirms local persistence", () => {
    render(
      <CategoryNote
        categoryId="gifts"
        categoryName="Quà tặng"
        placeholder="Viết thêm"
        value="Một lời nhắn"
        persistenceStatus="saved"
        onChange={vi.fn()}
      />,
    );

    const note = screen.getByRole("textbox", {
      name: "Điều em muốn nhắn thêm về quà tặng",
    });
    expect(note).toHaveAttribute("maxlength", "500");
    expect(screen.getByText("12/500")).toBeInTheDocument();
    expect(screen.getByText("Đã lưu trên thiết bị này")).toBeInTheDocument();
  });

  it("states directly when local persistence is unavailable", () => {
    render(
      <CategoryNote
        categoryId="gifts"
        categoryName="Quà tặng"
        placeholder="Viết thêm"
        value=""
        persistenceStatus="unavailable"
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Không thể lưu trên thiết bị này"),
    ).toBeInTheDocument();
  });
});

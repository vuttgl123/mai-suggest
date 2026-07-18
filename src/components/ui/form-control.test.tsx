import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterChip } from "./filter-chip";
import { FieldLabel, SelectControl, TextAreaControl } from "./form-control";

describe("form controls", () => {
  it("keeps native label associations", () => {
    render(
      <>
        <FieldLabel htmlFor="style">Phong cách</FieldLabel>
        <SelectControl id="style" defaultValue="">
          <option value="">Tất cả</option>
        </SelectControl>
        <FieldLabel htmlFor="note">Lời nhắn</FieldLabel>
        <TextAreaControl id="note" />
      </>,
    );

    expect(screen.getByRole("combobox", { name: "Phong cách" })).toBeVisible();
    expect(screen.getByRole("textbox", { name: "Lời nhắn" })).toBeVisible();
  });
});

describe("FilterChip", () => {
  it("exposes selected state and supports keyboard activation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <FilterChip selected onClick={onClick}>
        Kỷ niệm
      </FilterChip>,
    );

    const chip = screen.getByRole("button", { name: "Kỷ niệm" });
    expect(chip).toHaveAttribute("aria-pressed", "true");
    chip.focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
  });
});

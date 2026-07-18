import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CataloguePageShell } from "./catalogue-page-shell";
import { SiteHeader } from "./site-header";

describe("CataloguePageShell", () => {
  it("has one main landmark and a working skip link", () => {
    render(
      <CataloguePageShell
        hero={<section>Hero</section>}
        siteHeader={<header>Header</header>}
        footer={<footer>Footer</footer>}
      >
        <section>Catalogue</section>
      </CataloguePageShell>,
    );

    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /bỏ qua/i })).toHaveAttribute(
      "href",
      "#catalogue-start",
    );
  });
});

describe("SiteHeader", () => {
  it("exposes direct navigation and the current selection", async () => {
    const user = userEvent.setup();
    const onOpenSelection = vi.fn();
    render(
      <SiteHeader
        title="Điều Em Yêu"
        selectedItemCount={3}
        onOpenSelection={onOpenSelection}
      />,
    );

    expect(screen.getByRole("banner")).toBeVisible();
    expect(screen.getByRole("link", { name: "Bộ lọc" })).toHaveAttribute(
      "href",
      "#discovery",
    );
    expect(screen.getByRole("link", { name: "Danh mục" })).toHaveAttribute(
      "href",
      "#catalogue-start",
    );
    await user.click(screen.getByRole("button", { name: "Xem 3 lựa chọn" }));
    expect(onOpenSelection).toHaveBeenCalledOnce();
  });
});

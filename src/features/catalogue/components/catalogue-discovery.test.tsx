import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CatalogueFilters } from "@/features/catalogue/lib/catalogue-query";
import type {
  PreferenceCollection,
  PreferenceTaxonomy,
} from "@/types/preference";
import { CatalogueDiscovery } from "./catalogue-discovery";

const taxonomy: PreferenceTaxonomy = {
  occasions: [{ id: "sinh-nhat", label: "Sinh nhật" }],
  styles: [{ id: "toi-gian", label: "Tối giản" }],
  budgets: [{ id: "duoi-500k", label: "Dưới 500 nghìn" }],
  giftTypes: [{ id: "vat-pham", label: "Món đồ" }],
};

const collections: PreferenceCollection[] = [
  {
    id: "ngay-dac-biet",
    name: "Ngày đặc biệt",
    description: "Gợi ý cho dịp quan trọng",
    occasionIds: ["sinh-nhat"],
    itemIds: ["gift-1"],
    imageUrl: "https://example.com/collection.jpg",
    imageAlt: "Bộ sưu tập ngày đặc biệt",
  },
];

const filters: CatalogueFilters = {
  query: "",
  occasionIds: [],
  styleId: "",
  budgetTier: "",
  giftType: "",
  collectionId: "",
  sort: "recommended",
};

function renderDiscovery(overrides: Partial<CatalogueFilters> = {}) {
  const callbacks = {
    onQueryChange: vi.fn(),
    onToggleOccasion: vi.fn(),
    onStyleChange: vi.fn(),
    onBudgetChange: vi.fn(),
    onGiftTypeChange: vi.fn(),
    onSelectCollection: vi.fn(),
    onSortChange: vi.fn(),
    onClear: vi.fn(),
  };
  render(
    <CatalogueDiscovery
      taxonomy={taxonomy}
      collections={collections}
      filters={{ ...filters, ...overrides }}
      resultCount={1}
      totalItemCount={4}
      activeFilterCount={Object.keys(overrides).length}
      {...callbacks}
    />,
  );
  return callbacks;
}

describe("CatalogueDiscovery", () => {
  it("keeps search, collection, filters, sort and result state wired", async () => {
    const user = userEvent.setup();
    const callbacks = renderDiscovery();

    fireEvent.change(screen.getByRole("searchbox", { name: "Tìm kiếm gợi ý quà" }), {
      target: { value: "hoa" },
    });
    await user.click(screen.getByRole("button", { name: /Ngày đặc biệt/ }));
    await user.click(screen.getByRole("button", { name: "Sinh nhật" }));
    await user.selectOptions(screen.getByRole("combobox", { name: "Phong cách" }), "toi-gian");
    await user.selectOptions(screen.getByRole("combobox", { name: "Sắp xếp" }), "name");

    expect(callbacks.onQueryChange).toHaveBeenLastCalledWith("hoa");
    expect(callbacks.onSelectCollection).toHaveBeenCalledWith("ngay-dac-biet");
    expect(callbacks.onToggleOccasion).toHaveBeenCalledWith("sinh-nhat");
    expect(callbacks.onStyleChange).toHaveBeenCalledWith("toi-gian");
    expect(callbacks.onSortChange).toHaveBeenCalledWith("name");
    expect(screen.getByText(/1\/4 gợi ý/)).toBeVisible();
  });

  it("removes one active filter and opens the mobile drawer", async () => {
    const user = userEvent.setup();
    const callbacks = renderDiscovery({ budgetTier: "duoi-500k" });

    await user.click(
      screen.getByRole("button", {
        name: "Bỏ bộ lọc ngân sách Dưới 500 nghìn",
      }),
    );
    expect(callbacks.onBudgetChange).toHaveBeenCalledWith("");

    await user.click(screen.getByRole("button", { name: "Mở bộ lọc" }));
    expect(screen.getByRole("dialog", { name: "Bộ lọc gợi ý" })).toBeVisible();
  });
});

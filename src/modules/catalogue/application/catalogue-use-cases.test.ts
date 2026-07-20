import { describe, expect, it, vi } from "vitest";
import { success } from "@/core/application/result";
import type { CatalogueReader } from "@/modules/catalogue/application/catalogue-reader";
import { GetVisibleItemDetail } from "@/modules/catalogue/application/get-visible-item-detail";
import { ListVisibleCategories } from "@/modules/catalogue/application/list-visible-categories";
import { ListVisibleItems } from "@/modules/catalogue/application/list-visible-items";

const anonymousActor = {
  status: "anonymous" as const,
  userId: null,
  email: null,
  role: null,
  canManageCatalogue: false,
} as const;

const inactiveActor = {
  status: "inactive" as const,
  userId: "member-id",
  email: "member@example.com",
  role: "member" as const,
  canManageCatalogue: false,
} as const;

const activeActor = {
  status: "active" as const,
  userId: "member-id",
  email: "member@example.com",
  role: "member" as const,
  canManageCatalogue: false,
} as const;

function createReader(overrides: Partial<CatalogueReader> = {}): CatalogueReader {
  return {
    listCategories: vi.fn(async () => success([])),
    listItems: vi.fn(async () => success([])),
    findItemDetailBySlug: vi.fn(async () => success(null)),
    ...overrides,
  };
}

describe("catalogue use cases", () => {
  it("does not query categories for an anonymous actor", async () => {
    const reader = createReader();
    const useCase = new ListVisibleCategories(reader);

    await expect(useCase.execute(anonymousActor)).resolves.toEqual({
      ok: false,
      error: { code: "UNAUTHENTICATED" },
    });
    expect(reader.listCategories).not.toHaveBeenCalled();
  });

  it("does not query items for an inactive actor", async () => {
    const reader = createReader();
    const useCase = new ListVisibleItems(reader);

    await expect(useCase.execute(inactiveActor, { categorySlug: "travel" })).resolves.toEqual({
      ok: false,
      error: { code: "ACCESS_DENIED" },
    });
    expect(reader.listItems).not.toHaveBeenCalled();
  });

  it("returns a visible item list from the reader for an active actor", async () => {
    const item = {
      id: "item-id",
      categoryId: "category-id",
      slug: "tea-house",
      kind: "place" as const,
      title: "Tea house",
      summary: null,
      priceLabel: null,
      primaryImage: null,
    };
    const reader = createReader({ listItems: vi.fn(async () => success([item])) });
    const useCase = new ListVisibleItems(reader);

    await expect(useCase.execute(activeActor, {})).resolves.toEqual(success([item]));
  });

  it("returns not found when an active actor requests a non-visible item", async () => {
    const reader = createReader();
    const useCase = new GetVisibleItemDetail(reader);

    await expect(useCase.execute(activeActor, "private-item")).resolves.toEqual({
      ok: false,
      error: { code: "NOT_FOUND" },
    });
  });
});

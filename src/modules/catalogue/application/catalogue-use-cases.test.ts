import { describe, expect, it, vi } from "vitest";
import { success } from "@/core/application/result";
import type { CatalogueReader } from "@/modules/catalogue/application/catalogue-reader";
import { GetVisibleItemDetail } from "@/modules/catalogue/application/get-visible-item-detail";
import { ListVisibleCategories } from "@/modules/catalogue/application/list-visible-categories";

const anonymousActor = {
  status: "anonymous" as const,
  userId: null,
  email: null,
  role: null,
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
    listItemPage: vi.fn(async () =>
      success({ items: [], page: 1, pageSize: 6, total: 0, pageCount: 0 }),
    ),
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

  it("returns not found when an active actor requests a non-visible item", async () => {
    const reader = createReader();
    const useCase = new GetVisibleItemDetail(reader);

    await expect(useCase.execute(activeActor, "private-item")).resolves.toEqual({
      ok: false,
      error: { code: "NOT_FOUND" },
    });
  });
});

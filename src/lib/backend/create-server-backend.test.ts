import { expect, it, vi } from "vitest";
import { GetCurrentActor } from "@/modules/identity/application/get-current-actor";
import { GetVisibleItemDetail } from "@/modules/catalogue/application/get-visible-item-detail";
import { ListVisibleCategories } from "@/modules/catalogue/application/list-visible-categories";
import { ListVisibleItems } from "@/modules/catalogue/application/list-visible-items";
import { createBackendForClient } from "@/lib/backend/create-server-backend";

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(),
}));

it("composes identity and catalogue use cases with one server client", () => {
  const backend = createBackendForClient({} as never);

  expect(backend.getCurrentActor).toBeInstanceOf(GetCurrentActor);
  expect(backend.listVisibleCategories).toBeInstanceOf(ListVisibleCategories);
  expect(backend.listVisibleItems).toBeInstanceOf(ListVisibleItems);
  expect(backend.getVisibleItemDetail).toBeInstanceOf(GetVisibleItemDetail);
});

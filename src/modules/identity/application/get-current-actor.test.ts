import { expect, it, vi } from "vitest";
import { success } from "@/core/application/result";
import { GetCurrentActor } from "@/modules/identity/application/get-current-actor";

it("returns the current actor supplied by its reader port", async () => {
  const expected = success({
    status: "anonymous" as const,
    userId: null,
    email: null,
    role: null,
    canManageCatalogue: false as const,
  });
  const reader = { readCurrentActor: vi.fn(async () => expected) };
  const useCase = new GetCurrentActor(reader);

  await expect(useCase.execute()).resolves.toEqual(expected);
  expect(reader.readCurrentActor).toHaveBeenCalledOnce();
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FutureLetterReader } from "./future-letter-reader";
import type { ActiveActor } from "@/modules/identity/domain/current-actor";
import { ListFutureMailbox } from "./list-future-mailbox";
import { GetOpenedFutureLetter } from "./get-opened-future-letter";
import type { FutureLetter, FutureLetterSummary } from "../domain/future-letter-models";
import type { FutureLetterRepository } from "./future-letter-repository";
import { ListManagedFutureLetters } from "./list-managed-future-letters";
import { ManageFutureLetters } from "./manage-future-letters";
import { success, failure } from "@/core/application/result";

describe("future-letter-use-cases", () => {
  let mockReader: import("vitest").Mocked<FutureLetterReader>;
  const mockActor: ActiveActor = { 
    status: "active",
    userId: "user-1", 
    email: "test@example.com", 
    role: "member",
    canManageCatalogue: false,
  };

  beforeEach(() => {
    mockReader = {
      listOpened: vi.fn(),
      listManaged: vi.fn(),
      listOwnScheduled: vi.fn(),
      listMailbox: vi.fn(),
      getOpened: vi.fn(),
      getOwnScheduled: vi.fn(),
    };
  });

  describe("ListFutureMailbox", () => {
    it("returns mapped page object", async () => {
      const summary: FutureLetterSummary = {
        id: "l1",
        title: "Test",
        opensAt: "2026-01-01T00:00:00Z",
        authorId: "u2",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
        author: { displayName: "A", avatarUrl: null },
      };
      
      mockReader.listMailbox.mockResolvedValue(success({
        items: [summary],
        totalCount: 1,
        hasMore: false,
      }));

      const useCase = new ListFutureMailbox(mockReader);
      const result = await useCase.execute(mockActor, { page: 1, query: "" });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.items).toHaveLength(1);
        expect(result.value.totalCount).toBe(1);
        expect(result.value.hasMore).toBe(false);
      }
    });
  });

  describe("GetOpenedFutureLetter", () => {
    it("returns ok when letter is successfully fetched", async () => {
      mockReader.getOpened.mockResolvedValue(success({ id: "l1", title: "Test" } as FutureLetter));
      const useCase = new GetOpenedFutureLetter(mockReader);
      
      const result = await useCase.execute(mockActor, "l1");
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id).toBe("l1");
      }
    });

    it("returns err when reader returns null", async () => {
      mockReader.getOpened.mockResolvedValue(failure("NOT_FOUND"));
      const useCase = new GetOpenedFutureLetter(mockReader);
      
      const result = await useCase.execute(mockActor, "l1");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("NOT_FOUND");
      }
    });
  });

  describe("owner moderation", () => {
    const owner: ActiveActor = {
      status: "active",
      userId: "owner-1",
      email: "owner@example.com",
      role: "owner",
      canManageCatalogue: true,
    };

    it("lists only opened letters, using the server clock", async () => {
      mockReader.listManaged.mockResolvedValue(success([]));
      const before = Date.now();

      const result = await new ListManagedFutureLetters(mockReader).execute(owner);

      expect(result.ok).toBe(true);
      const [serverNow] = mockReader.listManaged.mock.calls[0];
      expect(new Date(serverNow).getTime()).toBeGreaterThanOrEqual(before);
    });

    it("refuses members", async () => {
      const result = await new ListManagedFutureLetters(mockReader).execute(mockActor);

      expect(result.ok).toBe(false);
      expect(mockReader.listManaged).not.toHaveBeenCalled();
    });

    it("passes the server clock when removing a letter", async () => {
      const repository: import("vitest").Mocked<FutureLetterRepository> = {
        create: vi.fn(),
        update: vi.fn(),
        deleteOwnScheduled: vi.fn(),
        deleteManaged: vi.fn().mockResolvedValue(success(undefined)),
      };

      await new ManageFutureLetters(repository).deleteManaged(owner, "letter-1");

      expect(repository.deleteManaged).toHaveBeenCalledWith("letter-1", expect.any(String));
    });
  });
});

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PREFERENCE_STORAGE_KEY } from "@/features/selection/lib/selection-storage";
import { usePreferenceSelection } from "./use-preference-selection";

describe("usePreferenceSelection", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.useRealTimers());

  it("hydrates the existing stored selection", async () => {
    localStorage.setItem(
      PREFERENCE_STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        likedItemIds: ["item-1"],
        favoriteByCategory: {},
        notesByCategory: {},
        updatedAt: null,
      }),
    );

    const { result } = renderHook(() => usePreferenceSelection());

    await waitFor(() => expect(result.current.hasHydrated).toBe(true));
    expect(result.current.selection.likedItemIds).toEqual(["item-1"]);
    expect(result.current.selection.schemaVersion).toBe(2);
  });

  it("persists selection actions after hydration", async () => {
    const { result } = renderHook(() => usePreferenceSelection());
    await waitFor(() => expect(result.current.hasHydrated).toBe(true));

    act(() => result.current.toggleFavorite("gifts", "item-2"));

    await waitFor(() => {
      const stored = JSON.parse(
        localStorage.getItem(PREFERENCE_STORAGE_KEY) ?? "null",
      ) as { likedItemIds: string[]; favoriteByCategory: Record<string, string> };
      expect(stored.likedItemIds).toContain("item-2");
      expect(stored.favoriteByCategory.gifts).toBe("item-2");
    });
    await waitFor(() =>
      expect(result.current.persistenceStatus).toBe("saved"),
    );
  });

  it("preserves an action made before local storage hydration finishes", async () => {
    const { result } = renderHook(() => usePreferenceSelection());

    act(() => result.current.toggleLiked("item-1", "gifts"));

    await waitFor(() => expect(result.current.hasHydrated).toBe(true));
    expect(result.current.selection.likedItemIds).toEqual(["item-1"]);
    expect(result.current.canUndo).toBe(true);
  });

  it("reports when browser storage is unavailable", async () => {
    const storageWrite = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("Full", "QuotaExceededError");
      });
    const { result } = renderHook(() => usePreferenceSelection());

    await waitFor(() =>
      expect(result.current.persistenceStatus).toBe("unavailable"),
    );
    storageWrite.mockRestore();
  });

  it("undoes the most recent selection change", async () => {
    const { result } = renderHook(() => usePreferenceSelection());
    await waitFor(() => expect(result.current.hasHydrated).toBe(true));

    act(() => result.current.toggleLiked("item-1", "gifts"));
    expect(result.current.canUndo).toBe(true);

    act(() => result.current.undo());

    expect(result.current.selection.likedItemIds).toEqual([]);
    expect(result.current.canUndo).toBe(false);
  });

  it("expires undo after five seconds", async () => {
    const { result } = renderHook(() => usePreferenceSelection());
    await waitFor(() => expect(result.current.hasHydrated).toBe(true));
    vi.useFakeTimers();

    act(() => result.current.toggleLiked("item-1", "gifts"));
    expect(result.current.canUndo).toBe(true);

    act(() => vi.advanceTimersByTime(5_000));

    expect(result.current.canUndo).toBe(false);
  });
});

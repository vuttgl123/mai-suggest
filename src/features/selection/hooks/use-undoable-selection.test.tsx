import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SELECTION_STATE } from "../lib/selection-state";
import { useUndoableSelection } from "./use-undoable-selection";

describe("useUndoableSelection", () => {
  afterEach(() => vi.useRealTimers());

  it("keeps one snapshot and restores the most recent change", () => {
    const { result } = renderHook(() =>
      useUndoableSelection(DEFAULT_SELECTION_STATE),
    );

    act(() =>
      result.current.dispatch({
        type: "toggle-liked",
        itemId: "item-1",
        categoryId: "gifts",
      }),
    );
    act(() =>
      result.current.dispatch({
        type: "toggle-favorite",
        itemId: "item-2",
        categoryId: "gifts",
      }),
    );
    act(() => result.current.undo());

    expect(result.current.selection.likedItemIds).toEqual(["item-1"]);
    expect(result.current.selection.favoriteByCategory).toEqual({});
    expect(result.current.canUndo).toBe(false);
  });

  it("can undo reset without persisting the history", () => {
    const initialSelection = {
      ...DEFAULT_SELECTION_STATE,
      likedItemIds: ["item-1"],
    };
    const { result } = renderHook(() =>
      useUndoableSelection(initialSelection),
    );

    act(() => result.current.dispatch({ type: "reset" }));
    act(() => result.current.undo());

    expect(result.current.selection.likedItemIds).toEqual(["item-1"]);
  });

  it("expires the snapshot and ignores navigation-only changes", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useUndoableSelection(DEFAULT_SELECTION_STATE, 5_000),
    );

    act(() =>
      result.current.dispatch({
        type: "set-last-viewed",
        categoryId: "gifts",
      }),
    );
    expect(result.current.canUndo).toBe(false);

    act(() =>
      result.current.dispatch({
        type: "toggle-liked",
        itemId: "item-1",
        categoryId: "gifts",
      }),
    );
    act(() => vi.advanceTimersByTime(5_000));

    expect(result.current.canUndo).toBe(false);
  });
});

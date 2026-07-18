"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_SELECTION_STATE,
  type SelectionAction,
} from "@/features/selection/lib/selection-state";
import {
  readSelection,
  writeSelection,
} from "@/features/selection/lib/selection-storage";
import { useUndoableSelection } from "./use-undoable-selection";

export type PersistenceStatus =
  | "idle"
  | "saving"
  | "saved"
  | "unavailable";

export function usePreferenceSelection() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const hasHydratedRef = useRef(false);
  const pendingActionsRef = useRef<SelectionAction[]>([]);
  const [persistenceStatus, setPersistenceStatus] =
    useState<PersistenceStatus>("idle");
  const {
    selection,
    dispatch,
    replace,
    canUndo,
    undo,
    clearUndo,
  } = useUndoableSelection(DEFAULT_SELECTION_STATE);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedSelection = readSelection(window.localStorage);
      replace(storedSelection);
      const pendingActions = pendingActionsRef.current;
      pendingActionsRef.current = [];
      pendingActions.forEach(dispatch);
      hasHydratedRef.current = true;
      setPersistenceStatus("saving");
      setHasHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [dispatch, replace]);

  useEffect(() => {
    if (!hasHydrated) return;
    const timer = window.setTimeout(() => {
      setPersistenceStatus(
        writeSelection(window.localStorage, selection)
          ? "saved"
          : "unavailable",
      );
    }, 150);

    return () => window.clearTimeout(timer);
  }, [hasHydrated, selection]);

  function dispatchSelection(action: SelectionAction) {
    setPersistenceStatus("saving");
    if (!hasHydratedRef.current) {
      pendingActionsRef.current.push(action);
      return;
    }
    dispatch(action);
  }

  function toggleLiked(itemId: string, categoryId: string) {
    dispatchSelection({ type: "toggle-liked", itemId, categoryId });
  }

  function toggleFavorite(categoryId: string, itemId: string) {
    dispatchSelection({ type: "toggle-favorite", categoryId, itemId });
  }

  function setCategoryNote(categoryId: string, note: string) {
    dispatchSelection({ type: "set-note", categoryId, note });
  }

  function setLastViewedCategory(categoryId: string) {
    dispatchSelection({ type: "set-last-viewed", categoryId });
  }

  function resetAll() {
    dispatchSelection({ type: "reset" });
  }

  function undoLastChange() {
    setPersistenceStatus("saving");
    undo();
  }

  return {
    selection,
    hasHydrated,
    persistenceStatus,
    canUndo,
    undo: undoLastChange,
    clearUndo,
    toggleLiked,
    toggleFavorite,
    setCategoryNote,
    setLastViewedCategory,
    resetAll,
  };
}

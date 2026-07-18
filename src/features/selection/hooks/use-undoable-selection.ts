"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PreferenceSelectionState } from "@/types/preference";
import {
  selectionReducer,
  type SelectionAction,
} from "../lib/selection-state";

export interface UndoableSelection {
  selection: PreferenceSelectionState;
  dispatch(action: SelectionAction): void;
  replace(selection: PreferenceSelectionState): void;
  canUndo: boolean;
  undo(): void;
  clearUndo(): void;
}

export function useUndoableSelection(
  initialSelection: PreferenceSelectionState,
  timeoutMs = 5_000,
): UndoableSelection {
  const [selection, setSelection] = useState(initialSelection);
  const [undoSnapshot, setUndoSnapshot] =
    useState<PreferenceSelectionState | null>(null);
  const selectionRef = useRef(initialSelection);
  const undoTimerRef = useRef<number | null>(null);

  const clearUndo = useCallback(() => {
    if (undoTimerRef.current !== null) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setUndoSnapshot(null);
  }, []);

  const replace = useCallback(
    (nextSelection: PreferenceSelectionState) => {
      clearUndo();
      selectionRef.current = nextSelection;
      setSelection(nextSelection);
    },
    [clearUndo],
  );

  const dispatch = useCallback(
    (action: SelectionAction) => {
      const current = selectionRef.current;
      const next = selectionReducer(current, action);

      if (action.type !== "set-last-viewed") {
        if (undoTimerRef.current !== null) {
          window.clearTimeout(undoTimerRef.current);
        }
        setUndoSnapshot(current);
        undoTimerRef.current = window.setTimeout(() => {
          setUndoSnapshot(null);
          undoTimerRef.current = null;
        }, timeoutMs);
      }

      selectionRef.current = next;
      setSelection(next);
    },
    [timeoutMs],
  );

  const undo = useCallback(() => {
    if (!undoSnapshot) return;
    if (undoTimerRef.current !== null) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    selectionRef.current = undoSnapshot;
    setSelection(undoSnapshot);
    setUndoSnapshot(null);
  }, [undoSnapshot]);

  useEffect(
    () => () => {
      if (undoTimerRef.current !== null) {
        window.clearTimeout(undoTimerRef.current);
      }
    },
    [],
  );

  return {
    selection,
    dispatch,
    replace,
    canUndo: undoSnapshot !== null,
    undo,
    clearUndo,
  };
}

import type { PreferenceSelectionState } from "@/types/preference";
import {
  DEFAULT_SELECTION_STATE,
  parseStoredSelection,
} from "./selection-state";

export const PREFERENCE_STORAGE_KEY = "dieu-em-yeu:preferences:v1";

export function readSelection(storage: Storage): PreferenceSelectionState {
  try {
    const storedValue = storage.getItem(PREFERENCE_STORAGE_KEY);
    return storedValue
      ? parseStoredSelection(JSON.parse(storedValue) as unknown)
      : { ...DEFAULT_SELECTION_STATE };
  } catch {
    return { ...DEFAULT_SELECTION_STATE };
  }
}

export function writeSelection(
  storage: Storage,
  selection: PreferenceSelectionState,
): boolean {
  try {
    storage.setItem(PREFERENCE_STORAGE_KEY, JSON.stringify(selection));
    return true;
  } catch {
    // Storage can be unavailable in private mode or after exceeding quota.
    return false;
  }
}

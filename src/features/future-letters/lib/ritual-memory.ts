/*
 * Device-local UI memory: which letters already played the opening ritual here,
 * so re-reading skips straight to the letter. It carries no business meaning
 * ("read" is not tracked); losing it only means the ritual plays again.
 */
const STORAGE_KEY = "dieu-em-yeu:letter-ritual-seen";
const MAX_REMEMBERED = 200;

function readSeen(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export function hasSeenRitual(letterId: string): boolean {
  return readSeen().includes(letterId);
}

export function markRitualSeen(letterId: string): void {
  const seen = readSeen().filter((id) => id !== letterId);
  seen.push(letterId);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seen.slice(-MAX_REMEMBERED)));
  } catch {
    // Storage is optional; the ritual simply plays again next time.
  }
}

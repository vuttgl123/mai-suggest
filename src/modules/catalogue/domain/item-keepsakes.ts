import type { CatalogueMetadata } from "@/modules/catalogue/domain/catalogue-admin-models";
import type { Json } from "@/lib/supabase/database.types";

export type ItemKeepsakeKind = "message" | "poem" | "memory";

export interface ItemKeepsake {
  id: string;
  kind: ItemKeepsakeKind;
  title: string | null;
  content: string;
}

const KEEPSAKE_KINDS: readonly ItemKeepsakeKind[] = [
  "message",
  "poem",
  "memory",
];
const MAX_KEEPSAKES = 24;
const MAX_TITLE_LENGTH = 120;
const MAX_CONTENT_LENGTH = 2_000;

export function readItemKeepsakes(
  metadata: Record<string, unknown>,
): ItemKeepsake[] {
  const candidate = metadata.keepsakes;
  if (!Array.isArray(candidate)) return [];

  return candidate.flatMap((entry) => {
    const keepsake = toItemKeepsake(entry);
    return keepsake ? [keepsake] : [];
  });
}

export function mergeItemKeepsakes(
  metadata: CatalogueMetadata,
  keepsakes: ItemKeepsake[],
): CatalogueMetadata {
  return {
    ...metadata,
    keepsakes: keepsakes.map((keepsake) => ({
      id: keepsake.id.trim(),
      kind: keepsake.kind,
      title: keepsake.title?.trim() || null,
      content: keepsake.content.trim(),
    })) as Json,
  };
}

export function isValidItemKeepsakeMetadata(
  metadata: CatalogueMetadata,
): boolean {
  const candidate = metadata.keepsakes;
  if (candidate === undefined) return true;
  if (!Array.isArray(candidate) || candidate.length > MAX_KEEPSAKES) return false;

  const ids = new Set<string>();
  for (const entry of candidate) {
    const keepsake = toItemKeepsake(entry);
    if (!keepsake || ids.has(keepsake.id)) return false;
    if (
      keepsake.title !== null &&
      keepsake.title.length > MAX_TITLE_LENGTH
    ) {
      return false;
    }
    if (keepsake.content.length > MAX_CONTENT_LENGTH) return false;
    ids.add(keepsake.id);
  }

  return true;
}

function toItemKeepsake(value: unknown): ItemKeepsake | null {
  if (!isRecord(value)) return null;

  const id = toRequiredText(value.id);
  const content = toRequiredText(value.content);
  const title = toOptionalText(value.title);
  const kind = value.kind;

  if (
    !id ||
    !content ||
    !isKeepsakeKind(kind) ||
    (value.title !== undefined && title === null && value.title !== null)
  ) {
    return null;
  }

  return { id, kind, title, content };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isKeepsakeKind(value: unknown): value is ItemKeepsakeKind {
  return typeof value === "string" && KEEPSAKE_KINDS.includes(value as ItemKeepsakeKind);
}

function toRequiredText(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function toOptionalText(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

import type { SiteContent } from "./types";

/* Optimistic-concurrency guard for whole-document content saves. The admin
 * console edits the document it loaded, so that document's updatedAt IS the
 * version the save is based on. A save based on anything older than the store
 * would silently clobber newer edits (stale tab, pre-load state) — reject it. */

export function stampContent(content: SiteContent): SiteContent {
  return { ...content, updatedAt: new Date().toISOString() };
}

export function saveConflict(basedOn: string | undefined, stored: string | undefined): boolean {
  if (!stored) return false; // legacy/empty store — nothing to clobber
  if (!basedOn) return true; // stamped store, pre-stamp tab — stale by definition
  return basedOn < stored; // ISO-8601 strings order chronologically
}

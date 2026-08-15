import { promises as fs } from "node:fs";
import path from "node:path";
import { blobEnabled, readJsonBlob, writeJsonBlob } from "@/lib/blob-json";

/* Pending (abandoned) carts — captured at checkout the moment a shopper types a
 * valid email, before they finish paying. A once-a-day cron (see
 * /api/cron/abandoned-cart) emails a gentle "you left something behind"
 * reminder for carts that were never turned into an order.
 *
 * Persists to Vercel Blob when configured, else a JSON file under /data for
 * local dev. Mirrors the subscribers / reviews / orders stores.
 *
 * Lifecycle of one record (keyed by lower-cased email):
 *   • upsert            — shopper enters email + has items → saved / refreshed
 *   • markCartOrdered   — that email completes an order   → won't be reminded
 *   • cron reminder     — old, un-ordered, un-reminded    → email + markReminded
 * A record is reminded at most once per distinct cart (see `sig`): if the
 * shopper comes back and builds a genuinely different cart, it can be reminded
 * again. */

export interface PendingItem {
  slug: string;
  name: string;
  /** e.g. a size like "M" or "EU 42", or a colour */
  variant?: string;
  /** unit price in ILS (server-recomputed from the catalog) */
  price: number;
  qty: number;
  /** cover image path for the piece (shown in the reminder email) */
  image?: string;
}

export interface PendingCart {
  email: string;
  name?: string;
  items: PendingItem[];
  subtotal: number;
  /** ISO — first time we saw this email with a cart */
  createdAt: string;
  /** ISO — last time the cart contents were updated */
  updatedAt: string;
  /** ISO — when a reminder was emailed (cleared when the cart changes) */
  remindedAt?: string;
  /** ISO — when this email placed an order (so we stop reminding) */
  orderedAt?: string;
  /** signature of the current items, so a changed cart resets the reminder */
  sig?: string;
  /** where the cart was captured (e.g. "checkout") */
  source?: string;
}

const BLOB_KEY = "pending-carts";
const FILE = path.join(process.cwd(), "data", "pending-carts.json");
/** hard cap so the store can't grow without bound */
const MAX_KEEP = 3000;

const norm = (email: string) => email.trim().toLowerCase();

/** Order-independent fingerprint of a cart's contents. */
export function itemsSignature(items: PendingItem[]): string {
  return items
    .map((i) => `${i.slug}:${i.variant ?? ""}:${i.qty}`)
    .sort()
    .join("|");
}

export async function readPendingCarts(): Promise<PendingCart[]> {
  if (blobEnabled) {
    const fromBlob = await readJsonBlob<PendingCart[]>(BLOB_KEY);
    return Array.isArray(fromBlob) ? fromBlob : [];
  }
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as PendingCart[]) : [];
  } catch {
    return [];
  }
}

/** Persist the whole list (used by upserts and by the cron's batch update). */
export async function savePendingCarts(list: PendingCart[]): Promise<void> {
  // keep newest-updated first, trim to the cap
  const trimmed = [...list]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, MAX_KEEP);
  if (blobEnabled) {
    await writeJsonBlob(BLOB_KEY, trimmed);
    return;
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(trimmed, null, 2), "utf8");
}

export interface UpsertInput {
  email: string;
  name?: string;
  items: PendingItem[];
  subtotal: number;
  source?: string;
}

/** Create or refresh the pending cart for an email. Returns the saved record. */
export async function upsertPendingCart(input: UpsertInput): Promise<PendingCart> {
  const key = norm(input.email);
  const now = new Date().toISOString();
  const sig = itemsSignature(input.items);
  const list = await readPendingCarts();
  const idx = list.findIndex((c) => norm(c.email) === key);

  if (idx === -1) {
    const rec: PendingCart = {
      email: input.email.trim(),
      name: input.name?.trim() || undefined,
      items: input.items,
      subtotal: input.subtotal,
      createdAt: now,
      updatedAt: now,
      sig,
      source: input.source,
    };
    list.push(rec);
    await savePendingCarts(list);
    return rec;
  }

  const prev = list[idx];
  const changed = prev.sig !== sig;
  const rec: PendingCart = {
    ...prev,
    email: input.email.trim(),
    name: input.name?.trim() || prev.name,
    items: input.items,
    subtotal: input.subtotal,
    updatedAt: now,
    sig,
    source: input.source ?? prev.source,
    // a genuinely different cart is eligible to be reminded (and "converts")
    // afresh — clear the flags so the new cart is treated as new.
    remindedAt: changed ? undefined : prev.remindedAt,
    orderedAt: changed ? undefined : prev.orderedAt,
  };
  list[idx] = rec;
  await savePendingCarts(list);
  return rec;
}

/** Mark the cart for an email as converted (best-effort; no-op if none). */
export async function markCartOrdered(email: string): Promise<void> {
  const key = norm(email);
  const list = await readPendingCarts();
  const idx = list.findIndex((c) => norm(c.email) === key);
  if (idx === -1) return;
  list[idx] = { ...list[idx], orderedAt: new Date().toISOString() };
  await savePendingCarts(list);
}

/** Mark a single cart as reminded (used outside the cron's batch path). */
export async function markCartReminded(email: string): Promise<void> {
  const key = norm(email);
  const list = await readPendingCarts();
  const idx = list.findIndex((c) => norm(c.email) === key);
  if (idx === -1) return;
  list[idx] = { ...list[idx], remindedAt: new Date().toISOString() };
  await savePendingCarts(list);
}

export async function removePendingCart(email: string): Promise<boolean> {
  const key = norm(email);
  const list = await readPendingCarts();
  const next = list.filter((c) => norm(c.email) !== key);
  if (next.length === list.length) return false;
  await savePendingCarts(next);
  return true;
}

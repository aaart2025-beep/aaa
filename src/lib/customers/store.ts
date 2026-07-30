import { promises as fs } from "node:fs";
import path from "node:path";
import type { Order } from "@/lib/orders/types";
import type { Customer } from "./types";
import { blobEnabled, readJsonBlob, writeJsonBlob } from "@/lib/blob-json";

/* Customers are DERIVED from order history (there are no logins yet — that's
 * Phase C). We aggregate one row per customer email, and keep a small,
 * separate map of the studio's private notes per customer in Blob. */

const NOTES_KEY = "customer-notes";
const NOTES_FILE = path.join(process.cwd(), "data", "customer-notes.json");

export type { Customer };

export async function readCustomerNotes(): Promise<Record<string, string>> {
  if (blobEnabled) {
    const fromBlob = await readJsonBlob<Record<string, string>>(NOTES_KEY);
    return fromBlob && typeof fromBlob === "object" ? fromBlob : {};
  }
  try {
    const raw = await fs.readFile(NOTES_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

async function writeCustomerNotes(notes: Record<string, string>): Promise<void> {
  if (blobEnabled) {
    await writeJsonBlob(NOTES_KEY, notes);
    return;
  }
  await fs.mkdir(path.dirname(NOTES_FILE), { recursive: true });
  await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2), "utf8");
}

/** Save (or clear) the note for one customer email. */
export async function setCustomerNote(email: string, note: string): Promise<void> {
  const key = email.trim().toLowerCase();
  if (!key) return;
  const notes = await readCustomerNotes();
  if (note.trim()) notes[key] = note.trim();
  else delete notes[key];
  await writeCustomerNotes(notes);
}

/** Build the customer list from orders + the notes map. Newest activity first. */
export function deriveCustomers(orders: Order[], notes: Record<string, string>): Customer[] {
  const byEmail = new Map<string, Customer>();
  // oldest → newest so the "name/phone" ends up reflecting the latest order
  const chrono = [...orders].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  for (const o of chrono) {
    const email = (o.customer.email ?? "").trim().toLowerCase();
    if (!email) continue;
    const existing = byEmail.get(email);
    if (!existing) {
      byEmail.set(email, {
        email,
        name: o.customer.name || email,
        phone: o.customer.phone || undefined,
        orders: 1,
        totalSpent: o.subtotal,
        paidSpent: o.paymentStatus === "paid" ? o.subtotal : 0,
        firstOrder: o.createdAt,
        lastOrder: o.createdAt,
        note: notes[email],
      });
    } else {
      existing.name = o.customer.name || existing.name;
      if (o.customer.phone) existing.phone = o.customer.phone;
      existing.orders += 1;
      existing.totalSpent += o.subtotal;
      if (o.paymentStatus === "paid") existing.paidSpent += o.subtotal;
      existing.lastOrder = o.createdAt;
    }
  }
  return [...byEmail.values()].sort((a, b) => b.lastOrder.localeCompare(a.lastOrder));
}

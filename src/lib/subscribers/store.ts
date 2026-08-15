import { promises as fs } from "node:fs";
import path from "node:path";
import { blobEnabled, readJsonBlob, writeJsonBlob } from "@/lib/blob-json";

/* Email subscribers — people who signed up (no account/password) to receive
 * offers, news and discounts. Persists to Vercel Blob when configured, else a
 * JSON file under /data for local dev. Mirrors the reviews/orders stores. */

export interface Subscriber {
  email: string;
  createdAt: string;
  /** where they signed up (e.g. "footer", "checkout"). */
  source?: string;
}

const BLOB_KEY = "subscribers";
const FILE = path.join(process.cwd(), "data", "subscribers.json");

export async function readSubscribers(): Promise<Subscriber[]> {
  if (blobEnabled) {
    const fromBlob = await readJsonBlob<Subscriber[]>(BLOB_KEY);
    return Array.isArray(fromBlob) ? fromBlob : [];
  }
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Subscriber[]) : [];
  } catch {
    return [];
  }
}

async function writeSubscribers(list: Subscriber[]): Promise<void> {
  if (blobEnabled) {
    await writeJsonBlob(BLOB_KEY, list);
    return;
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(list, null, 2), "utf8");
}

/** Add an email; returns "added" or "exists" (case-insensitive dedupe). */
export async function addSubscriber(email: string, source?: string): Promise<"added" | "exists"> {
  const clean = email.trim();
  const norm = clean.toLowerCase();
  const list = await readSubscribers();
  if (list.some((s) => s.email.toLowerCase() === norm)) return "exists";
  list.push({ email: clean, createdAt: new Date().toISOString(), source });
  await writeSubscribers(list);
  return "added";
}

export async function removeSubscriber(email: string): Promise<boolean> {
  const norm = email.trim().toLowerCase();
  const list = await readSubscribers();
  const next = list.filter((s) => s.email.toLowerCase() !== norm);
  if (next.length === list.length) return false;
  await writeSubscribers(next);
  return true;
}

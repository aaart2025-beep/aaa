import { promises as fs } from "node:fs";
import path from "node:path";
import type { Order } from "./types";
import { blobEnabled, readJsonBlob, writeJsonBlob } from "@/lib/blob-json";

/* Order store. On Vercel (with a Blob token) orders persist durably in Blob;
 * locally with no token they fall back to a JSON file under /data. */

const BLOB_KEY = "orders";
const FILE = path.join(process.cwd(), "data", "orders.json");

export async function readOrders(): Promise<Order[]> {
  if (blobEnabled) {
    const fromBlob = await readJsonBlob<Order[]>(BLOB_KEY);
    return Array.isArray(fromBlob) ? fromBlob : [];
  }
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch {
    return [];
  }
}

async function writeOrders(orders: Order[]): Promise<void> {
  if (blobEnabled) {
    await writeJsonBlob(BLOB_KEY, orders);
    return;
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(orders, null, 2), "utf8");
}

/** Append a new order (newest persisted last; callers sort for display). */
export async function appendOrder(order: Order): Promise<void> {
  const orders = await readOrders();
  orders.push(order);
  await writeOrders(orders);
}

/** Patch an order's mutable status fields. Returns the updated order or null. */
export async function updateOrder(
  id: string,
  patch: Partial<Pick<Order, "paymentStatus" | "paymentMethod" | "fulfillmentStatus">>,
): Promise<Order | null> {
  const orders = await readOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  const updated: Order = { ...orders[idx], ...patch };
  const next = orders.map((o, i) => (i === idx ? updated : o));
  await writeOrders(next);
  return updated;
}

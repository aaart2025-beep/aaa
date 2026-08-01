import { promises as fs } from "node:fs";
import path from "node:path";
import type { Review, ReviewStatus } from "./types";
import { blobEnabled, readJsonBlob, writeJsonBlob } from "@/lib/blob-json";

/* Review store — mirrors the order/message stores. Persists to Vercel Blob when
 * configured, else a JSON file under /data for local dev. */

const BLOB_KEY = "reviews";
const FILE = path.join(process.cwd(), "data", "reviews.json");

export async function readReviews(): Promise<Review[]> {
  if (blobEnabled) {
    const fromBlob = await readJsonBlob<Review[]>(BLOB_KEY);
    return Array.isArray(fromBlob) ? fromBlob : [];
  }
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Review[]) : [];
  } catch {
    return [];
  }
}

async function writeReviews(reviews: Review[]): Promise<void> {
  if (blobEnabled) {
    await writeJsonBlob(BLOB_KEY, reviews);
    return;
  }
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(reviews, null, 2), "utf8");
}

export async function appendReview(review: Review): Promise<void> {
  const reviews = await readReviews();
  reviews.push(review);
  await writeReviews(reviews);
}

export async function updateReviewStatus(id: string, status: ReviewStatus): Promise<Review | null> {
  const reviews = await readReviews();
  const idx = reviews.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const updated: Review = { ...reviews[idx], status };
  await writeReviews(reviews.map((r, i) => (i === idx ? updated : r)));
  return updated;
}

export async function deleteReview(id: string): Promise<boolean> {
  const reviews = await readReviews();
  const next = reviews.filter((r) => r.id !== id);
  if (next.length === reviews.length) return false;
  await writeReviews(next);
  return true;
}

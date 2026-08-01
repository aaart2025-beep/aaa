/* Customer reviews (with optional photo) shown on the /reviews gallery. New
 * reviews land as "pending" and appear publicly only once the studio approves. */

export type ReviewStatus = "pending" | "approved";
export const REVIEW_STATUSES: ReviewStatus[] = ["pending", "approved"];

export interface Review {
  id: string;
  createdAt: string; // ISO
  name: string;
  /** 1–5 stars. */
  rating: number;
  title?: string;
  body: string;
  /** same-origin image path (/api/media/…) if the customer added a photo. */
  photo?: string;
  /** which product it's about (slug), if submitted from a product. */
  productSlug?: string;
  status: ReviewStatus;
}

export function newReviewId(seed: number): string {
  const base = Math.abs(Math.floor(seed)).toString(36).toUpperCase().slice(-6).padStart(6, "0");
  return `REV-${base}`;
}

/** Clamp any input to a whole 1–5 star rating. */
export function clampRating(n: unknown): number {
  const v = Math.round(Number(n) || 0);
  return Math.max(1, Math.min(5, v));
}

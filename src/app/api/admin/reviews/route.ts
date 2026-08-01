import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readReviews, updateReviewStatus, deleteReview } from "@/lib/reviews/store";
import { REVIEW_STATUSES, type ReviewStatus } from "@/lib/reviews/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only: list all reviews (newest first). */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const reviews = (await readReviews()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ ok: true, reviews });
}

/** Admin-only: approve/unapprove a review, or delete it.
 *  Body: { id, status } to set status, or { id, action: "delete" }. */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  let body: { id?: unknown; status?: unknown; action?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 422 });

  try {
    if (body.action === "delete") {
      const ok = await deleteReview(id);
      if (!ok) return NextResponse.json({ ok: false, error: "Review not found" }, { status: 404 });
      return NextResponse.json({ ok: true, deleted: id });
    }
    if (typeof body.status === "string" && REVIEW_STATUSES.includes(body.status as ReviewStatus)) {
      const updated = await updateReviewStatus(id, body.status as ReviewStatus);
      if (!updated) return NextResponse.json({ ok: false, error: "Review not found" }, { status: 404 });
      return NextResponse.json({ ok: true, review: updated });
    }
    return NextResponse.json({ ok: false, error: "Nothing to update" }, { status: 422 });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save (read-only storage)." }, { status: 503 });
  }
}

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { appendReview } from "@/lib/reviews/store";
import { newReviewId, clampRating, type Review } from "@/lib/reviews/types";
import { clientKey, corsHeadersFor, rateLimit } from "@/lib/api-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Public review submission (multipart form so it can carry a photo). Saved as
 * "pending" — it appears on the site only after the studio approves it in the
 * admin. Same abuse controls as the other public endpoints. */

const REVIEW_RATE = { max: 4, windowMs: 60_000 };
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const blobEnabled = Boolean(TOKEN) || Boolean(process.env.BLOB_STORE_ID);
const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

export function OPTIONS(req: Request) {
  const cors = corsHeadersFor(req);
  if (!cors) return new NextResponse(null, { status: 403 });
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function POST(req: Request) {
  const cors = corsHeadersFor(req);
  if (!cors) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  if (!rateLimit(`reviews:${clientKey(req)}`, REVIEW_RATE)) {
    return NextResponse.json({ ok: false, error: "Too many submissions — please wait a minute." }, { status: 429, headers: cors });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400, headers: cors });
  }

  // Honeypot.
  if (str(form.get("company")) !== "") {
    return NextResponse.json({ ok: true, id: newReviewId(Date.now()) }, { headers: cors });
  }

  const name = str(form.get("name"));
  const body = str(form.get("body"));
  const rating = clampRating(form.get("rating"));
  if (!name || !body) {
    return NextResponse.json({ ok: false, error: "Please add your name and a few words." }, { status: 422, headers: cors });
  }

  // Optional photo — stored privately, served through the /api/media proxy.
  let photo: string | undefined;
  const file = form.get("photo");
  const id = newReviewId(Date.now() + Math.floor(Math.random() * 1_000_000));
  if (file instanceof File && file.size > 0 && blobEnabled) {
    try {
      const type = /^image\/(jpeg|png|webp)$/.test(file.type) ? file.type : "image/jpeg";
      const ext = type === "image/webp" ? "webp" : type === "image/png" ? "png" : "jpg";
      const bytes = Buffer.from(await file.arrayBuffer());
      const result = await put(`reviews/${id}.${ext}`, bytes, {
        access: "private",
        token: TOKEN,
        addRandomSuffix: true,
        contentType: type,
      });
      photo = `/api/media/${result.pathname}`;
    } catch (e) {
      console.error("review photo upload failed (keeping the text review):", e);
    }
  }

  const review: Review = {
    id,
    createdAt: new Date().toISOString(),
    name,
    rating,
    title: str(form.get("title")) || undefined,
    body: body.slice(0, 2000),
    photo,
    productSlug: str(form.get("productSlug")) || undefined,
    status: "pending",
  };

  try {
    await appendReview(review);
  } catch (e) {
    console.error("review save failed:", e);
    return NextResponse.json({ ok: false, error: "Could not save your review right now." }, { status: 503, headers: cors });
  }

  return NextResponse.json({ ok: true, id: review.id }, { headers: cors });
}

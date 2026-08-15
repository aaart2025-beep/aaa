import { NextResponse } from "next/server";
import { readContent } from "@/lib/content/store";
import { upsertPendingCart, type PendingItem } from "@/lib/pending-carts/store";
import { clientKey, corsHeadersFor, rateLimit } from "@/lib/api-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Captures a shopper's cart at checkout (once they've typed a valid email) so a
 * once-a-day cron can send an "you left something behind" reminder if they
 * never finish. Same abuse controls as the other public endpoints (CORS
 * allowlist + rate limit + honeypot). Prices/names/images are recomputed from
 * the live catalog — the client's numbers are never trusted. */

const RATE = { max: 12, windowMs: 60_000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

interface IncomingItem {
  slug?: unknown;
  variant?: unknown;
  qty?: unknown;
}

export function OPTIONS(req: Request) {
  const cors = corsHeadersFor(req);
  if (!cors) return new NextResponse(null, { status: 403 });
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function POST(req: Request) {
  const cors = corsHeadersFor(req);
  if (!cors) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  if (!rateLimit(`pending:${clientKey(req)}`, RATE)) {
    // A silent 429 is fine here — this is a background nicety, not a checkout.
    return NextResponse.json({ ok: false }, { status: 429, headers: cors });
  }

  let body: { email?: unknown; name?: unknown; items?: unknown; company?: unknown; source?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400, headers: cors });
  }

  // Honeypot — a filled "company" field means a bot; pretend success, save nothing.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true }, { headers: cors });
  }

  const email = str(body.email);
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "A valid email is required." }, { status: 422, headers: cors });
  }

  const rawItems = Array.isArray(body.items) ? (body.items as IncomingItem[]) : [];
  if (rawItems.length === 0) {
    return NextResponse.json({ ok: false, error: "Empty cart." }, { status: 422, headers: cors });
  }

  // Recompute names + prices + images server-side from the live catalog; drop
  // any line whose slug we don't recognise.
  const { products } = await readContent();
  const items: PendingItem[] = [];
  for (const it of rawItems) {
    const slug = str(it.slug);
    const p = products.find((pp) => pp.slug === slug);
    if (!p) continue;
    const qty = Math.max(1, Math.min(99, Math.floor(Number(it.qty) || 1)));
    const variant = str(it.variant) || undefined;
    items.push({ slug, name: p.name, variant, price: p.price, qty, image: p.images?.[0] });
  }
  if (items.length === 0) {
    return NextResponse.json({ ok: false, error: "No valid items." }, { status: 422, headers: cors });
  }

  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
  const source = str(body.source).slice(0, 40) || "checkout";

  try {
    await upsertPendingCart({ email, name: str(body.name) || undefined, items, subtotal, source });
    return NextResponse.json({ ok: true }, { headers: cors });
  } catch (e) {
    console.error("pending cart save failed:", e);
    return NextResponse.json({ ok: false }, { status: 503, headers: cors });
  }
}

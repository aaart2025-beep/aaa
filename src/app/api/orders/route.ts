import { NextResponse } from "next/server";
import { readContent } from "@/lib/content/store";
import { appendOrder } from "@/lib/orders/store";
import { newOrderId, type Order, type OrderItem, type OrderCustomer } from "@/lib/orders/types";
import { clientKey, corsHeadersFor, rateLimit } from "@/lib/api-guard";
import { sendOrderEmails } from "@/lib/email/order-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* The static Hostinger build (different origin) posts orders here — allowed
 * origins come from ALLOWED_ORIGINS env, never a wildcard. */

const ORDER_RATE = { max: 5, windowMs: 60_000 };

export function OPTIONS(req: Request) {
  const cors = corsHeadersFor(req);
  if (!cors) return new NextResponse(null, { status: 403 });
  return new NextResponse(null, { status: 204, headers: cors });
}

interface IncomingItem {
  slug?: unknown;
  variant?: unknown;
  qty?: unknown;
}

const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function POST(req: Request) {
  const cors = corsHeadersFor(req);
  if (!cors) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (!rateLimit(`orders:${clientKey(req)}`, ORDER_RATE)) {
    return NextResponse.json(
      { ok: false, error: "Too many orders from this address — please wait a minute." },
      { status: 429, headers: cors },
    );
  }

  let body: { items?: unknown; customer?: unknown; company?: unknown; couponCode?: unknown; shippingId?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400, headers: cors });
  }

  // Honeypot: real customers never see this field. Bots that fill it get a
  // convincing fake success and nothing is saved.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true, id: newOrderId(Date.now()), subtotal: 0 }, { headers: cors });
  }

  const c = (body.customer ?? {}) as Record<string, unknown>;
  const name = str(c.name);
  const email = str(c.email);
  if (!name || !isEmail(email)) {
    return NextResponse.json({ ok: false, error: "A name and a valid email are required." }, { status: 422, headers: cors });
  }

  const rawItems = Array.isArray(body.items) ? (body.items as IncomingItem[]) : [];
  if (rawItems.length === 0) {
    return NextResponse.json({ ok: false, error: "Your bag is empty." }, { status: 422, headers: cors });
  }

  // Recompute names + prices server-side from the live catalog (never trust the
  // client's price), and drop any line whose slug we don't recognise.
  const content = await readContent();
  const { products } = content;
  const items: OrderItem[] = [];
  for (const it of rawItems) {
    const slug = str(it.slug);
    const p = products.find((pp) => pp.slug === slug);
    if (!p) continue;
    const qty = Math.max(1, Math.min(99, Math.floor(Number(it.qty) || 1)));
    const variant = str(it.variant) || undefined;
    items.push({ slug, name: p.name, variant, price: p.price, qty, image: p.images?.[0] });
  }
  if (items.length === 0) {
    return NextResponse.json({ ok: false, error: "No valid items in the order." }, { status: 422, headers: cors });
  }

  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);
  const customer: OrderCustomer = {
    name,
    email,
    phone: str(c.phone) || undefined,
    address: str(c.address) || undefined,
    note: str(c.note) || undefined,
  };

  // Coupon (re-validated server-side; never trust the client's discount).
  const couponInput = str(body.couponCode).toUpperCase();
  const coupon = couponInput
    ? (content.coupons ?? []).find((cp) => cp.code.trim().toUpperCase() === couponInput && cp.active !== false)
    : undefined;
  let discount = 0;
  if (coupon) {
    discount = coupon.kind === "percent" ? Math.round((subtotal * coupon.value) / 100) : Math.round(coupon.value);
    discount = Math.max(0, Math.min(discount, subtotal));
  }

  // Shipping (validated against the configured options; free over the threshold).
  const shipCfg = content.shipping;
  const shipOpt = shipCfg?.options.find((o) => o.id === str(body.shippingId));
  const freeShip = Boolean(shipCfg?.freeOver && subtotal - discount >= shipCfg.freeOver);
  const shippingCost = shipOpt ? (freeShip ? 0 : Math.max(0, Math.round(shipOpt.price))) : undefined;
  const total = Math.max(0, subtotal - discount) + (shippingCost ?? 0);

  const order: Order = {
    id: newOrderId(Date.now() + Math.floor(Math.random() * 1_000_000)),
    createdAt: new Date().toISOString(),
    items,
    subtotal,
    couponCode: coupon?.code,
    discount: discount > 0 ? discount : undefined,
    shippingLabel: shipOpt?.label,
    shippingCost,
    total,
    currency: "ILS",
    customer,
    paymentStatus: "unpaid",
    fulfillmentStatus: "new",
  };

  // Persist durably when storage is configured (Vercel Blob). If it isn't —
  // or the write fails — we don't fail the order: the email below still
  // delivers the full order to the studio.
  let saved = true;
  try {
    await appendOrder(order);
  } catch (e) {
    saved = false;
    console.error("order save failed (continuing to email):", e);
  }

  const emailed = await sendOrderEmails(order); // best-effort; never throws

  // Only fail the checkout if the order was neither saved nor emailed — then the
  // client shows its "email the studio directly" fallback so nothing is lost.
  if (!saved && !emailed) {
    return NextResponse.json(
      { ok: false, error: "We couldn't reach the studio's order system." },
      { status: 503, headers: cors },
    );
  }

  return NextResponse.json({ ok: true, id: order.id, subtotal }, { headers: cors });
}

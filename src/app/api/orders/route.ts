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

  let body: { items?: unknown; customer?: unknown; company?: unknown };
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
  const { products } = await readContent();
  const items: OrderItem[] = [];
  for (const it of rawItems) {
    const slug = str(it.slug);
    const p = products.find((pp) => pp.slug === slug);
    if (!p) continue;
    const qty = Math.max(1, Math.min(99, Math.floor(Number(it.qty) || 1)));
    const variant = str(it.variant) || undefined;
    items.push({ slug, name: p.name, variant, price: p.price, qty });
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

  const order: Order = {
    id: newOrderId(Date.now() + Math.floor(Math.random() * 1_000_000)),
    createdAt: new Date().toISOString(),
    items,
    subtotal,
    currency: "ILS",
    customer,
    paymentStatus: "unpaid",
    fulfillmentStatus: "new",
  };

  try {
    await appendOrder(order);
  } catch {
    return NextResponse.json(
      { ok: false, error: "We couldn't save your order. Please try again or message the studio." },
      { status: 503, headers: cors },
    );
  }

  await sendOrderEmails(order); // best-effort by contract; never throws

  return NextResponse.json({ ok: true, id: order.id, subtotal }, { headers: cors });
}

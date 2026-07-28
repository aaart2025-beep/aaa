import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Creates a Stripe Checkout Session from the cart and returns its URL. Both the
 * Vercel site and the static Hostinger build can call this endpoint (the static
 * build has no API of its own, so it points here). Until STRIPE_SECRET_KEY is
 * set, it replies { configured: false } and the checkout page shows the interim
 * "email your order" path instead — never a surprise mail popup. */

interface LineItem {
  name: string;
  price: number;
  qty: number;
}

const ALLOWED_COUNTRIES = ["US", "IL", "GB", "CA", "AU", "DE", "FR", "NL", "IT", "ES"] as const;

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ configured: false });

  let items: LineItem[] = [];
  try {
    const body = await req.json();
    items = Array.isArray(body.items) ? body.items : [];
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const clean = items.filter((i) => i && typeof i.price === "number" && i.price > 0 && i.qty > 0);
  if (clean.length === 0) return NextResponse.json({ error: "empty cart" }, { status: 400 });

  try {
    const { default: Stripe } = await import("stripe");
    const stripe = new Stripe(key);
    const origin = req.headers.get("origin") ?? new URL(req.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: clean.map((i) => ({
        quantity: Math.max(1, Math.round(i.qty)),
        price_data: {
          currency: "usd",
          unit_amount: Math.round(i.price * 100),
          product_data: { name: i.name },
        },
      })),
      automatic_tax: { enabled: false },
      shipping_address_collection: { allowed_countries: [...ALLOWED_COUNTRIES] },
      success_url: `${origin}/checkout/success`,
      cancel_url: `${origin}/checkout`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "checkout error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

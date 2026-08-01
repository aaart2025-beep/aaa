import { NextResponse } from "next/server";
import { readOrders } from "@/lib/orders/store";
import { orderTotal } from "@/lib/orders/types";

/* HYP hosted payment page — step 1: sign the transaction and hand back the URL
 * to redirect the shopper to (they pay on HYP: card, Bit, Apple/Google Pay).
 *
 * SETUP: add three env vars in Vercel from your HYP Pay account
 * (Settings → Payment Page and API → Verification):
 *   HYP_MASOF  (terminal number)
 *   HYP_KEY    (API key)
 *   HYP_PASSP  (API password)
 * Until they're set this route reports { configured:false } and the checkout
 * falls back to placing the order for the studio to arrange payment.
 *
 * The amount comes from the SERVER-computed order total (read from storage by
 * id) — never from the client — so it can't be tampered with. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MASOF = process.env.HYP_MASOF;
const KEY = process.env.HYP_KEY;
const PASSP = process.env.HYP_PASSP;
const configured = Boolean(MASOF && KEY && PASSP);
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
const BASE = "https://pay.hyp.co.il/p/";

export async function POST(req: Request) {
  if (!configured) return NextResponse.json({ ok: false, configured: false });

  let orderId = "";
  try {
    const body = (await req.json()) as { orderId?: unknown; lang?: unknown };
    orderId = typeof body.orderId === "string" ? body.orderId : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!orderId) return NextResponse.json({ ok: false, error: "Missing order" }, { status: 422 });

  const order = (await readOrders()).find((o) => o.id === orderId);
  if (!order) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });

  const amount = orderTotal(order);
  const params = new URLSearchParams({
    action: "APISign",
    What: "SIGN",
    KEY: KEY!,
    PassP: PASSP!,
    Masof: MASOF!,
    Amount: String(amount),
    Coin: "1", // ILS
    Order: order.id,
    Info: `AAA order ${order.id}`,
    ClientName: order.customer.name,
    email: order.customer.email,
    cell: order.customer.phone ?? "",
    PageLang: "HEB",
    UTF8: "True",
    UTF8out: "True",
    Sign: "True",
    MoreData: "True",
    tmp: "1",
    SuccessUrl: `${SITE}/api/pay/hyp/callback`,
    ErrorUrl: `${SITE}/api/pay/hyp/callback`,
  });

  try {
    const res = await fetch(`${BASE}?${params.toString()}`);
    const text = (await res.text()).trim();
    // A successful SIGN returns the signed query string to append to the base URL.
    if (!res.ok || !text || /error|CCode=[1-9]/i.test(text.slice(0, 80))) {
      console.error("HYP sign failed:", res.status, text.slice(0, 200));
      return NextResponse.json({ ok: false, error: "Payment could not be started." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, url: `${BASE}?${text}` });
  } catch (e) {
    console.error("HYP sign error:", e);
    return NextResponse.json({ ok: false, error: "Payment could not be started." }, { status: 502 });
  }
}

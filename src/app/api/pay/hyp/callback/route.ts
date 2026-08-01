import { NextResponse } from "next/server";
import { updateOrder } from "@/lib/orders/store";

/* HYP hosted payment page — step 2: the shopper returns here after paying.
 * We re-verify the result server-to-server (VERIFY), and on success mark the
 * order paid, then redirect to the confirmation page. On failure we send the
 * shopper back to checkout. Env vars are the same three from the sign route. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MASOF = process.env.HYP_MASOF;
const KEY = process.env.HYP_KEY;
const PASSP = process.env.HYP_PASSP;
const configured = Boolean(MASOF && KEY && PASSP);
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
const BASE = "https://pay.hyp.co.il/p/";

export async function GET(req: Request) {
  const inParams = new URL(req.url).searchParams;
  const ccode = inParams.get("CCode") ?? "";
  const order = inParams.get("Order") ?? "";
  const id = inParams.get("Id") ?? "";

  let paid = false;
  if (configured && id) {
    try {
      // Re-sign the returned params as a VERIFY request; CCode=0 confirms.
      const v = new URLSearchParams();
      inParams.forEach((val, k) => {
        if (k !== "action" && k !== "What") v.set(k, val);
      });
      v.set("action", "APISign");
      v.set("What", "VERIFY");
      v.set("KEY", KEY!);
      v.set("PassP", PASSP!);
      v.set("Masof", MASOF!);
      const res = await fetch(`${BASE}?${v.toString()}`);
      const text = (await res.text()).trim();
      paid = /(^|&)CCode=0(&|$)/.test(text);
    } catch (e) {
      console.error("HYP verify error:", e);
    }
  }

  if (paid && order) {
    try {
      await updateOrder(order, { paymentStatus: "paid", paymentMethod: "HYP" });
    } catch (e) {
      console.error("HYP: could not mark order paid:", e);
    }
    return NextResponse.redirect(`${SITE || new URL(req.url).origin}/checkout/success?ref=${encodeURIComponent(order)}`);
  }

  const origin = SITE || new URL(req.url).origin;
  return NextResponse.redirect(`${origin}/checkout?pay=${ccode === "0" ? "unverified" : "failed"}`);
}

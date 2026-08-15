import { NextResponse } from "next/server";
import { addSubscriber } from "@/lib/subscribers/store";
import { clientKey, corsHeadersFor, rateLimit } from "@/lib/api-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Public email signup (JSON body). No account/password — just collects the
 * address so the studio can send offers, news and discounts. Same abuse
 * controls as the other public endpoints (CORS allowlist + rate limit +
 * honeypot). */

const RATE = { max: 5, windowMs: 60_000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function OPTIONS(req: Request) {
  const cors = corsHeadersFor(req);
  if (!cors) return new NextResponse(null, { status: 403 });
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function POST(req: Request) {
  const cors = corsHeadersFor(req);
  if (!cors) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  if (!rateLimit(`subscribe:${clientKey(req)}`, RATE)) {
    return NextResponse.json({ ok: false, error: "Too many attempts — please wait a minute." }, { status: 429, headers: cors });
  }

  let body: { email?: unknown; company?: unknown; source?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400, headers: cors });
  }

  // Honeypot — a filled "company" field means a bot; pretend success.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true, status: "added" }, { headers: cors });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email." }, { status: 422, headers: cors });
  }
  const source = typeof body.source === "string" ? body.source.slice(0, 40) : "footer";

  try {
    const status = await addSubscriber(email, source);
    return NextResponse.json({ ok: true, status }, { headers: cors });
  } catch (e) {
    console.error("subscribe save failed:", e);
    return NextResponse.json({ ok: false, error: "Could not sign you up right now." }, { status: 503, headers: cors });
  }
}

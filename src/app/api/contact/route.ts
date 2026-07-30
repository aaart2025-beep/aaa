import { NextResponse } from "next/server";
import { appendMessage } from "@/lib/messages/store";
import { newMessageId, type Message } from "@/lib/messages/types";
import { clientKey, corsHeadersFor, rateLimit } from "@/lib/api-guard";
import { sendEmail, emailEnabled, NOTIFY } from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Public contact endpoint. The on-site contact form posts here; the message is
 * saved to the studio inbox (Blob) and emailed (best-effort). Same abuse
 * controls as the order endpoint: allow-listed CORS, a small rate limit and a
 * honeypot. */

const CONTACT_RATE = { max: 4, windowMs: 60_000 };
const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function OPTIONS(req: Request) {
  const cors = corsHeadersFor(req);
  if (!cors) return new NextResponse(null, { status: 403 });
  return new NextResponse(null, { status: 204, headers: cors });
}

export async function POST(req: Request) {
  const cors = corsHeadersFor(req);
  if (!cors) return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });

  if (!rateLimit(`contact:${clientKey(req)}`, CONTACT_RATE)) {
    return NextResponse.json(
      { ok: false, error: "Too many messages — please wait a minute and try again." },
      { status: 429, headers: cors },
    );
  }

  let body: { name?: unknown; email?: unknown; phone?: unknown; subject?: unknown; message?: unknown; company?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400, headers: cors });
  }

  // Honeypot — bots that fill "company" get a fake success and nothing is saved.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true, id: newMessageId(Date.now()) }, { headers: cors });
  }

  const name = str(body.name);
  const email = str(body.email);
  const subject = str(body.subject) || "New message";
  const messageBody = str(body.message);
  const phone = str(body.phone) || undefined;

  if (!name || !isEmail(email) || !messageBody) {
    return NextResponse.json(
      { ok: false, error: "Please add your name, a valid email, and a message." },
      { status: 422, headers: cors },
    );
  }

  const message: Message = {
    id: newMessageId(Date.now() + Math.floor(Math.random() * 1_000_000)),
    createdAt: new Date().toISOString(),
    name,
    email,
    phone,
    subject,
    body: messageBody.slice(0, 5000),
    status: "unread",
  };

  let saved = true;
  try {
    await appendMessage(message);
  } catch (e) {
    saved = false;
    console.error("message save failed (continuing to email):", e);
  }

  // Notify the studio (best-effort — never blocks the submission).
  let emailed = false;
  if (emailEnabled && NOTIFY) {
    const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] ?? c));
    const lines = [
      `From: ${name} <${email}>`,
      phone ? `Phone: ${phone}` : "",
      `Subject: ${subject}`,
      "",
      messageBody,
    ].filter(Boolean);
    emailed = await sendEmail({
      to: NOTIFY,
      replyTo: email,
      subject: `AAA contact — ${subject}`,
      text: lines.join("\n"),
      html: `<div style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.6">
        <p><strong>From:</strong> ${esc(name)} &lt;${esc(email)}&gt;${phone ? `<br><strong>Phone:</strong> ${esc(phone)}` : ""}</p>
        <p><strong>Subject:</strong> ${esc(subject)}</p>
        <hr style="border:none;border-top:1px solid #ddd"/>
        <p style="white-space:pre-wrap">${esc(messageBody)}</p>
      </div>`,
    });
  }

  if (!saved && !emailed) {
    return NextResponse.json(
      { ok: false, error: "We couldn't send your message right now. Please email us directly." },
      { status: 503, headers: cors },
    );
  }

  return NextResponse.json({ ok: true, id: message.id }, { headers: cors });
}

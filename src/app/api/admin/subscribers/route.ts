import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readSubscribers, removeSubscriber } from "@/lib/subscribers/store";
import { sendEmail, emailEnabled, NOTIFY } from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only: list subscribers (newest first). */
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const subscribers = (await readSubscribers()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ ok: true, subscribers });
}

/* Admin-only actions:
 *   { action: "remove", email }                 → unsubscribe someone
 *   { action: "broadcast", subject, message }   → email all subscribers */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  let body: { action?: unknown; email?: unknown; subject?: unknown; message?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  if (body.action === "remove") {
    const email = typeof body.email === "string" ? body.email : "";
    if (!email) return NextResponse.json({ ok: false, error: "Missing email" }, { status: 422 });
    try {
      const ok = await removeSubscriber(email);
      return NextResponse.json({ ok, removed: ok ? email : undefined });
    } catch {
      return NextResponse.json({ ok: false, error: "Could not save (read-only storage)." }, { status: 503 });
    }
  }

  if (body.action === "broadcast") {
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!subject || !message) return NextResponse.json({ ok: false, error: "Add a subject and a message." }, { status: 422 });
    if (!emailEnabled) return NextResponse.json({ ok: false, error: "Email isn't configured yet (set RESEND_API_KEY + verify your domain)." }, { status: 503 });

    const subscribers = await readSubscribers();
    if (!subscribers.length) return NextResponse.json({ ok: false, error: "No subscribers yet." }, { status: 422 });

    // Simple, on-brand HTML wrapper around the studio's message (line breaks kept).
    const safe = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#28221a">
      <div style="font-weight:700;letter-spacing:.28em;font-size:14px">AAA</div>
      <div style="font-size:15px;line-height:1.7;white-space:pre-wrap;margin-top:16px">${safe}</div>
      <p style="font-size:11px;color:#8a8172;margin-top:24px">You're receiving this because you signed up at AAA — amit_amar_art.</p>
    </div>`;

    // Best-effort sequential send (fine for a small list); count successes.
    let sent = 0;
    for (const s of subscribers) {
      const ok = await sendEmail({ to: s.email, subject, html, text: message, replyTo: NOTIFY || undefined });
      if (ok) sent++;
    }
    return NextResponse.json({ ok: true, sent, total: subscribers.length });
  }

  return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 422 });
}

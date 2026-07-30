/* Resend transport. Absent RESEND_API_KEY (local checkout) email is disabled
 * and every send resolves false — callers must treat email as best-effort.
 * One retry on failure; never throws. */

const KEY = process.env.RESEND_API_KEY;
export const emailEnabled = Boolean(KEY);
export const NOTIFY = process.env.NOTIFY_EMAIL ?? "";
// Sender. Override with EMAIL_FROM once the domain is verified in Resend; until
// then Resend's shared "onboarding@resend.dev" works (it can email the account
// owner, e.g. the studio's own inbox).
const FROM = process.env.EMAIL_FROM ?? "AAA — Wearable Art <onboarding@resend.dev>";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

async function post(msg: EmailMessage): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [msg.to],
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
    }),
  });
  // Surface WHY Resend rejected a send (e.g. unverified domain, or test-mode
  // recipient restriction) in the Vercel function logs — otherwise failures are
  // silent and impossible to diagnose.
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`Resend ${res.status} sending "${msg.subject}" -> ${msg.to} (from ${FROM}): ${detail.slice(0, 400)}`);
  }
  return res.ok;
}

export async function sendEmail(msg: EmailMessage): Promise<boolean> {
  if (!emailEnabled) return false;
  try {
    if (await post(msg)) return true;
    return await post(msg); // one retry
  } catch {
    try {
      return await post(msg);
    } catch {
      console.error(`email send failed: ${msg.subject} -> ${msg.to}`);
      return false;
    }
  }
}

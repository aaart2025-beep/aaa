import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Admin-only diagnostic: does the RUNNING deployment actually see the email
 * env vars? Reports presence (never the secret itself) so we can tell whether
 * RESEND_API_KEY / NOTIFY_EMAIL reached production after a redeploy. */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const key = process.env.RESEND_API_KEY ?? "";
  const notify = process.env.NOTIFY_EMAIL ?? "";
  return NextResponse.json({
    ok: true,
    resendKeyPresent: Boolean(key),
    resendKeyLength: key.length, // ~30–40 for a real key; 0 = missing
    resendKeyLooksValid: key.startsWith("re_"),
    notifyEmail: notify || null,
    emailFrom: process.env.EMAIL_FROM ?? "AAA — Wearable Art <onboarding@resend.dev> (default)",
    willAttemptSend: Boolean(key) && Boolean(notify),
  });
}

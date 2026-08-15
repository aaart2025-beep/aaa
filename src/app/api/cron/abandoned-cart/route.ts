import { NextResponse } from "next/server";
import { readPendingCarts, savePendingCarts, type PendingCart } from "@/lib/pending-carts/store";
import { abandonedCartEmail } from "@/lib/email/templates";
import { sendEmail, emailEnabled, NOTIFY } from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* Abandoned-cart reminder cron. Triggered by Vercel Cron (see vercel.json).
 * Finds carts that were captured at checkout but never turned into an order,
 * waited out a short grace period, and haven't been reminded yet — then emails
 * one gentle nudge each and records that it was sent.
 *
 * Security: when CRON_SECRET is set, the request must carry
 * `Authorization: Bearer <CRON_SECRET>` (Vercel Cron adds this automatically).
 * Set CRON_SECRET in the project's Environment Variables so no one else can
 * trigger the reminders. */

const REMIND_AFTER_MS = 4 * 60 * 60 * 1000; // wait 4h before nudging
const STALE_AFTER_MS = 30 * 24 * 60 * 60 * 1000; // give up after 30 days
const ORDERED_KEEP_MS = 24 * 60 * 60 * 1000; // drop converted carts after a day
const MAX_PER_RUN = 200;

function ageMs(iso: string, now: number): number {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : now - t;
}

async function run(req: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = Date.now();
  const carts = await readPendingCarts();

  // Housekeeping: drop converted carts (after a day) and long-stale ones.
  const kept: PendingCart[] = carts.filter((c) =>
    c.orderedAt ? ageMs(c.orderedAt, now) < ORDERED_KEEP_MS : ageMs(c.updatedAt, now) < STALE_AFTER_MS,
  );

  // Due for a reminder: un-ordered, un-reminded, has items, past the grace period.
  const due = kept.filter(
    (c) => !c.orderedAt && !c.remindedAt && c.items.length > 0 && ageMs(c.updatedAt, now) >= REMIND_AFTER_MS,
  );

  if (!emailEnabled) {
    await savePendingCarts(kept); // still persist the housekeeping
    return NextResponse.json({
      ok: true,
      sent: 0,
      due: due.length,
      note: "email not configured — set RESEND_API_KEY + a verified EMAIL_FROM to send reminders",
    });
  }

  let sent = 0;
  for (const cart of due.slice(0, MAX_PER_RUN)) {
    const msg = abandonedCartEmail(cart);
    const ok = await sendEmail({ to: cart.email, replyTo: NOTIFY || undefined, ...msg });
    if (ok) {
      cart.remindedAt = new Date().toISOString(); // mutates the kept record
      sent += 1;
    }
  }

  await savePendingCarts(kept);
  return NextResponse.json({ ok: true, sent, due: due.length });
}

export async function GET(req: Request) {
  return run(req);
}

// Allow a manual POST trigger too (same auth) — handy for testing from the admin.
export async function POST(req: Request) {
  return run(req);
}

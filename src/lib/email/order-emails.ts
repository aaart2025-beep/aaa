import type { Order } from "@/lib/orders/types";
import { sendEmail, NOTIFY } from "@/lib/email/send";
import { orderReceiptEmail, orderAlertEmail, orderShippedEmail } from "@/lib/email/templates";

/* Order-event email orchestration. Best-effort by contract: these functions
 * swallow every failure — an email problem must never surface to checkout. */

/** Sends the customer receipt and the studio alert. Returns true if the studio
 * alert (to NOTIFY_EMAIL) was actually delivered — the caller uses this to know
 * whether the order was captured somewhere even if durable storage failed. */
export async function sendOrderEmails(order: Order): Promise<boolean> {
  const receipt = orderReceiptEmail(order);
  const alert = orderAlertEmail(order);
  const [, alertRes] = await Promise.allSettled([
    sendEmail({ to: order.customer.email, replyTo: NOTIFY || undefined, ...receipt }),
    NOTIFY ? sendEmail({ to: NOTIFY, ...alert }) : Promise.resolve(false),
  ]);
  return alertRes.status === "fulfilled" && alertRes.value === true;
}

export async function sendShippedEmail(order: Order): Promise<void> {
  const msg = orderShippedEmail(order);
  try {
    await sendEmail({ to: order.customer.email, replyTo: NOTIFY || undefined, ...msg });
  } catch {
    /* best-effort */
  }
}

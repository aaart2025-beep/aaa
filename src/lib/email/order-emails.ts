import type { Order } from "@/lib/orders/types";
import { sendEmail, NOTIFY } from "@/lib/email/send";
import { orderReceiptEmail, orderAlertEmail, orderShippedEmail } from "@/lib/email/templates";

/* Order-event email orchestration. Best-effort by contract: these functions
 * swallow every failure — an email problem must never surface to checkout. */

export async function sendOrderEmails(order: Order): Promise<void> {
  const receipt = orderReceiptEmail(order);
  const alert = orderAlertEmail(order);
  await Promise.allSettled([
    sendEmail({ to: order.customer.email, replyTo: NOTIFY || undefined, ...receipt }),
    NOTIFY ? sendEmail({ to: NOTIFY, ...alert }) : Promise.resolve(false),
  ]);
}

export async function sendShippedEmail(order: Order): Promise<void> {
  const msg = orderShippedEmail(order);
  try {
    await sendEmail({ to: order.customer.email, replyTo: NOTIFY || undefined, ...msg });
  } catch {
    /* best-effort */
  }
}

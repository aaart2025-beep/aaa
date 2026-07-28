import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readOrders, updateOrder } from "@/lib/orders/store";
import {
  PAYMENT_STATUSES,
  FULFILLMENT_STATUSES,
  type PaymentStatus,
  type FulfillmentStatus,
  type Order,
} from "@/lib/orders/types";
import { sendShippedEmail } from "@/lib/email/order-emails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only: list all orders (newest first). */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const orders = (await readOrders()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ ok: true, orders });
}

/** Admin-only: update an order's payment / fulfillment status. */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: unknown; paymentStatus?: unknown; paymentMethod?: unknown; fulfillmentStatus?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 422 });

  const patch: Partial<Pick<Order, "paymentStatus" | "paymentMethod" | "fulfillmentStatus">> = {};
  if (typeof body.paymentStatus === "string" && PAYMENT_STATUSES.includes(body.paymentStatus as PaymentStatus)) {
    patch.paymentStatus = body.paymentStatus as PaymentStatus;
  }
  if (typeof body.fulfillmentStatus === "string" && FULFILLMENT_STATUSES.includes(body.fulfillmentStatus as FulfillmentStatus)) {
    patch.fulfillmentStatus = body.fulfillmentStatus as FulfillmentStatus;
  }
  if (typeof body.paymentMethod === "string") {
    patch.paymentMethod = body.paymentMethod.trim() || undefined;
  }

  // Capture the pre-update status so the shipped email fires only on the
  // transition into "shipped", never on repeat saves of the same status.
  const prev = (await readOrders()).find((o) => o.id === id);

  let updated: Order | null;
  try {
    updated = await updateOrder(id, patch);
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save (read-only storage)." }, { status: 503 });
  }
  if (!updated) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });

  if (patch.fulfillmentStatus === "shipped" && prev?.fulfillmentStatus !== "shipped") {
    await sendShippedEmail(updated); // best-effort by contract; never throws
  }

  return NextResponse.json({ ok: true, order: updated });
}

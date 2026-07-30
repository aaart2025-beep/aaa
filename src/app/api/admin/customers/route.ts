import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readOrders } from "@/lib/orders/store";
import { readCustomerNotes, setCustomerNote, deriveCustomers } from "@/lib/customers/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only: the customer list, aggregated from order history + saved notes. */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const [orders, notes] = await Promise.all([readOrders(), readCustomerNotes()]);
  const customers = deriveCustomers(orders, notes);
  return NextResponse.json({ ok: true, customers });
}

/** Admin-only: save (or clear) the private note for one customer. Body: { email, note } */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { email?: unknown; note?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  if (!email) return NextResponse.json({ ok: false, error: "Missing email" }, { status: 422 });
  const note = typeof body.note === "string" ? body.note : "";

  try {
    await setCustomerNote(email, note);
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save (read-only storage)." }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}

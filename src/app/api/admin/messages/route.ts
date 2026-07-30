import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readMessages, updateMessageStatus, deleteMessage } from "@/lib/messages/store";
import { MESSAGE_STATUSES, type MessageStatus } from "@/lib/messages/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin-only: list all messages (newest first). */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const messages = (await readMessages()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ ok: true, messages });
}

/** Admin-only: change a message's status, or delete it.
 *  Body: { id, status } to set status, or { id, action: "delete" } to remove. */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: unknown; status?: unknown; action?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 422 });

  try {
    if (body.action === "delete") {
      const ok = await deleteMessage(id);
      if (!ok) return NextResponse.json({ ok: false, error: "Message not found" }, { status: 404 });
      return NextResponse.json({ ok: true, deleted: id });
    }

    if (typeof body.status === "string" && MESSAGE_STATUSES.includes(body.status as MessageStatus)) {
      const updated = await updateMessageStatus(id, body.status as MessageStatus);
      if (!updated) return NextResponse.json({ ok: false, error: "Message not found" }, { status: 404 });
      return NextResponse.json({ ok: true, message: updated });
    }

    return NextResponse.json({ ok: false, error: "Nothing to update" }, { status: 422 });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save (read-only storage)." }, { status: 503 });
  }
}

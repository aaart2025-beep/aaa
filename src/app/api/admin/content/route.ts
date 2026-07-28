import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readContent, writeContent } from "@/lib/content/store";
import { saveConflict } from "@/lib/content/version";
import type { SiteContent } from "@/lib/content/types";

export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: SiteContent;
  try {
    body = (await req.json()) as SiteContent;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !Array.isArray(body.products)) {
    return NextResponse.json({ ok: false, error: "Invalid content" }, { status: 422 });
  }

  // Version guard: the console saves the whole document, so a save based on an
  // older version than the store holds would silently erase newer edits
  // (another tab, another device). Reject it and let the console reload.
  const current = await readContent();
  if (saveConflict(body.updatedAt, current.updatedAt)) {
    return NextResponse.json(
      { ok: false, conflict: true, error: "Content changed since this console loaded — reloaded the latest version. Please re-apply your edit." },
      { status: 409 },
    );
  }

  let stamped: SiteContent;
  try {
    stamped = await writeContent(body);
  } catch {
    // Serverless/read-only filesystem (e.g. Vercel) — editing needs a database here.
    return NextResponse.json(
      { ok: false, error: "Saving is disabled on this deployment (read-only storage). Connect a database to enable editing." },
      { status: 503 }
    );
  }
  return NextResponse.json({ ok: true, updatedAt: stamped.updatedAt });
}

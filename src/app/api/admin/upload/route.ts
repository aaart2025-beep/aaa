import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { isAdmin } from "@/lib/auth";

const ALLOWED = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No file" }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  if (!ALLOWED.has(ext)) {
    return NextResponse.json({ ok: false, error: "Unsupported file type" }, { status: 415 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeBase = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-]+/gi, "-")
    .slice(0, 40)
    .toLowerCase();
  const name = `${safeBase || "image"}-${Date.now().toString(36)}.${ext}`;

  try {
    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), bytes);
  } catch {
    // Read-only filesystem (e.g. Vercel) — uploads need object storage here.
    return NextResponse.json(
      { ok: false, error: "Uploads are disabled on this deployment (read-only storage). Connect storage to enable uploads." },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, path: `/uploads/${name}` });
}

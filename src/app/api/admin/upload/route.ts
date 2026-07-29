import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";

/* Product image upload. Images go to Vercel Blob (public access) so they are
 * servable on the storefront — the container filesystem is read-only on Vercel,
 * so writing into public/ can't work in production. Requires a connected Blob
 * store (BLOB_READ_WRITE_TOKEN, or an OIDC-connected store via the dashboard). */

export const runtime = "nodejs";

const ALLOWED = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const blobEnabled = Boolean(TOKEN) || Boolean(process.env.BLOB_STORE_ID);

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!blobEnabled) {
    return NextResponse.json(
      { ok: false, error: "Image storage isn't connected yet. In Vercel: Storage → Blob → connect it to this project, then redeploy." },
      { status: 503 },
    );
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

  const safeBase = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9-]+/gi, "-")
    .slice(0, 40)
    .toLowerCase();
  const name = `products/${safeBase || "image"}.${ext}`;

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const { url } = await put(name, bytes, {
      access: "public",
      token: TOKEN, // undefined is fine for an OIDC-connected store
      addRandomSuffix: true,
      contentType: file.type || undefined,
    });
    // The public Blob URL is stored as the product's image and rendered directly.
    return NextResponse.json({ ok: true, path: url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("image upload failed:", e);
    // Surface the real reason so it can be diagnosed from the admin UI.
    return NextResponse.json(
      { ok: false, error: `Upload failed: ${msg}` },
      { status: 503 },
    );
  }
}

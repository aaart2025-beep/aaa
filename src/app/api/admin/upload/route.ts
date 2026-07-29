import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";

/* Product image upload. The client re-encodes the photo to a small JPEG before
 * posting, so the body stays well under Vercel's request limit. We store it on
 * Vercel Blob (public) so it's servable on the storefront. Requires a connected
 * Blob store (BLOB_READ_WRITE_TOKEN is injected automatically when linked). */

export const runtime = "nodejs";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const blobEnabled = Boolean(TOKEN) || Boolean(process.env.BLOB_STORE_ID);

export async function POST(req: Request): Promise<NextResponse> {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized — please sign in again." }, { status: 401 });
  }

  if (!blobEnabled) {
    return NextResponse.json(
      { ok: false, error: "Image storage isn't connected. In Vercel: Storage → Blob → connect it to this project, then redeploy." },
      { status: 503 },
    );
  }

  let file: FormDataEntryValue | null;
  try {
    const form = await req.formData();
    file = form.get("file");
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No file received" }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const { url } = await put(`products/${Date.now().toString(36)}.jpg`, bytes, {
      access: "public",
      token: TOKEN, // undefined is fine for an OIDC-connected store
      addRandomSuffix: true,
      contentType: "image/jpeg",
    });
    return NextResponse.json({ ok: true, path: url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("image upload failed:", e);
    return NextResponse.json({ ok: false, error: `Upload failed: ${msg}` }, { status: 503 });
  }
}

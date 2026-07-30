import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";

/* Product image upload. The client re-encodes the photo to a small JPEG before
 * posting, so the body stays well under Vercel's request limit. The studio's
 * Blob store is a PRIVATE store, so we store the image privately and serve it
 * back through the same-origin /api/media proxy (see src/app/api/media). We
 * return that proxy path as the product's image URL. Requires a connected Blob
 * store (BLOB_READ_WRITE_TOKEN is injected automatically when linked). */

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
    // Keep the real image type so transparent photos (WebP/PNG) stay transparent
    // — storing them as JPEG would flatten see-through areas to black.
    const type = /^image\/(jpeg|png|webp)$/.test(file.type) ? file.type : "image/jpeg";
    const ext = type === "image/webp" ? "webp" : type === "image/png" ? "png" : "jpg";
    const result = await put(`products/${Date.now().toString(36)}.${ext}`, bytes, {
      access: "private",
      token: TOKEN, // undefined is fine for an OIDC-connected store
      addRandomSuffix: true,
      contentType: type,
    });
    // Serve the private blob through our same-origin proxy so the storefront
    // (and next/image) can display it without a public store.
    return NextResponse.json({ ok: true, path: `/api/media/${result.pathname}` });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("image upload failed:", e);
    return NextResponse.json({ ok: false, error: `Upload failed: ${msg}` }, { status: 503 });
  }
}

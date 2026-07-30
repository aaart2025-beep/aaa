import { NextResponse } from "next/server";
import { list } from "@vercel/blob";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const blobEnabled = Boolean(TOKEN) || Boolean(process.env.BLOB_STORE_ID);

/** Admin-only: list every image uploaded to the shop (the `products/` prefix in
 *  the Blob store). Each item is returned with a same-origin proxy URL so the
 *  private blob is viewable, plus its size and upload date. */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!blobEnabled) {
    return NextResponse.json({ ok: true, media: [], note: "Blob storage isn't connected." });
  }

  try {
    const { blobs } = await list({ prefix: "products/", token: TOKEN, limit: 1000 });
    const media = blobs
      .map((b) => ({
        pathname: b.pathname,
        src: `/api/media/${b.pathname}`,
        size: b.size,
        uploadedAt: b.uploadedAt,
      }))
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    return NextResponse.json({ ok: true, media });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: `Could not list media: ${msg}` }, { status: 503 });
  }
}

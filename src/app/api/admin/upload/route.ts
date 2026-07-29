import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAdmin } from "@/lib/auth";

/* Client-upload flow. The browser uploads the image DIRECTLY to Vercel Blob,
 * so it isn't bound by Vercel's ~4.5MB serverless request-body limit (full-size
 * phone photos work). This route only mints a short-lived, admin-gated upload
 * token and receives the completion callback. Requires a connected Blob store
 * (BLOB_READ_WRITE_TOKEN is injected automatically when the store is linked). */

export const runtime = "nodejs";

export async function POST(req: Request): Promise<NextResponse> {
  let body: HandleUploadBody;
  try {
    body = (await req.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => {
        // Only a signed-in admin may obtain an upload token.
        if (!(await isAdmin())) throw new Error("Unauthorized — please sign in again.");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"],
          addRandomSuffix: true,
          maximumSizeInBytes: 20 * 1024 * 1024,
        };
      },
      // Nothing to persist here — the client stores the returned URL on the product.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

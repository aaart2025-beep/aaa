import { get } from "@vercel/blob";

/* Public media proxy. Product images are stored as PRIVATE blobs (the studio's
 * Blob store is a private store), so they aren't directly reachable by URL. This
 * route streams a private blob out under a normal same-origin URL
 * (/api/media/<pathname>) so shoppers — and next/image — can display it. URLs
 * are unique (random suffix on upload), so the response is cached immutably. */

export const runtime = "nodejs";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await params;
  const pathname = (Array.isArray(path) ? path.join("/") : String(path)).replace(/^\/+/, "");
  if (!pathname) return new Response("Not found", { status: 404 });

  try {
    const result = await get(pathname, { access: "private", token: TOKEN });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(result.stream as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": result.blob.contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

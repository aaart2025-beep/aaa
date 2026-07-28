import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { readContent, writeContent } from "@/lib/content/store";

/** Admin-only: repaint a single card's paper tone. Persists to the content
 * store (a no-op on read-only deployments — the change still shows for the
 * session, mirroring the rest of the prototype admin). */
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { slug?: unknown; cardColor?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const { slug, cardColor } = body;
  if (typeof slug !== "string" || typeof cardColor !== "string") {
    return NextResponse.json({ ok: false, error: "Missing slug/cardColor" }, { status: 422 });
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(cardColor)) {
    return NextResponse.json({ ok: false, error: "Invalid colour" }, { status: 422 });
  }

  const content = await readContent();
  const product = content.products.find((p) => p.slug === slug);
  if (!product) {
    return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
  }
  product.cardColor = cardColor;

  try {
    await writeContent(content);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Saved for this session only (read-only storage)." },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true });
}

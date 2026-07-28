import { NextResponse } from "next/server";
import { buildPrompt } from "@/lib/creator/prompt";
import type { Design } from "@/lib/creator/config";
import { BASES } from "@/lib/creator/config";
import { clientKey, corsHeadersFor, rateLimit } from "@/lib/api-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* The AAA studio render engine. Builds the prompt server-side from the design
 * (never trusts a client prompt) and returns an image URL.
 *
 *  • FREE engine (default, no key): a keyless open image model. Costs nothing,
 *    works out of the box. The browser fetches the URL, which generates the
 *    image on demand.
 *  • PRO engine (optional): if FAL_KEY is set we use fal.ai FLUX for faster,
 *    higher-fidelity renders. */

const FAL_MODEL = "fal-ai/flux/schnell";
const VALID_BASES = new Set<string>(BASES.map((b) => b.key));

function isDesign(d: unknown): d is Design {
  if (!d || typeof d !== "object") return false;
  const o = d as Record<string, unknown>;
  return typeof o.base === "string" && VALID_BASES.has(o.base) && Array.isArray(o.zoneColors);
}

/** Stable seed from the prompt so the same design keeps the same render. */
function seedFrom(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 1_000_000;
}

/** The free, keyless engine: build a Pollinations FLUX URL the browser loads. */
function freeRender(prompt: string): string {
  const seed = seedFrom(prompt);
  const params = new URLSearchParams({
    width: "768",
    height: "1024",
    model: "flux",
    nologo: "true",
    seed: String(seed),
  });
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
}

async function falRender(prompt: string, key: string): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch(`https://fal.run/${FAL_MODEL}`, {
      method: "POST",
      headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        image_size: "portrait_4_3",
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false, error: `Render service error (${res.status})` };
    const data = (await res.json()) as { images?: { url?: string }[] };
    const url = data.images?.[0]?.url;
    return url ? { ok: true, url } : { ok: false, error: "No image returned" };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return { ok: false, error: aborted ? "Render timed out" : "Render failed" };
  } finally {
    clearTimeout(timeout);
  }
}

const PREVIEW_RATE = { max: 10, windowMs: 60_000 };

export async function POST(req: Request) {
  const cors = corsHeadersFor(req);
  if (!cors) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }
  if (!rateLimit(`preview:${clientKey(req)}`, PREVIEW_RATE)) {
    return NextResponse.json(
      { ok: false, error: "Too many renders — give the studio a minute." },
      { status: 429, headers: cors },
    );
  }

  let body: { design?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400, headers: cors });
  }
  if (!isDesign(body.design)) {
    return NextResponse.json({ ok: false, error: "Invalid design" }, { status: 422, headers: cors });
  }

  const prompt = buildPrompt(body.design);
  const key = process.env.FAL_KEY;

  // Pro path (only if a key is configured).
  if (key) {
    const r = await falRender(prompt, key);
    if (r.ok) return NextResponse.json({ ok: true, url: r.url, engine: "pro", prompt }, { headers: cors });
    // fall through to the free engine if the pro one errors
  }

  // Free path — always available, no key, no cost.
  return NextResponse.json({ ok: true, url: freeRender(prompt), engine: "free", prompt }, { headers: cors });
}

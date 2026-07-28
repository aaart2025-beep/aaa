/* Abuse controls for the public endpoints (orders, AI preview).
 * CORS: reflect the Origin only when it's on the allowlist — the static
 * Hostinger build posts cross-origin, so the list must include that domain
 * (ALLOWED_ORIGINS env, comma-separated).
 * Rate limit: tiny in-memory sliding window per serverless instance —
 * best-effort abuse damping, not a hard security boundary. */

const DEV_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];

function allowedOrigins(): string[] {
  const fromEnv = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  return [...new Set([...fromEnv, ...(site ? [site] : []), ...DEV_ORIGINS])];
}

/** CORS headers for this request, or null when the Origin is not allowed.
 *  Same-origin requests (the site calling its own API — Origin host matches
 *  the request host) always pass, so a deploy never blocks its own checkout
 *  even before ALLOWED_ORIGINS is configured. Requests without an Origin
 *  header (curl, server-to-server) pass with no CORS headers — the rate
 *  limit + honeypot cover those. */
export function corsHeadersFor(req: Request): Record<string, string> | null {
  const origin = req.headers.get("origin");
  if (!origin) return {};
  const sameOrigin = (() => {
    try {
      const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
      return Boolean(host && new URL(origin).host === host);
    } catch {
      return false;
    }
  })();
  if (!sameOrigin && !allowedOrigins().includes(origin)) return null;
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

const hits = new Map<string, number[]>();
const MAX_TRACKED_KEYS = 5000;

export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "local";
}

/** True when the caller is within budget; false → respond 429. */
export function rateLimit(key: string, opts: { max: number; windowMs: number }): boolean {
  const now = Date.now();
  const floor = now - opts.windowMs;
  const recent = (hits.get(key) ?? []).filter((t) => t > floor);
  if (recent.length >= opts.max) {
    hits.set(key, recent);
    return false;
  }
  hits.set(key, [...recent, now]);
  if (hits.size > MAX_TRACKED_KEYS) {
    for (const [k, v] of hits) {
      if (v.every((t) => t <= floor)) hits.delete(k);
    }
  }
  return true;
}

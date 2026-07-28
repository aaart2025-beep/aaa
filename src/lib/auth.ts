import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/session";

export { ADMIN_COOKIE };

/** Admin auth — credentials and the signing secret live in env only.
 *  If any of them is missing the admin is disabled outright: there is no
 *  default user, password, or forgeable static token. */

export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 1 week

export function authSecret(): string {
  return process.env.AAA_AUTH_SECRET ?? "";
}

export function authConfigured(): boolean {
  return Boolean(process.env.ADMIN_USER && process.env.ADMIN_PASS && authSecret());
}

/** Constant-time-ish string compare (no early exit on first mismatch). */
function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  let diff = ab.length ^ bb.length;
  const len = Math.max(ab.length, bb.length);
  for (let i = 0; i < len; i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}

export function checkCredentials(username: string, password: string): boolean {
  if (!authConfigured()) return false;
  const userOk = safeEqual(username, process.env.ADMIN_USER ?? "");
  const passOk = safeEqual(password, process.env.ADMIN_PASS ?? "");
  return userOk && passOk;
}

/** Server-side: is the current request an authenticated admin? */
export async function isAdmin(): Promise<boolean> {
  if (!authConfigured()) return false;
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value, authSecret());
}

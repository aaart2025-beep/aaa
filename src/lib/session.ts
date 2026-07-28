/* Signed admin session tokens — HMAC-SHA256 via Web Crypto so the same code
 * runs in Node route handlers and the proxy runtime. Token format:
 * "<expiryEpochMs>.<base64url(hmac(expiryEpochMs))>". */

export const ADMIN_COOKIE = "aaa_admin";

const enc = new TextEncoder();

function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array | null {
  try {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

export async function createSessionToken(secret: string, ttlMs: number): Promise<string> {
  const exp = String(Date.now() + ttlMs);
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(exp));
  return `${exp}.${toBase64Url(sig)}`;
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token || !secret) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const exp = token.slice(0, dot);
  const expMs = Number(exp);
  if (!Number.isFinite(expMs) || expMs < Date.now()) return false;
  const sig = fromBase64Url(token.slice(dot + 1));
  if (!sig) return false;
  const key = await hmacKey(secret);
  return crypto.subtle.verify("HMAC", key, sig as BufferSource, enc.encode(exp));
}

import { put, list, del, get } from "@vercel/blob";

/* JSON persistence on Vercel Blob with reliable read-after-write.
 *
 * Overwriting a fixed blob path is NOT immediately consistent — the CDN serves
 * the previous copy until its cache expires. So instead every save writes a NEW,
 * uniquely-named blob under a prefix (e.g. "site-content/v-…"), and reads pick
 * the newest via list() (a strongly-consistent metadata query). Each version's
 * URL is unique and never overwritten, so its content is always fresh. Old
 * versions are pruned to keep a small history.
 *
 * Auth works in two modes: a classic BLOB_READ_WRITE_TOKEN, or — for private
 * stores connected via the Vercel dashboard — project OIDC, where BLOB_STORE_ID
 * is injected and the SDK resolves short-lived credentials itself (token omitted).
 * When neither is present (plain local checkout) callers fall back to the
 * filesystem. */

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const OIDC_STORE = Boolean(process.env.BLOB_STORE_ID);
export const blobEnabled = Boolean(TOKEN) || OIDC_STORE;
const KEEP_VERSIONS = 3;

export async function readJsonBlob<T>(key: string): Promise<T | null> {
  if (!blobEnabled) return null;
  try {
    const { blobs } = await list({ prefix: `${key}/`, token: TOKEN, limit: 1000 });
    if (!blobs.length) return null;
    const newest = blobs.reduce((a, b) =>
      new Date(b.uploadedAt).getTime() > new Date(a.uploadedAt).getTime() ? b : a,
    );
    // Private-store blobs are NOT downloadable via their URLs (403 without
    // auth). get() signs the request under whichever auth mode is active —
    // classic RW token or OIDC store exchange — so it works on both stores.
    const result = await get(newest.pathname, { access: "private", token: TOKEN });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const text = await new Response(result.stream as unknown as BodyInit).text();
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function writeJsonBlob(key: string, data: unknown): Promise<void> {
  if (!blobEnabled) throw new Error("Blob storage not configured (no token or connected store)");
  const stamp = Date.now().toString(36);
  await put(`${key}/v-${stamp}.json`, JSON.stringify(data), {
    access: "private",
    token: TOKEN,
    contentType: "application/json",
    addRandomSuffix: true,
  });
  // prune older versions (best-effort)
  try {
    const { blobs } = await list({ prefix: `${key}/`, token: TOKEN, limit: 1000 });
    const stale = blobs
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(KEEP_VERSIONS);
    if (stale.length) await del(stale.map((b) => b.url), { token: TOKEN });
  } catch {
    /* pruning is non-critical */
  }
}

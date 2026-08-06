import { promises as fs } from "node:fs";
import path from "node:path";
import { defaultContent, DEFAULT_TEXTS } from "./defaults";
import type { SiteContent } from "./types";
import { stampContent } from "./version";
import { blobEnabled, readJsonBlob, writeJsonBlob } from "@/lib/blob-json";

const FILE = path.join(process.cwd(), "data", "site-content.json");
const BLOB_KEY = "site-content";

/** Merge stored content over defaults so newly-added text keys always resolve. */
function normalize(stored: Partial<SiteContent> | null): SiteContent {
  const base = defaultContent();
  if (!stored) return base;
  return {
    texts: { ...DEFAULT_TEXTS, ...(stored.texts ?? {}) },
    products: Array.isArray(stored.products) ? stored.products : base.products,
    collections: Array.isArray(stored.collections) ? stored.collections : base.collections,
    navVisible:
      stored.navVisible && typeof stored.navVisible === "object" ? stored.navVisible : {},
    sizeGuide:
      stored.sizeGuide && Array.isArray(stored.sizeGuide.rows)
        ? { intro: stored.sizeGuide.intro, rows: stored.sizeGuide.rows }
        : base.sizeGuide,
    categorySizes:
      stored.categorySizes && typeof stored.categorySizes === "object"
        ? stored.categorySizes
        : (base.categorySizes ?? {}),
    coupons: Array.isArray(stored.coupons) ? stored.coupons : base.coupons,
    shipping:
      stored.shipping && Array.isArray(stored.shipping.options) ? stored.shipping : base.shipping,
    updatedAt: typeof stored.updatedAt === "string" ? stored.updatedAt : undefined,
  };
}

export async function readContent(): Promise<SiteContent> {
  // Prefer the Blob store (persisted admin edits); fall back to the committed
  // seed file, then to built-in defaults. Never throw.
  if (blobEnabled) {
    const fromBlob = await readJsonBlob<Partial<SiteContent>>(BLOB_KEY);
    if (fromBlob) return normalize(fromBlob);
  }
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return normalize(JSON.parse(raw) as Partial<SiteContent>);
  } catch {
    return defaultContent();
  }
}

/** Persist content with a fresh version stamp; returns the stamped document. */
export async function writeContent(content: SiteContent): Promise<SiteContent> {
  const safe = stampContent(normalize(content));
  if (blobEnabled) {
    await writeJsonBlob(BLOB_KEY, safe);
    return safe;
  }
  // local dev with no Blob token → write the seed file
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(safe, null, 2), "utf8");
  return safe;
}

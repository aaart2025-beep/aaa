import type { MetadataRoute } from "next";
import { readContent } from "@/lib/content/store";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aaa-teal-theta.vercel.app";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: { slug: string; hidden?: boolean }[] = [];
  let collections: { id: string }[] = [];
  try {
    const content = await readContent();
    products = content.products ?? [];
    collections = content.collections ?? [];
  } catch {
    /* content unavailable at build — ship the static routes only */
  }

  const entries: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/collection",
    "/create",
    "/about",
    "/contact",
    "/reviews",
    "/policies/returns",
    "/policies/shipping",
    "/policies/sizes",
    "/policies/care",
  ].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : p.startsWith("/policies") ? 0.3 : 0.8,
  }));

  for (const p of products) {
    if (p.hidden) continue;
    entries.push({ url: `${SITE_URL}/shop/${p.slug}`, changeFrequency: "weekly", priority: 0.7 });
  }
  for (const c of collections) {
    entries.push({ url: `${SITE_URL}/collection/${c.id}`, changeFrequency: "monthly", priority: 0.5 });
  }
  return entries;
}

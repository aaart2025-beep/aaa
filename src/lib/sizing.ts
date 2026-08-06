import type { SiteContent, SizeGuide } from "@/lib/content/types";
import { categoryMeta, type Product } from "@/lib/products";

/* One place that answers "what sizes / guide / dimensions apply here?".
 * The cascade is always: the product's own value → the admin's per-category
 * config → the category's built-in default. So existing products keep working
 * even before any admin edits, and a studio edit in the console flows through
 * everywhere automatically. */

const hasRows = (g?: SizeGuide) =>
  (g?.rows ?? []).some((r) => (r.size ?? "").trim() || (r.measure ?? "").trim());

/** Does this category present dimensions (H/W/D) instead of wearable sizes? */
export function categoryUsesDimensions(content: Pick<SiteContent, "categorySizes">, category: string): boolean {
  const cfg = content.categorySizes?.[category];
  if (cfg && typeof cfg.dimensions === "boolean") return cfg.dimensions;
  return Boolean(categoryMeta(category).dimensions);
}

/** The size options a product should offer: its own → category config → default.
 * Blank entries (possible mid-edit in the admin) are ignored. */
export function sizeOptionsFor(content: Pick<SiteContent, "categorySizes">, product: Pick<Product, "sizes" | "category">): string[] {
  const own = (product.sizes ?? []).filter((s) => s.trim());
  if (own.length) return own;
  const cfg = (content.categorySizes?.[product.category]?.sizes ?? []).filter((s) => s.trim());
  if (cfg.length) return cfg;
  return categoryMeta(product.category).sizes;
}

/** The size-table (measurements) for a product: its own → category → site-wide. */
export function sizeGuideFor(
  content: Pick<SiteContent, "categorySizes" | "sizeGuide">,
  product: Pick<Product, "sizeGuide" | "category">,
): SizeGuide | undefined {
  if (hasRows(product.sizeGuide)) return product.sizeGuide;
  const catGuide = content.categorySizes?.[product.category]?.guide;
  if (hasRows(catGuide)) return catGuide;
  return content.sizeGuide;
}

/** The effective size options for a category (admin config → built-in default),
 * ignoring any single product — used by the admin editor to pre-fill. */
export function categorySizeOptions(content: Pick<SiteContent, "categorySizes">, category: string): string[] {
  const cfg = content.categorySizes?.[category];
  if (cfg?.sizes?.length) return cfg.sizes;
  return categoryMeta(category).sizes;
}

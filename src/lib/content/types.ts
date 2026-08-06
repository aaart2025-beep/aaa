import type { Product } from "@/lib/products";

/** A product is editable in the admin console; shape mirrors the catalog type. */
export type ContentProduct = Product;

export interface ContentCollection {
  id: string;
  title: string;
  subtitle: string;
  images: string[];
  reverse?: boolean;
}

/** One row of the size guide — a size and its exact measurements. */
export interface SizeGuideRow {
  /** e.g. "S", "M", "US 9", "One size". */
  size: string;
  /** Free text — the exact numbers, e.g. "Chest 54cm · Length 72cm". */
  measure: string;
}

/** The admin-editable size guide shown on its own page and per product. */
export interface SizeGuide {
  /** Short intro shown above the table (optional). */
  intro?: string;
  rows: SizeGuideRow[];
}

/** Admin-managed size table for one product category. Everything is optional so
 * an absent/partial entry falls back to the category's built-in defaults. */
export interface CategorySizeConfig {
  /** The selectable size options for this category (picker chips). */
  sizes?: string[];
  /** The measurements table shown via the size-table button for this category. */
  guide?: SizeGuide;
  /** This category is measured by dimensions (H/W/D) instead of wearable sizes. */
  dimensions?: boolean;
}

/** A discount code applied at checkout. */
export interface Coupon {
  code: string;
  /** "percent" → value% off the subtotal; "amount" → value ₪ off. */
  kind: "percent" | "amount";
  value: number;
  /** false disables the code without deleting it. */
  active?: boolean;
}

/** One shipping choice at checkout. */
export interface ShippingOption {
  id: string;
  label: string;
  /** cost in ₪ (0 = free). */
  price: number;
}

/** Shipping configuration for the checkout. */
export interface ShippingConfig {
  options: ShippingOption[];
  /** Free shipping once the subtotal reaches this many ₪ (0/undefined = never). */
  freeOver?: number;
}

/** The full editable content of the site, persisted as JSON. */
export interface SiteContent {
  texts: Record<string, string>;
  products: ContentProduct[];
  collections: ContentCollection[];
  /** Which nav items the admin has toggled on/off (absent key → shown). */
  navVisible?: Record<string, boolean>;
  /** Editable size guide (measurements per size) — the site-wide fallback. */
  sizeGuide?: SizeGuide;
  /** Per-category size tables (options + measurements + dimensions), keyed by
   * the category name. Overrides the built-in defaults; falls back to sizeGuide. */
  categorySizes?: Record<string, CategorySizeConfig>;
  /** Discount codes usable at checkout. */
  coupons?: Coupon[];
  /** Shipping options + free-shipping threshold. */
  shipping?: ShippingConfig;
  /** Version stamp set on every save; the save guard compares against it. */
  updatedAt?: string;
}

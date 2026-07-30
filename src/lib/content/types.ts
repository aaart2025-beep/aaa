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

/** The full editable content of the site, persisted as JSON. */
export interface SiteContent {
  texts: Record<string, string>;
  products: ContentProduct[];
  collections: ContentCollection[];
  /** Which nav items the admin has toggled on/off (absent key → shown). */
  navVisible?: Record<string, boolean>;
  /** Editable size guide (measurements per size). */
  sizeGuide?: SizeGuide;
  /** Version stamp set on every save; the save guard compares against it. */
  updatedAt?: string;
}

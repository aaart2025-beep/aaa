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

/** The full editable content of the site, persisted as JSON. */
export interface SiteContent {
  texts: Record<string, string>;
  products: ContentProduct[];
  collections: ContentCollection[];
  /** Which nav items the admin has toggled on/off (absent key → shown). */
  navVisible?: Record<string, boolean>;
  /** Version stamp set on every save; the save guard compares against it. */
  updatedAt?: string;
}

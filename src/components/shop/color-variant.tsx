"use client";

import * as React from "react";
import { resolveViews, type Product } from "@/lib/products";
import { SpecImage } from "@/components/paper/spec-image";

/* Shared "selected colour" state for a product page. The colour picker (in the
 * buy panel) writes it; the gallery reads it and swaps to that colour's photos.
 * Wrap the product article in <ColorVariantProvider> so both sides share one
 * source of truth. */

interface ColorVariantCtx {
  selected: string | null;
  setSelected: (c: string) => void;
}

const Ctx = React.createContext<ColorVariantCtx | null>(null);

export function ColorVariantProvider({
  colors,
  children,
}: {
  colors: string[];
  children: React.ReactNode;
}) {
  // Default to the first colour so the gallery has a colour to show; null when
  // the piece has no colour options.
  const [selected, setSelected] = React.useState<string | null>(colors[0] ?? null);
  const value = React.useMemo(() => ({ selected, setSelected }), [selected]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useColorVariant() {
  return React.useContext(Ctx);
}

/* The product image stage, reactive to the selected colour. Falls back to the
 * product's main photos when the selected colour has no photos of its own. */
export function ColorGallery({
  product,
  colorImages,
}: {
  product: Product;
  colorImages?: Record<string, string[]>;
}) {
  const ctx = useColorVariant();
  const selected = ctx?.selected ?? null;
  const own = selected ? colorImages?.[selected] : undefined;
  const views =
    own && own.length ? resolveViews({ ...product, images: own, views: undefined }) : resolveViews(product);
  // Remount on colour change so the view tabs reset to the front of the new set.
  return <SpecImage key={selected ?? "base"} name={product.name} views={views} />;
}

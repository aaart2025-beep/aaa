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
  // The first colour is the primary piece — it always shows the main photos.
  // Only an added colour swaps in its own photo set.
  const primary = product.colors?.[0] ?? null;
  const own = selected && selected !== primary ? colorImages?.[selected] : undefined;
  const views = (own && own.length ? resolveViews({ ...product, images: own, views: undefined }) : resolveViews(product))
    // The fabric close-up tab is not shown on the storefront.
    .filter((v) => v.key !== "fabric");
  // Remount on colour change so the view tabs reset to the front of the new set.
  return <SpecImage key={selected ?? "base"} name={product.name} views={views} />;
}

/* The sold-out stamp under the piece, reactive to the selected colour (the whole
 * product, or just the chosen colour, can be sold out). */
export function ColorSoldOutStamp({
  productSoldOut,
  colorSoldOut,
  primary,
  label,
}: {
  productSoldOut?: boolean;
  colorSoldOut?: Record<string, boolean>;
  /** the first colour value; the product flag applies only to it */
  primary?: string;
  label: string;
}) {
  const ctx = useColorVariant();
  const sel = ctx?.selected ?? null;
  const isPrimary = !sel || sel === primary;
  const soldOut = isPrimary ? Boolean(productSoldOut) : Boolean(colorSoldOut?.[sel]);
  if (!soldOut) return null;
  return (
    <span className="inline-block shrink-0 -rotate-[4deg] rounded border-2 border-red-600/80 bg-paper px-3 py-1 font-archivo text-[13px] font-extrabold uppercase tracking-[0.16em] text-red-600 shadow-[2px_2px_0_rgba(40,34,24,0.2)]">
      {label}
    </span>
  );
}

/* The available-sizes summary line under the piece, reactive to the selected
 * colour: shows only that colour's sizes when it has its own set. */
export function ColorSizesLine({
  label,
  baseLabel,
  colorSizes,
  primary,
}: {
  label: string;
  baseLabel: string;
  colorSizes?: Record<string, string[]>;
  /** the first colour value; it uses the base sizes, not a per-colour set */
  primary?: string;
}) {
  const ctx = useColorVariant();
  const sel = ctx?.selected ?? null;
  const per = sel && sel !== primary ? colorSizes?.[sel] : undefined;
  const value = per && per.length ? per.join(", ") : baseLabel;
  return (
    <p className="font-archivo text-[clamp(12px,1.4vw,15px)] leading-tight text-ink">
      <span className="font-bold">{label}:</span> <span className="text-ink/85">{value}</span>
    </p>
  );
}

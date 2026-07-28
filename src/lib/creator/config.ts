import type { Product } from "@/lib/products";
import { defaultPattern, type PatternDef } from "@/lib/creator/patterns";
import { shoeModelOf, type ShoeModelKey } from "@/lib/creator/shoes";

/* The Design-It-Yourself studio: bases, colorable zones, fabrics, finishing
 * cuts and the pricing rules. Palettes are LEARNED from the real catalog —
 * every inspiration preset is an actual AAA piece's colour story. */

export type BaseKey = "hoodie" | "tee" | "cap" | "sneaker";

export interface ZoneDef {
  key: string;
  label: string;
}

export interface FabricOption {
  key: string;
  label: string;
  premium: number;
}

export interface CutOption {
  key: string;
  label: string;
  fee: number;
}

export interface BaseDef {
  key: BaseKey;
  label: string;
  basePrice: number;
  zones: ZoneDef[];
  fabrics: FabricOption[];
  cuts: CutOption[];
  sizes: string[];
  /** initial colours per zone, in zone order */
  defaults: string[];
}

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL"];
const SHOE_SIZES = ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"];

export const BASES: BaseDef[] = [
  {
    key: "hoodie",
    label: "Hoodie",
    basePrice: 180,
    zones: [
      { key: "body", label: "Body" },
      { key: "hood", label: "Hood" },
      { key: "sleeves", label: "Sleeves" },
      { key: "pocket", label: "Pocket" },
      { key: "ribbing", label: "Ribbing" },
    ],
    fabrics: [
      { key: "fleece", label: "Classic fleece — cotton-blend", premium: 0 },
      { key: "organic", label: "Heavy cotton", premium: 20 },
      { key: "sherpa", label: "Sherpa-lined", premium: 35 },
      { key: "acid", label: "Acid-washed fleece", premium: 15 },
    ],
    cuts: [
      { key: "frayed", label: "Frayed hems", fee: 12 },
      { key: "distressed", label: "Distressed wash", fee: 14 },
      { key: "cropped", label: "Cropped cut", fee: 10 },
      { key: "rawstitch", label: "Raw stitch accents", fee: 8 },
    ],
    sizes: CLOTHING_SIZES,
    defaults: ["#e9e1cf", "#e9e1cf", "#e9e1cf", "#d8c9a8", "#cbbd9d"],
  },
  {
    key: "tee",
    label: "T-Shirt",
    basePrice: 90,
    zones: [
      { key: "body", label: "Body" },
      { key: "sleeves", label: "Sleeves" },
      { key: "collar", label: "Collar" },
    ],
    fabrics: [
      { key: "heavy", label: "100% heavy cotton", premium: 0 },
      { key: "slub", label: "Slub cotton", premium: 12 },
      { key: "vintage", label: "Vintage garment wash", premium: 10 },
    ],
    cuts: [
      { key: "frayed", label: "Frayed hems", fee: 12 },
      { key: "cropped", label: "Cropped cut", fee: 10 },
      { key: "rawstitch", label: "Raw stitch accents", fee: 8 },
    ],
    sizes: CLOTHING_SIZES,
    defaults: ["#f3f1ea", "#f3f1ea", "#161616"],
  },
  {
    key: "cap",
    label: "Cap",
    basePrice: 85,
    zones: [
      { key: "crown", label: "Crown" },
      { key: "front", label: "Front panel" },
      { key: "brim", label: "Brim" },
      { key: "button", label: "Button" },
    ],
    fabrics: [
      { key: "twill", label: "Brushed cotton twill", premium: 0 },
      { key: "corduroy", label: "Cotton corduroy", premium: 12 },
      { key: "burlap", label: "Raw burlap mix", premium: 15 },
      { key: "denim", label: "Washed denim", premium: 10 },
    ],
    cuts: [
      { key: "frayedbrim", label: "Frayed brim", fee: 10 },
      { key: "charms", label: "Beaded side charms", fee: 8 },
      { key: "rawstitch", label: "Raw contrast stitching", fee: 8 },
    ],
    sizes: ["One size — adjustable"],
    defaults: ["#d8c9a8", "#d8c9a8", "#1a1a1a", "#1a1a1a"],
  },
  {
    key: "sneaker",
    label: "Sneaker",
    basePrice: 320,
    zones: [
      { key: "upper", label: "Upper" },
      { key: "overlays", label: "Overlays" },
      { key: "wave", label: "Waveform" },
      { key: "laces", label: "Laces" },
      { key: "sole", label: "Sole" },
    ],
    fabrics: [
      { key: "leather", label: "Full-grain leather", premium: 0 },
      { key: "suede", label: "Suede mix", premium: 25 },
      { key: "croc", label: "Croc-embossed panels", premium: 30 },
      { key: "canvas", label: "Canvas", premium: -20 },
    ],
    cuts: [
      { key: "distress", label: "Hand-distressed finish", fee: 18 },
      { key: "splatter", label: "Painted splatter", fee: 15 },
      { key: "fuzzy", label: "Fuzzy rope laces", fee: 9 },
    ],
    sizes: SHOE_SIZES,
    defaults: ["#f3f3ef", "#e8731a", "#1f3a4a", "#f3f3ef", "#f5f5f5"],
  },
];

export const LOGO_STYLES = [
  { key: "printed", label: "Printed", fee: 0 },
  { key: "embroidered", label: "Embroidered", fee: 22 },
  { key: "painted", label: "Hand-painted", fee: 28 },
] as const;
export type LogoStyleKey = (typeof LOGO_STYLES)[number]["key"];

/** Colours included in the base price; each extra distinct colour adds a fee. */
export const INCLUDED_COLORS = 2;
export const EXTRA_COLOR_FEE = 6;

export function baseOf(key: BaseKey): BaseDef {
  return BASES.find((b) => b.key === key) ?? BASES[0];
}

/* ----------------------------- the design ----------------------------- */

export interface Design {
  base: BaseKey;
  /** colour per zone, parallel to baseOf(base).zones */
  zoneColors: string[];
  fabric: string;
  size: string;
  cuts: string[];
  logo: {
    /** position in canvas viewBox coords (0–1 of width/height) */
    x: number;
    y: number;
    scale: number;
    /** rotation in degrees */
    rotation: number;
    color: string;
    style: LogoStyleKey;
  };
  /** body pattern / graphic applied to zone 0 */
  pattern: PatternDef;
  /** sneaker only: which 3D model, and a colour per part (material name) */
  shoeModel: ShoeModelKey;
  shoeColors: Record<string, string>;
  /** which real piece the palette was borrowed from, if any */
  inspiration?: string;
}

export function defaultDesign(base: BaseKey = "hoodie"): Design {
  const def = baseOf(base);
  return {
    base,
    zoneColors: [...def.defaults],
    fabric: def.fabrics[0].key,
    size: def.sizes[Math.min(2, def.sizes.length - 1)],
    cuts: [],
    logo: { x: 0.5, y: 0.46, scale: 1, rotation: 0, color: "#26221a", style: "printed" },
    pattern: defaultPattern(),
    shoeModel: "runner",
    shoeColors: { ...shoeModelOf("runner").defaults },
    inspiration: undefined,
  };
}

/* ------------------------------ pricing ------------------------------- */

export interface PriceLine {
  label: string;
  amount: number;
}

export function priceDesign(design: Design): { lines: PriceLine[]; total: number } {
  const def = baseOf(design.base);
  const lines: PriceLine[] = [{ label: `${def.label} — base`, amount: def.basePrice }];

  const distinct = new Set([...design.zoneColors, design.logo.color]).size;
  const extras = Math.max(0, distinct - INCLUDED_COLORS);
  if (extras > 0) {
    lines.push({ label: `${extras} extra colour${extras > 1 ? "s" : ""}`, amount: extras * EXTRA_COLOR_FEE });
  }

  const fabric = def.fabrics.find((f) => f.key === design.fabric);
  if (fabric && fabric.premium !== 0) lines.push({ label: fabric.label, amount: fabric.premium });

  for (const cutKey of design.cuts) {
    const cut = def.cuts.find((c) => c.key === cutKey);
    if (cut) lines.push({ label: cut.label, amount: cut.fee });
  }

  const logoStyle = LOGO_STYLES.find((l) => l.key === design.logo.style);
  if (logoStyle && logoStyle.fee !== 0) lines.push({ label: `${logoStyle.label} logo`, amount: logoStyle.fee });

  return { lines, total: lines.reduce((sum, l) => sum + l.amount, 0) };
}

/* -------------------- palettes learned from the shop -------------------- */

export interface Inspiration {
  name: string;
  slug: string;
  image?: string;
  colors: string[];
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Every real piece with a colour story becomes a one-tap palette preset. */
export function inspirationsFrom(products: Product[]): Inspiration[] {
  return products
    .filter((p) => (p.colors ?? []).filter((c) => HEX.test(c)).length >= 2)
    .map((p) => ({
      name: p.name,
      slug: p.slug,
      image: p.images[0],
      colors: (p.colors ?? []).filter((c) => HEX.test(c)),
    }));
}

/** The studio's full swatch wall: every colour ever used on a real piece. */
export function paletteFrom(products: Product[]): string[] {
  const seen = new Set<string>();
  for (const p of products) {
    for (const c of p.colors ?? []) {
      if (HEX.test(c)) seen.add(c.toLowerCase());
    }
  }
  // a few studio staples so every base has sensible neutrals available
  for (const c of ["#f5f5f0", "#e9e1cf", "#d8c9a8", "#26221a", "#a6db1e"]) seen.add(c);
  return [...seen];
}

/** Drape a real piece's palette across the zones of the current base. */
export function applyPalette(design: Design, colors: string[], inspiration?: string): Design {
  const def = baseOf(design.base);
  const zoneColors = def.zones.map((_, i) => colors[i % colors.length]);
  return { ...design, zoneColors, inspiration, logo: { ...design.logo, color: colors[colors.length - 1] } };
}

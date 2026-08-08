/* Product catalog for the brand.
 * NOTE: prices and descriptions are placeholders (only the Baroque cap's $100 is
 * confirmed from its tag). Edit freely — this file is the single source of truth.
 * Image paths live in /public/products. */

export type ProductCategory =
  // Existing categories — kept so older products keep working.
  | "Headwear"
  | "Footwear"
  | "Clothing"
  | "Art Object"
  // Newer, more specific categories.
  | "Hoodies"
  | "Shirts"
  | "Tops"
  | "Pants"
  | "Sportswear";

/** Standard clothing size run, shared by the garment categories. */
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
/** EU shoe sizes 36–47. */
const EU_SHOE_SIZES = Array.from({ length: 12 }, (_, i) => `EU ${36 + i}`);

/** One category's built-in defaults. Adding a new category = one entry here
 * (plus its i18n label); everything else (dropdowns, filters, size resolution)
 * derives from this list, so categories stay modular. */
export interface CategoryMeta {
  key: ProductCategory;
  /** i18n key for the customer-facing label. */
  labelKey: string;
  /** Built-in size options for the picker (empty for dimension-based pieces). */
  sizes: string[];
  /** This category is measured by dimensions (H/W/D), not wearable sizes. */
  dimensions?: boolean;
}

/** Single source of truth for categories, in display order. */
export const CATEGORIES: CategoryMeta[] = [
  { key: "Footwear", labelKey: "shop.catFootwear", sizes: EU_SHOE_SIZES },
  { key: "Hoodies", labelKey: "shop.catHoodies", sizes: CLOTHING_SIZES },
  { key: "Shirts", labelKey: "shop.catShirts", sizes: CLOTHING_SIZES },
  { key: "Tops", labelKey: "shop.catTops", sizes: CLOTHING_SIZES },
  { key: "Pants", labelKey: "shop.catPants", sizes: ["28", "30", "32", "34", "36", "38"] },
  { key: "Sportswear", labelKey: "shop.catSportswear", sizes: CLOTHING_SIZES },
  { key: "Clothing", labelKey: "shop.catClothing", sizes: CLOTHING_SIZES },
  { key: "Headwear", labelKey: "shop.catHeadwear", sizes: ["One size"] },
  { key: "Art Object", labelKey: "shop.catArtObject", sizes: [], dimensions: true },
];

const CATEGORY_BY_KEY = new Map<string, CategoryMeta>(CATEGORIES.map((c) => [c.key, c]));

/** Metadata for a category; falls back to Clothing for any unknown value so
 * legacy/edge data never crashes. */
export function categoryMeta(category: string): CategoryMeta {
  return CATEGORY_BY_KEY.get(category) ?? CATEGORY_BY_KEY.get("Clothing")!;
}

/** The five canonical studio views of a piece. Any of them may be missing —
 * the UI renders an honest "to be photographed" slot until the photo exists. */
export interface ProductViews {
  front?: string;
  back?: string;
  sideLeft?: string;
  sideRight?: string;
  /** Material / fabric close-up. */
  fabric?: string;
}

/** One row of a size guide — a size and its exact measurements (free text). */
export interface ProductSizeGuideRow {
  size: string;
  measure: string;
}

/** A per-product size guide: an optional intro line + a measurements table.
 * Shape matches the site-wide SizeGuide so the same table renders both. */
export interface ProductSizeGuide {
  intro?: string;
  rows: ProductSizeGuideRow[];
}

export interface Product {
  slug: string;
  name: string;
  category: ProductCategory;
  /** Price in ILS (shekels). */
  price: number;
  tagline: string;
  description: string;
  details: string[];
  /** First image is the gallery tile + primary view. */
  images: string[];
  /** Available sizes; if omitted, a sensible default per category is used. */
  sizes?: string[];
  /** Colour options — a hex value (e.g. "#1b2a4a") renders a swatch, otherwise a labelled chip. */
  colors?: string[];
  /** Explicit five-view photo set; unset views fall back via resolveViews(). */
  views?: ProductViews;
  /** Spec-sheet fields for the workbook cards; specOf() derives any gaps. */
  garment?: string;
  fit?: string;
  fabric?: string;
  print?: string;
  date?: string;
  /** Paper tone for this card (hex). Unset → a gentle default by position. */
  cardColor?: string;
  /** Percentage off (1–90). When set, the shop shows the sale price, the
   * struck original, and a markdown tag; the cart charges the sale price. */
  discount?: number;
  /** Hidden from the live shop grid (admin can toggle without deleting). */
  hidden?: boolean;
  /** Per-photo display zoom, keyed by image src (1 = natural). Lets the studio
   * size each piece so it sits consistently on its note and product page. */
  imageScale?: Record<string, number>;
  /** Out of stock — shown with a red "sold out" stamp; can't be added to bag. */
  soldOut?: boolean;
  /** A single, one-of-one piece — shown with a "one piece only" mark. */
  onePiece?: boolean;
  /** Sizes that are out of stock: still shown on the product, but struck-through
   * and not selectable. Lets the studio drop individual sizes without deleting them. */
  soldOutSizes?: string[];
  /** This piece's own size guide — its measurements differ per item, so the
   * product page shows this (falling back to the site-wide guide when unset). */
  sizeGuide?: ProductSizeGuide;
  /** Per-colour photo sets, keyed by the colour value in `colors` (hex or name).
   * When a shopper selects a colour that has photos here, the gallery swaps to
   * them; colours without their own photos fall back to the main `images`. */
  colorImages?: Record<string, string[]>;
  /** Physical size for pieces measured by dimensions (art objects / home).
   * Free text so the studio can use any unit ("40 cm", "16 in"). */
  dimensions?: { height?: string; width?: string; depth?: string };
  /** Available sizes per colour, keyed by the colour value in `colors`. When a
   * colour has an entry, the product page shows only those sizes for it; colours
   * without an entry fall back to the product's general sizes. */
  colorSizes?: Record<string, string[]>;
  /** Per-colour sold-out flag, keyed by the colour value. A colour marked here
   * shows the sold-out state (with "Order now") when it's selected. */
  colorSoldOut?: Record<string, boolean>;
}

/** The display zoom for one image of a product (1 = natural size). */
export function scaleFor(p: Pick<Product, "imageScale">, src?: string): number {
  if (!src) return 1;
  const n = p.imageScale?.[src];
  return typeof n === "number" && n > 0 ? n : 1;
}

/** Resolved pricing for a product: the price to charge/show, plus the struck
 * original and the percent when a discount is active. */
export interface PriceInfo {
  /** Current price — the sale price when discounted, else the list price. */
  price: number;
  /** The struck-through list price; present only when discounted. */
  original?: number;
  /** Whole-number percent off (e.g. 20); present only when discounted. */
  percent?: number;
}

export function priceInfo(p: Pick<Product, "price" | "discount">): PriceInfo {
  const pct = p.discount && p.discount > 0 && p.discount < 100 ? Math.round(p.discount) : 0;
  if (!pct) return { price: p.price };
  return { price: Math.round(p.price * (1 - pct / 100)), original: p.price, percent: pct };
}

/** Built-in default size options for a category (before any admin override). */
export function defaultSizes(category: ProductCategory): string[] {
  return categoryMeta(category).sizes;
}

export const products: Product[] = [
  {
    slug: "baroque-bloom-cap",
    name: "Baroque Bloom Cap",
    category: "Headwear",
    price: 100,
    tagline: "Hand-embroidered cobalt scrollwork on cotton.",
    description:
      "A one-off dad cap embroidered by hand with cobalt baroque florals that wrap from the crown to the brim. The signature mark is stitched in burnt orange across the front panel. No two are identical.",
    details: ["Hand embroidery", "Cotton, unstructured 6-panel", "Adjustable strap", "One of one"],
    images: ["/products/cap-baroque.png"],
  },
  {
    slug: "creation-patterned-cap",
    name: "Reaching Hands Cap",
    category: "Headwear",
    price: 100,
    tagline: "Painted hands meet a reworked patterned ground.",
    description:
      "Patterned canvas reimagined with two hand-painted reaching hands — a nod to the Creation of Adam — set against a tonal brown jacquard. A studio rework, finished and sealed by hand.",
    details: ["Hand-painted detail", "Reworked patterned canvas", "Curved brim", "One of one"],
    images: ["/products/cap-creation.png"],
  },
  {
    slug: "bronx-stitch-af1",
    name: "Bronx Stitch Low",
    category: "Footwear",
    price: 320,
    tagline: "Pinstripes and baseball-thread topstitching on a low-top.",
    description:
      "A low-top silhouette customized with navy pinstripes, a hand-laid baseball-stitch in orange thread, and a Bronx-blue side stripe. A love letter to the ballpark, built to be worn.",
    details: ["Hand-stitched leather", "Custom dyed panels", "Sealed & flexed", "Made to order — specify size"],
    images: ["/products/af1-yankees.png"],
  },
  {
    slug: "jade-reptile-1",
    name: "Jade Reptile High",
    category: "Footwear",
    price: 360,
    tagline: "Embossed jade scales on a high-top silhouette.",
    description:
      "A high-top silhouette wrapped in hand-finished jade-green reptilian texture across the overlays and side stripe, contrasted by clean white leather. Statement pair, finished in the studio.",
    details: ["Textured overlays", "Hand-finished color", "Sealed & flexed", "Made to order — specify size"],
    images: ["/products/jordan-jade.png"],
  },
  {
    slug: "plushie-throne",
    name: "Plushie Throne",
    category: "Art Object",
    price: 1400,
    tagline: "A sculptural chair upholstered in reclaimed plush toys.",
    description:
      "A functional art object: a mid-century shell chair re-skinned entirely in salvaged plush toys, each hand-placed and secured. Part seat, part sculpture — a single edition piece.",
    details: ["Reclaimed plush toys", "Solid wood dowel legs", "Functional seating", "One of one — collector piece"],
    images: ["/products/chair-plushie.png"],
  },
  {
    slug: "kilim-wrap-skirt",
    name: "Kilim Wrap Skirt",
    category: "Clothing",
    price: 180,
    tagline: "Woven diamond kilim with braided trim and side tie.",
    description:
      "A wrap mini cut from a woven kilim tapestry in rust, ochre and teal, edged in hand-braided cord and finished with a side tie. Pairs with the Kilim Halter for a full set.",
    details: ["Woven tapestry textile", "Braided cord trim", "Wrap & tie closure", "Limited run"],
    images: ["/products/skirt-kilim.png"],
    colors: ["#9a3b2e", "#1f6f6a", "#c98a2b"],
  },
  {
    slug: "kilim-halter",
    name: "Kilim Halter",
    category: "Clothing",
    price: 150,
    tagline: "Deep-V halter in matching kilim weave.",
    description:
      "A plunging halter in the same rust-and-teal kilim weave, with rope ties at the neck and waist. Designed to pair with the Kilim Wrap Skirt or stand on its own.",
    details: ["Woven tapestry textile", "Rope neck & waist ties", "Lined", "Limited run"],
    images: ["/products/top-kilim.png"],
    colors: ["#9a3b2e", "#1f6f6a", "#c98a2b"],
  },
  {
    slug: "buffalo-plaid-hoodie",
    name: "Buffalo Plaid Cropped Hoodie",
    category: "Clothing",
    price: 160,
    tagline: "Cropped flannel hoodie with crochet-stitched mark.",
    description:
      "A boxy cropped hoodie in soft buffalo-plaid flannel, with the brand mark worked across the kangaroo pocket in raised crochet. Relaxed sleeves, dropped shoulder.",
    details: ["Brushed flannel", "Hand-crochet logo", "Cropped boxy fit", "Front & back shown"],
    images: ["/products/hoodie-plaid-front.png", "/products/hoodie-plaid-back.png"],
  },
  {
    slug: "ecru-frayed-halter",
    name: "Ecru Frayed Knit Halter",
    category: "Clothing",
    price: 130,
    tagline: "Ruffled, frayed-edge knit with bow ties.",
    description:
      "A delicate ecru knit halter with frayed ruffle edges and a front bow tie. The tiny signature is embroidered at the hem in burnt orange. Soft, textured, romantic.",
    details: ["Textured knit", "Frayed ruffle finish", "Bow tie front", "Front & back shown"],
    images: ["/products/halter-ecru-front.png", "/products/halter-ecru-back.png"],
  },
  {
    slug: "coastal-stripe-halter",
    name: "Coastal Stripe Halter",
    category: "Clothing",
    price: 130,
    tagline: "Painterly blue stripe on airy gauze.",
    description:
      "A breezy halter in hand-painted blue-and-white stripe gauze, with neck and waist ties and a frayed hem. Signed at the lower front. Made for warm evenings.",
    details: ["Crinkle gauze", "Hand-painted stripe", "Tie neck & waist", "Front & back shown"],
    images: ["/products/halter-stripe-front.png", "/products/halter-stripe-back.png"],
    colors: ["#2f5d8a", "#f4f1ea"],
  },
  {
    slug: "midnight-bow-cami",
    name: "Midnight Bow Cami",
    category: "Clothing",
    price: 120,
    tagline: "Tie-dyed black satin cami with empire bow.",
    description:
      "A slip-style cami in cloud tie-dyed black satin, with adjustable straps and an empire-line satin bow. The signature is printed small at the hem. Quietly dramatic.",
    details: ["Tie-dyed satin", "Adjustable straps", "Empire bow", "Front & back shown"],
    images: ["/products/cami-black-front.png", "/products/cami-black-back.png"],
  },
  {
    slug: "bloom-sherpa-pullover",
    name: "Bloom Sherpa Pullover",
    category: "Clothing",
    price: 190,
    tagline: "Painted-bloom sherpa with oversized back mark.",
    description:
      "A plush sherpa pullover in sand, splashed with charcoal, apricot and lilac blooms. The full signature mark sits large across the back; a small mark at the front shoulder. Heavyweight and warm.",
    details: ["Heavyweight sherpa fleece", "All-over print", "Oversized back logo", "Front & back shown"],
    images: ["/products/sherpa-front.png", "/products/sherpa-back.png"],
    colors: ["#d8c9b0", "#caa07a", "#9a8bb0"],
  },

  /* ---------------- 2026 drop — hoodies & sweatshirts ---------------- */
  {
    slug: "floral-patch-hoodie",
    name: "Floral Mosaic Hoodie",
    category: "Clothing",
    price: 210,
    tagline: "Sun-faded oxblood with a hand-laid floral mosaic patch.",
    description:
      "A heavyweight oversized hoodie washed to a faded oxblood, with a raw-edged floral mosaic patch appliqued at the chest and crude cross-stitching at the collar and sleeves. No print — every mark is sewn.",
    details: ["Oversized fit", "Cotton-blend", "Hand-stitched mosaic patch", "Garment-washed"],
    images: ["/products/hoodie-floral-patch.png"],
    colors: ["#4a2c2a", "#7a2e2a", "#3a3a3a", "#b8a98c", "#efe7d6"],
  },
  {
    slug: "skate-flannel-hoodie",
    name: "Skate Flannel Hybrid Hoodie",
    category: "Clothing",
    price: 200,
    tagline: "Half hoodie, half flannel — spliced into one.",
    description:
      "A cream oversized hoodie spliced at the hem into a green tartan flannel shirt, finished with a plaid camp collar and a screen-printed skate-star pocket graphic. A patchwork hybrid, one continuous piece.",
    details: ["Oversized fit", "Cotton-blend", "Multicolor screen printing", "Spliced flannel hem & collar"],
    images: ["/products/hoodie-skate-flannel.png"],
    colors: ["#e9e1cf", "#1f4a3c", "#3a6b5e", "#9bb0a6"],
  },
  {
    slug: "bloom-sticker-hoodie",
    name: "Bloom Sticker Hoodie",
    category: "Clothing",
    price: 215,
    tagline: "Black ground, blue bloom, full sticker-collage sleeve.",
    description:
      "A black oversized hoodie with a painted blue smiley-bloom on the chest and one full sleeve collaged in sticker-style graphics. The back carries scattered patches and a hand-drawn signature.",
    details: ["Oversized fit", "Cotton-blend", "Multicolor screen printing", "Front & back shown"],
    images: ["/products/hoodie-bloom-sticker-front.png", "/products/hoodie-bloom-sticker-back.png"],
    colors: ["#141414", "#f2c94c", "#eb5757", "#2d9cdb", "#e7a9c4"],
  },
  {
    slug: "daisy-sleeve-sweatshirt",
    name: "Daisy Sleeve Sweatshirt",
    category: "Clothing",
    price: 185,
    tagline: "A column of daisies down each sleeve.",
    description:
      "A black oversized crewneck with the signature waveform at the chest and a printed daisy running the full length of each sleeve. Soft, heavyweight, quietly graphic.",
    details: ["Oversized fit", "Cotton-blend", "Multicolor screen printing", "Front & back shown"],
    images: ["/products/sweat-daisy-front.png", "/products/sweat-daisy-back.png"],
    colors: ["#f2d23c", "#f5f5f0", "#1a1a1a"],
  },
  {
    slug: "lakers-sweatshirt",
    name: "Purple & Gold Tribute Sweatshirt",
    category: "Clothing",
    price: 195,
    tagline: "Court purple & gold with hand-laced sleeves.",
    description:
      "A black oversized crewneck carrying a purple-and-gold court-tribute print at the chest, finished with hand-laced gold and purple cross-stitching down the sleeves and a woven hem tab.",
    details: ["Oversized fit", "Cotton-blend", "Multicolor screen printing", "Front & back shown"],
    images: ["/products/sweat-lakers-front.png", "/products/sweat-lakers-back.png"],
    colors: ["#141414", "#f2c94c", "#8b5cf6", "#f5f5f0"],
  },
  {
    slug: "souls-are-rare-hoodie",
    name: "Souls Are Rare Hoodie",
    category: "Clothing",
    price: 205,
    tagline: "Royal blue, embroidered in molten orange thread.",
    description:
      "A royal-blue hoodie hand-embroidered front and back in orange and cream thread — scattered scribbles on the front, the mantra “Souls are rare, pretty faces are everywhere” arched across the back.",
    details: ["Oversized fit", "Cotton-blend", "Hand embroidery", "Front & back shown"],
    images: ["/products/hoodie-souls-front.png", "/products/hoodie-souls-back.png"],
    colors: ["#2738c4", "#f2750a", "#e9c39a"],
  },
  {
    slug: "frayed-pocket-sweatshirt",
    name: "Frayed Pocket Sweatshirt",
    category: "Clothing",
    price: 190,
    tagline: "A ruptured shearling pocket on raw cream.",
    description:
      "A cream oversized crewneck with a hand-frayed shearling pocket torn open over a charcoal panel, plus charcoal elbow patches. Deconstructed, tactile, one-of-one in feel.",
    details: ["Oversized fit", "Cotton-blend", "Hand-frayed appliqué", "Front & back shown"],
    images: ["/products/sweat-frayed-front.png", "/products/sweat-frayed-back.png"],
    colors: ["#efe7d6", "#e6d9bf", "#3a3a3a"],
  },
  {
    slug: "zoro-hoodie",
    name: "Swordsman Hoodie",
    category: "Clothing",
    price: 200,
    tagline: "Anime patchwork with katakana sleeves.",
    description:
      "An off-white hoodie with a raw-edged anime swordsman patch at the chest, a matching crest on the back, and black katakana panels running down both sleeves. Finished with a green hand-stitched mark.",
    details: ["Oversized fit", "Cotton-blend", "Appliqué patches & screen print", "Front & back shown"],
    images: ["/products/hoodie-zoro-front.png", "/products/hoodie-zoro-back.png"],
    colors: ["#f3f1ea", "#161616", "#2f9e44"],
  },
  {
    slug: "gym-not-emotionally-hoodie",
    name: "“At The Gym” Acid-Wash Hoodie",
    category: "Clothing",
    price: 195,
    tagline: "Acid-washed olive with a glow-print confession.",
    description:
      "An acid-washed olive hoodie with a soft glow-print waveform at the chest and the back line “I’m in a good place right now. Not emotionally. I’m just at the gym.” Worn-in from the first wear.",
    details: ["Oversized fit", "Cotton-blend", "Acid wash + glow print", "Front & back shown"],
    images: ["/products/hoodie-gym-front.png", "/products/hoodie-gym-back.png"],
    colors: ["#5a5640", "#6b675a", "#d9d2bf"],
  },
  {
    slug: "just-start-sweatshirt",
    name: "“Just Start” Sweatshirt",
    category: "Clothing",
    price: 190,
    tagline: "Ransom-note typography on washed espresso.",
    description:
      "A washed espresso crewneck brushed with the painted waveform on the front and a cut-and-paste ransom-note message on the back: “You will never be ready. Just start.” Scattered stitch marks throughout.",
    details: ["Oversized fit", "Cotton-blend", "Multicolor screen printing", "Front & back shown"],
    images: ["/products/sweat-juststart-front.png", "/products/sweat-juststart-back.png"],
    colors: ["#9a948a", "#8a8170", "#ece6da", "#2a2724"],
  },
  {
    slug: "rainbow-child-hoodie",
    name: "Rainbow Child Hoodie",
    category: "Clothing",
    price: 205,
    tagline: "Sky-washed grey with a surreal cloud print.",
    description:
      "A cloud-washed grey hoodie printed all over with a soft sky, finished with a surreal cherub-and-rainbow graphic on the back and a tangerine waveform above it.",
    details: ["Oversized fit", "Cotton-blend", "All-over + placement print", "Back graphic shown"],
    images: ["/products/hoodie-rainbow-child.png"],
    colors: ["#9a958c", "#e6a23c", "#d8cfc0", "#5a4632"],
  },
  {
    slug: "bubble-hoodie",
    name: "Bubble Hoodie",
    category: "Clothing",
    price: 200,
    tagline: "Iridescent soap bubbles drifting over jet black.",
    description:
      "A jet-black oversized hoodie scattered front, back and sleeves with painterly iridescent soap bubbles and tiny sparkles, anchored by the clean AAA waveform. Understated until the light hits it.",
    details: ["Oversized fit", "Cotton-blend", "Multicolor screen printing", "Front & back shown"],
    images: ["/products/hoodie-bubble.png"],
    colors: ["#121212", "#c9d2db", "#f5f5f5"],
  },
  {
    slug: "luffy-straw-hat-hoodie",
    name: "Straw-Hat Crew Hoodie",
    category: "Clothing",
    price: 200,
    tagline: "Sunflower yellow with an embroidered jolly crest.",
    description:
      "A sunflower-yellow hoodie with an embroidered straw-hat skull crest at the chest and bold black katakana sleeve panels joined by red contrast stitching. Loud, clean, collectible.",
    details: ["Oversized fit", "Cotton-blend", "Embroidery + screen print", "Front shown"],
    images: ["/products/hoodie-luffy.png"],
    colors: ["#f2c029", "#161616", "#c0392b"],
  },
  {
    slug: "roland-garros-tracksuit",
    name: "Clay Court Tracksuit",
    category: "Clothing",
    price: 280,
    tagline: "Two-piece half-zip in oxblood, court-print back.",
    description:
      "A heavyweight oxblood half-zip and jogger set, with an embroidered waveform at the chest and a clay-court print across the back. A complete two-piece — top and bottoms together.",
    details: ["Oversized fit · 2-piece set", "Cotton-blend", "Embroidery + screen print", "Back graphic shown"],
    images: ["/products/tracksuit-roland-garros.png"],
    colors: ["#5a241c", "#f2d23c"],
  },
  {
    slug: "blanket-stitch-tracksuit",
    name: "Blanket-Stitch Tracksuit",
    category: "Clothing",
    price: 280,
    tagline: "Oxblood half-zip ringed in hand blanket-stitch.",
    description:
      "An oxblood half-zip and jogger set hand-finished with a sunflower blanket-stitch yoke and a small scrawled mark on the thigh. Heavyweight fleece, made to wear as a set or split.",
    details: ["Oversized fit · 2-piece set", "Cotton-blend", "Hand blanket-stitch", "Set shown"],
    images: ["/products/tracksuit-yellow-stitch.png"],
    colors: ["#5a241c", "#f2d23c"],
  },

  /* ---------------- 2026 drop — tees ---------------- */
  {
    slug: "deathly-hallows-tee",
    name: "Hallows Gold-Foil Tee",
    category: "Clothing",
    price: 95,
    tagline: "Hand-gilded occult crest on washed black.",
    description:
      "A washed-black heavyweight tee with a hand-gilded gold crest on the back — three medallions, the waveform and a reworked hallows symbol. Oversized, drapey, gallery-ready.",
    details: ["Oversized fit", "Heavy cotton", "Gold-foil print", "Back graphic"],
    images: ["/products/tee-deathly-hallows.png"],
    colors: ["#1a1a1a", "#b08d4f"],
  },
  {
    slug: "aaa-pocket-tee",
    name: "Patch Pocket Tee",
    category: "Clothing",
    price: 110,
    tagline: "Khaki box-tee with a denim logo pocket.",
    description:
      "An oversized khaki box-tee with a denim chest pocket carrying the embroidered AAA frame, plus embroidered butterflies and tonal line-work on the sleeve. A runway piece, finished by hand.",
    details: ["Oversized boxy fit", "Heavy cotton", "Denim pocket + embroidery", "Studio & runway shown"],
    images: ["/products/tee-pocket.png", "/products/tee-pocket-runway.png"],
    colors: ["#9a8156", "#46506b", "#3a64a8"],
  },

  /* ---------------- 2026 drop — activewear ---------------- */
  {
    slug: "sculpt-bodysuit",
    name: "Sculpt Bodysuit",
    category: "Clothing",
    price: 140,
    tagline: "Seamed compression unitard with an open back.",
    description:
      "A second-skin short unitard in clay rust, paneled with sculpting seams and finished with an open keyhole back and the embroidered AAA mark. Studio-to-street performance wear.",
    details: ["Compression fit", "Nylon / elastane", "Open keyhole back", "Front & back shown"],
    images: ["/products/bodysuit-rust.png"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["#9a4a3c"],
  },

  /* ---------------- 2026 drop — headwear ---------------- */
  {
    slug: "corduroy-patch-cap",
    name: "Corduroy Distress Cap",
    category: "Headwear",
    price: 95,
    tagline: "Sand corduroy with a frayed denim AAA patch.",
    description:
      "A sand-corduroy six-panel cap with a frayed powder-blue denim AAA patch, raw contrast stitching around the brim and tiny beaded charms at the side. Distressed and finished entirely by hand.",
    details: ["Cotton corduroy", "Frayed denim patch", "Adjustable strap", "One of one"],
    images: ["/products/cap-corduroy.png", "/products/cap-corduroy-views.png"],
    colors: ["#d8c9a8", "#a9c3d6"],
  },
  {
    slug: "zebra-brim-cap",
    name: "Zebra Brim Cap",
    category: "Headwear",
    price: 90,
    tagline: "Black crown, hand-painted zebra brim.",
    description:
      "A washed-black six-panel cap with the AAA waveform stitched in natural thread across the front and a hand-painted zebra brim. Clean from the back, wild from the front.",
    details: ["Brushed cotton twill", "Hand-painted brim", "Adjustable strap", "Shown from 3 angles"],
    images: ["/products/cap-zebra.png", "/products/cap-zebra-views.png"],
    colors: ["#1a1a1a", "#efe7d6"],
  },
  {
    slug: "peacock-burlap-cap",
    name: "Peacock Burlap Cap",
    category: "Headwear",
    price: 100,
    tagline: "Espresso cotton, raw burlap brim, peacock plume.",
    description:
      "An espresso cap with a frayed raw-burlap brim, a burlap AAA patch hand-embroidered in brown, and a real peacock feather tucked at the side. Rustic, one-off, collectible.",
    details: ["Cotton + raw burlap", "Hand embroidery", "Peacock feather detail", "One of one"],
    images: ["/products/cap-peacock-burlap.png"],
    colors: ["#4a3a2a", "#c8b78f", "#1f6f8a"],
  },
  {
    slug: "washed-line-cap",
    name: "Washed Line-Art Cap",
    category: "Headwear",
    price: 85,
    tagline: "Stone-washed dad cap with painted line-work.",
    description:
      "A stone-washed grey unstructured dad cap with the embroidered AAA waveform and a single continuous painted line tracing across the crown and brim. Soft, low-profile, everyday.",
    details: ["Garment-washed cotton", "Embroidery + hand-painted line", "Adjustable strap", "Low profile"],
    images: ["/products/cap-washed-line.png"],
    colors: ["#6f6a63", "#d9d2c2"],
  },

  /* ---------------- 2026 drop — footwear ---------------- */
  {
    slug: "flame-dunk",
    name: "Flame Low",
    category: "Footwear",
    price: 360,
    tagline: "Hand-painted flames over blaze orange.",
    description:
      "A low-top silhouette hand-painted in blaze orange with airbrushed flames wrapping the side stripe, navy laces and a tonal AAA mark at the toe. Sealed and flexed for wear.",
    details: ["Hand-painted leather", "Sealed & flexed", "Made to order — specify size", "One of one"],
    images: ["/products/dunk-flame.png"],
    colors: ["#e8731a", "#1f3a4a", "#f2c94c"],
  },
  {
    slug: "cloud-dunk",
    name: "Cloud Low",
    category: "Footwear",
    price: 360,
    tagline: "Painted skies, candy-floss laces, glitter side stripe.",
    description:
      "A pastel low-top silhouette hand-painted with a blue-sky-and-clouds upper, a candy-pink panel, fuzzy rope laces and a gold-glitter side stripe. Dreamy and one-of-one.",
    details: ["Hand-painted leather", "Rope laces", "Sealed & flexed", "Made to order — specify size"],
    images: ["/products/dunk-cloud.png"],
    colors: ["#a9d4e6", "#f2b9c4", "#f5f5f5", "#e6c66a"],
  },
  {
    slug: "marble-flame-af1",
    name: "Marbled Flame Low",
    category: "Footwear",
    price: 340,
    tagline: "Tonal marble camo with red rope laces.",
    description:
      "A low-top silhouette finished in a tonal sand marble-camo with a red side stripe, red rope laces and a small painted seal. Warm, textural, built to be worn.",
    details: ["Hand-finished color", "Rope laces", "Sealed & flexed", "Made to order — specify size"],
    images: ["/products/af1-marble-flame.png"],
    colors: ["#d6bd8a", "#c0392b", "#b08d5a"],
  },
  {
    slug: "notebook-af1",
    name: "Notebook Low",
    category: "Footwear",
    price: 330,
    tagline: "Lined-paper doodles on white leather.",
    description:
      "A white low-top hand-drawn to look like lined notebook paper — blue rules, red-pen doodles, a scrawled AAA and blue laces. A sketchbook you can wear.",
    details: ["Hand-drawn & sealed", "Sealed & flexed", "Made to order — specify size", "One of one"],
    images: ["/products/af1-notebook.png"],
    colors: ["#f5f5f5", "#2d6cdf", "#eb5757"],
  },
  {
    slug: "jade-croc-jordan-mid",
    name: "Jade Croc Mid",
    category: "Footwear",
    price: 400,
    tagline: "Embossed green croc overlays on white.",
    description:
      "A mid-top silhouette wrapped in embossed jade-green crocodile texture across the overlays and side stripe, with a hand-drawn leaf-wing logo. Clean white leather underneath.",
    details: ["Textured overlays", "Hand-finished color", "Sealed & flexed", "Made to order — specify size"],
    images: ["/products/jordan-croc-green.png"],
    colors: ["#f3f3ef", "#6fae3a"],
  },
  {
    slug: "neon-leaf-jordan-high",
    name: "Neon Leaf High",
    category: "Footwear",
    price: 410,
    tagline: "Volt-green hits with a hand-drawn leaf wing.",
    description:
      "A high-top silhouette in white leather with volt and lime-green panels, fuzzy neon laces, a green-line waveform on the sole and a hand-drawn leaf-wing logo. Electric and one-off.",
    details: ["Hand-finished color", "Fuzzy laces", "Sealed & flexed", "Made to order — specify size"],
    images: ["/products/jordan-neon-green.png"],
    colors: ["#f3f3ef", "#8fd400"],
  },
  {
    slug: "mona-lisa-jordan-mid",
    name: "Mona Lisa Mid",
    category: "Footwear",
    price: 420,
    tagline: "A Renaissance portrait painted across the panels.",
    description:
      "A mid-top silhouette hand-painted with a Mona Lisa portrait wrapping the heel and quarter, olive-and-bronze leather, an olive side stripe and a gold AAA mark. A wearable old-master.",
    details: ["Hand-painted leather", "Sealed & flexed", "Made to order — specify size", "One of one"],
    images: ["/products/jordan-mona-lisa.png"],
    colors: ["#5a5236", "#3a2f24", "#cfc6b0"],
  },

  /* ---------------- 2026 drop — art objects ---------------- */
  {
    slug: "shearling-aaa-letters",
    name: "Shearling AAA Letters",
    category: "Art Object",
    price: 680,
    tagline: "Plush freestanding logo letters for the home.",
    description:
      "A set of three freestanding AAA letters built up in cream shearling over a sculpted base — a soft, tactile logo object to lean against a wall or shelf. Sold as a three-letter set.",
    details: ["Shearling over sculpted core", "Freestanding set of three", "Hand-finished", "One of one"],
    images: ["/products/art-shearling-letters.png"],
    sizes: ["One of one"],
    colors: ["#e7ddcb", "#3a64a8"],
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** Lightweight keyword search across the catalog. Every whitespace-separated
 * term must appear somewhere in the product (name, category, tagline,
 * description, details, colours or spec fields) — so "blue cap" narrows to
 * blue caps. Hidden products are skipped. Results are ranked so that name and
 * category hits float to the top. Pure & client-safe (no I/O). */
export function searchProducts(query: string, limit = 8): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const scored: { p: Product; score: number }[] = [];
  for (const p of products) {
    if (p.hidden) continue;
    const name = p.name.toLowerCase();
    const category = p.category.toLowerCase();
    const hay = [
      p.name,
      p.category,
      p.tagline,
      p.description,
      ...(p.details ?? []),
      ...(p.colors ?? []),
      p.garment ?? "",
      p.fabric ?? "",
      p.print ?? "",
    ]
      .join(" ")
      .toLowerCase();
    let score = 0;
    let matchedAll = true;
    for (const t of terms) {
      if (!hay.includes(t)) {
        matchedAll = false;
        break;
      }
      if (name.includes(t)) score += 3;
      else if (category.includes(t)) score += 2;
      else score += 1;
    }
    if (matchedAll) scored.push({ p, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.p);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(price);
}

/* ------------------------------------------------------------------ */
/* Workbook spec sheet — derive the card fields the sketchbook UI      */
/* needs from what each product already declares.                      */
/* ------------------------------------------------------------------ */

export interface ProductSpec {
  garment: string;
  fit: string;
  fabric: string;
  print: string;
  date: string;
}

const GARMENT_BY_NAME: [RegExp, string][] = [
  [/hoodie/i, "Hoodie"],
  [/sweatshirt|crewneck/i, "Sweatshirt"],
  [/tracksuit/i, "Tracksuit"],
  [/bodysuit|unitard/i, "Bodysuit"],
  [/tee\b|t-shirt/i, "T-Shirt"],
  [/halter/i, "Halter"],
  [/cami/i, "Cami"],
  [/skirt/i, "Skirt"],
  [/pullover|sherpa/i, "Pullover"],
];

function findDetail(details: string[], pattern: RegExp): string | undefined {
  return details.find((d) => pattern.test(d));
}

/** Resolve the spec-sheet rows, preferring explicit fields and falling back
 * to what the catalog copy already says (details, category, name). */
const GARMENT_BY_CATEGORY: Partial<Record<ProductCategory, string>> = {
  Headwear: "Cap",
  Footwear: "Sneaker",
  "Art Object": "Art Object",
  Hoodies: "Hoodie",
  Shirts: "Shirt",
  Tops: "Top",
  Pants: "Pants",
  Sportswear: "Activewear",
};

export function specOf(p: Product): ProductSpec {
  const garment =
    p.garment ??
    GARMENT_BY_CATEGORY[p.category] ??
    (GARMENT_BY_NAME.find(([re]) => re.test(p.name))?.[1] ?? "Garment");

  const fitDetail = findDetail(p.details, /fit\b/i);
  const fit =
    p.fit ??
    (fitDetail
      ? fitDetail.replace(/\s*fit\b.*$/i, "").trim() || "Oversized"
      : p.category === "Footwear"
        ? "True to size"
        : p.category === "Headwear"
          ? "Adjustable"
          : p.category === "Art Object"
            ? "One of one"
            : "Oversized");

  const fabric =
    p.fabric ??
    findDetail(p.details, /cotton|polyester|leather|nylon|elastane|flannel|satin|gauze|knit|corduroy|burlap|twill|sherpa|shearling|kilim|tapestry|denim/i) ??
    (p.category === "Footwear" ? "Leather" : "Mixed media");

  const print =
    p.print ??
    findDetail(p.details, /print|embroider|paint|stitch|appliqu|patch|foil|drawn|crochet|wash/i) ??
    "Hand-finished";

  return { garment, fit, fabric, print, date: p.date ?? "2026" };
}

/** Sizes line for the spec sheet ("S, M, L, XL" / "EU 39 – EU 46" / …). */
export function sizesLabel(p: Product): string {
  const sizes = p.sizes?.length ? p.sizes : defaultSizes(p.category);
  if (sizes.length > 2 && sizes.every((s) => /^(US|EU) \d+$/.test(s))) {
    return `${sizes[0]} – ${sizes[sizes.length - 1]}`;
  }
  return sizes.join(", ");
}

/* ------------------------------------------------------------------ */
/* Five-view resolution — front / back / side L / side R / fabric.     */
/* ------------------------------------------------------------------ */

export type ViewKey = keyof ProductViews;

export interface ResolvedView {
  key: ViewKey;
  /** Tab label on the photo plate. */
  label: string;
  /** Figure number caption, "Fig. 01" … "Fig. 05". */
  fig: string;
  /** Image to show; undefined renders the dashed "to be photographed" slot. */
  src?: string;
  /** Render as a zoomed-in detail crop (auto fabric close-up). */
  zoom?: boolean;
  /** Studio-set display zoom for this photo (1 = natural). */
  scale?: number;
}

const VIEW_LABELS: Record<ViewKey, string> = {
  front: "Front",
  back: "Back",
  sideLeft: "Side · L",
  sideRight: "Side · R",
  fabric: "Fabric",
};

/** Resolve the canonical five views for a product. Front falls back to the
 * first catalog image and back to the second; the fabric close-up falls back
 * to a zoomed detail of the front shot so every piece has a material view. */
export function resolveViews(p: Product): ResolvedView[] {
  const front = p.views?.front ?? p.images[0];
  const back = p.views?.back ?? p.images[1];
  const fabricSrc = p.views?.fabric ?? front;

  const order: { key: ViewKey; src?: string; zoom?: boolean }[] = [
    { key: "front", src: front },
    { key: "back", src: back },
    { key: "sideLeft", src: p.views?.sideLeft },
    { key: "sideRight", src: p.views?.sideRight },
    { key: "fabric", src: fabricSrc, zoom: !p.views?.fabric },
  ];

  return order.map((v, i) => ({
    key: v.key,
    label: VIEW_LABELS[v.key],
    fig: `Fig. ${String(i + 1).padStart(2, "0")}`,
    src: v.src,
    zoom: v.zoom && Boolean(v.src),
    scale: scaleFor(p, v.src),
  }));
}

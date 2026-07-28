import { baseOf, LOGO_STYLES, type Design } from "@/lib/creator/config";

/* Turns the live design into a descriptive prompt for the image model. Colours
 * are translated from hex to the nearest plain colour name (models read words,
 * not hex), and the framing is tailored per garment type. */

const NAMED: [string, [number, number, number]][] = [
  ["white", [245, 245, 245]],
  ["cream", [244, 239, 226]],
  ["beige", [231, 217, 191]],
  ["tan", [214, 189, 138]],
  ["light brown", [176, 141, 90]],
  ["brown", [107, 79, 46]],
  ["espresso", [58, 47, 36]],
  ["black", [22, 22, 22]],
  ["charcoal", [58, 58, 58]],
  ["grey", [154, 149, 140]],
  ["red", [192, 57, 43]],
  ["orange", [232, 115, 26]],
  ["rust", [154, 74, 60]],
  ["maroon", [90, 36, 28]],
  ["yellow", [242, 201, 76]],
  ["gold", [176, 141, 79]],
  ["lime green", [143, 212, 0]],
  ["green", [47, 158, 68]],
  ["olive", [90, 86, 64]],
  ["teal", [31, 111, 106]],
  ["blue", [45, 108, 223]],
  ["navy", [31, 58, 74]],
  ["sky blue", [169, 212, 230]],
  ["purple", [139, 92, 246]],
  ["pink", [231, 169, 196]],
];

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [200, 200, 200];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function colorName(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  let best = NAMED[0][0];
  let bestD = Infinity;
  for (const [name, [nr, ng, nb]] of NAMED) {
    const d = (r - nr) ** 2 + (g - ng) ** 2 + (b - nb) ** 2;
    if (d < bestD) {
      bestD = d;
      best = name;
    }
  }
  return best;
}

/** Where the logo roughly sits, for the prompt. */
function logoPlacement(y: number): string {
  if (y < 0.33) return "upper chest";
  if (y > 0.66) return "lower hem";
  return "centre chest";
}

/** Clean material word from a fabric label ("Classic fleece — 70% …" → "fleece"). */
function fabricWord(label: string): string {
  return label
    .split("—")[0]
    .replace(/\b(classic|heavy|organic|washed|vintage|brushed|full-grain|cotton)\b/gi, (m) => m.toLowerCase())
    .trim()
    .toLowerCase();
}

export function buildPrompt(design: Design): string {
  const def = baseOf(design.base);
  // "{colour} {zone}" reads more naturally to the model than "{zone} in {colour}".
  const zoneBits = def.zones
    .map((z, i) => `${colorName(design.zoneColors[i] ?? "#cccccc")} ${z.label.toLowerCase()}`)
    .join(", ");
  const fabric = fabricWord(def.fabrics.find((f) => f.key === design.fabric)?.label ?? "cotton");
  const cuts = design.cuts
    .map((c) => def.cuts.find((x) => x.key === c)?.label?.toLowerCase())
    .filter(Boolean)
    .join(", ");
  const logoStyle = LOGO_STYLES.find((l) => l.key === design.logo.style)?.label.toLowerCase() ?? "printed";
  const logoColor = colorName(design.logo.color);

  // Subject framing tailored per garment for a clean, recognisable product shot.
  const framing: Record<typeof design.base, string> = {
    hoodie:
      "a single oversized pullover hoodie on an invisible ghost-mannequin, front view, hood and kangaroo pocket visible",
    tee: "a single oversized t-shirt on an invisible ghost-mannequin, front view, neatly presented",
    cap: "a single structured six-panel baseball cap with a curved brim, three-quarter front view",
    sneaker: "a single low-top sneaker, clean side-profile view, laces and chunky rubber sole",
  };

  return [
    `Professional studio product photograph of ${framing[design.base]},`,
    `made of ${fabric},`,
    `colourway: ${zoneBits},`,
    cuts ? `details: ${cuts},` : "",
    `branded with one small ${logoStyle} "AAA" zig-zag triple-peak waveform emblem in ${logoColor} on the ${logoPlacement(design.logo.y)},`,
    "centred on a seamless soft-cream studio backdrop, even softbox lighting, gentle shadow, crisp focus,",
    "ultra-detailed fabric texture, photorealistic, high resolution, premium fashion e-commerce hero shot,",
    "no people, no mannequin head, no extra logos, no text, no watermark",
  ]
    .filter(Boolean)
    .join(" ");
}

/** A render seed that stays stable per garment type, so changing colours/fabric
 * updates the SAME piece instead of regenerating a random new composition. */
export function renderSeed(design: Design): number {
  const s = design.base;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 100000;
}

/** Client-safe keyless render URL (Pollinations FLUX) for a design — the
 * browser loads it directly, no server route needed. */
export function freeRenderUrl(design: Design): string {
  const prompt = buildPrompt(design);
  const params = new URLSearchParams({
    width: "800",
    height: "1040",
    model: "flux",
    nologo: "true",
    seed: String(renderSeed(design)),
  });
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
}

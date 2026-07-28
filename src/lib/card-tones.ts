/* Gentle, pastel paper tones for the spec-sheet "notes" — light browns, beiges,
 * creams and soft pastels. Cards cycle through these by default so the board
 * looks hand-assembled, and an admin can repaint any single card live. */

export interface CardTone {
  key: string;
  label: string;
  color: string;
}

export const CARD_TONES: CardTone[] = [
  { key: "cream", label: "Cream", color: "#f4efe2" },
  { key: "beige", label: "Beige", color: "#ece2cf" },
  { key: "sand", label: "Sand", color: "#e7d9bf" },
  { key: "tan", label: "Light brown", color: "#ddc8a6" },
  { key: "oat", label: "Oat", color: "#efe8da" },
  { key: "linen", label: "Linen", color: "#f1e9de" },
  { key: "blush", label: "Blush", color: "#efe0d9" },
  { key: "rose", label: "Rose", color: "#ecdadb" },
  { key: "sage", label: "Sage", color: "#e4e7d7" },
  { key: "sky", label: "Sky", color: "#dde7ea" },
];

/** A pleasing rotation so neighbours never share a tone — warm-dominant with a
 * pastel sprinkled in, the way a stack of mixed paper would fall. */
const DEFAULT_ORDER = ["cream", "beige", "oat", "sand", "linen", "tan", "blush", "sage", "cream", "sky", "rose", "beige"];

export function defaultToneFor(index: number): string {
  const key = DEFAULT_ORDER[index % DEFAULT_ORDER.length];
  return (CARD_TONES.find((t) => t.key === key) ?? CARD_TONES[0]).color;
}

/** The colour a card should use: the admin's explicit pick, else the default. */
export function resolveTone(cardColor: string | undefined, index: number): string {
  return cardColor && /^#[0-9a-fA-F]{6}$/.test(cardColor) ? cardColor : defaultToneFor(index);
}

export const isHexColor = (c: string): boolean => /^#[0-9a-fA-F]{6}$/.test(c);

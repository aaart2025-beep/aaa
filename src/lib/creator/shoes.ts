/* Swappable sneaker models for the creator. Each model exposes its parts as
 * colourable slots; the runner has clean named parts, famous shoes (Jordan)
 * use generic material names so we surface them as Part 1…N. Colours are stored
 * per material name on the design, so switching models keeps what fits. */

export type ShoeModelKey = "runner" | "jordan";

export interface ShoePart {
  mat: string;
  label: string;
}

export interface ShoeModel {
  key: ShoeModelKey;
  label: string;
  url: string;
  /** flat named-part hierarchy → explicit meshes + conforming decal */
  named: boolean;
  /** recenter + scale to a common size (for nested/large models) */
  normalize: boolean;
  parts: ShoePart[];
  defaults: Record<string, string>;
  /** material that carries the conforming decal (named models) */
  decalMat?: string;
  /** flat-plane decal placement for non-named models (normalised space) */
  decal: { depth: number; w: number };
  camera: { position: [number, number, number]; fov: number };
  shadowY: number;
}

export const SHOE_MODELS: ShoeModel[] = [
  {
    key: "runner",
    label: "AAA Runner",
    url: "/models/shoe.glb",
    named: true,
    normalize: false,
    parts: [
      { mat: "mesh", label: "Upper" },
      { mat: "caps", label: "Toe / heel" },
      { mat: "stripes", label: "Stripe" },
      { mat: "laces", label: "Laces" },
      { mat: "sole", label: "Sole" },
      { mat: "band", label: "Heel band" },
      { mat: "patch", label: "Side patch" },
      { mat: "inner", label: "Lining" },
    ],
    defaults: {
      mesh: "#f3f3ef",
      caps: "#e8731a",
      stripes: "#1f3a4a",
      laces: "#f3f3ef",
      sole: "#f5f5f5",
      band: "#e8731a",
      patch: "#1f3a4a",
      inner: "#2b2824",
    },
    decalMat: "mesh",
    decal: { depth: 0.34, w: 0.4 },
    camera: { position: [2.0, 0.95, 2.4], fov: 30 },
    shadowY: -0.55,
  },
  {
    key: "jordan",
    label: "High-Top",
    url: "/models/jordan.glb",
    named: false,
    normalize: true,
    parts: [
      { mat: "Material.001", label: "Part 1" },
      { mat: "Material.002", label: "Part 2" },
      { mat: "Material.007", label: "Part 3" },
      { mat: "Material.004", label: "Part 4" },
      { mat: "Material.003", label: "Part 5" },
      { mat: "Material.009", label: "Part 6" },
      { mat: "Material.008", label: "Part 7" },
      { mat: "Material.010", label: "Part 8" },
    ],
    defaults: {
      "Material.001": "#d5d5d7",
      "Material.002": "#e7e7e7",
      "Material.007": "#e74d50",
      "Material.004": "#444444",
      "Material.003": "#1b1b1b",
      "Material.009": "#0e0e0e",
      "Material.008": "#131313",
      "Material.010": "#000000",
    },
    decal: { depth: 0.28, w: 0.4 },
    camera: { position: [1.7, 0.55, 2.5], fov: 30 },
    shadowY: -0.5,
  },
];

export const shoeModelOf = (k: ShoeModelKey): ShoeModel => SHOE_MODELS.find((m) => m.key === k) ?? SHOE_MODELS[0];

export function shoeColorOf(model: ShoeModel, mat: string, colors: Record<string, string>): string | null {
  if (colors[mat]) return colors[mat];
  if (model.defaults[mat]) return model.defaults[mat];
  return null;
}

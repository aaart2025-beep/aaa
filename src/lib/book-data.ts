export type Pin = "clip" | "tape" | "tape-double"

export type Product = {
  id: string
  name: string
  image: string
  /** resting rotation in degrees for the pinned card */
  rot?: number
  /** how the photo is attached to the page */
  pin?: Pin
  // ---- spec sheet (math-grid page) ----
  garment: string
  fit: string
  sizes: string
  fabric: string
  print: string
  colors: string[]
  date: string
  description: string
}

export type Section = {
  id: string
  label: string
  blurb: string
  products: Product[]
}

const SIZES = "S, M, L, XL"
const FABRIC = "70% Cotton / 30% Polyester"
const PRINT = "Multicolor Screen Printing"
const SHOE_SIZES = "US 7 – US 12"

export const SECTIONS: Section[] = [
  {
    id: "for-her",
    label: "For Her",
    blurb: "Sculpted silhouettes & wearable art for her",
    products: [
      {
        id: "sculpt-bodysuit",
        name: "Sculpt Bodysuit",
        image: "/products/bodysuit-rust.png",
        rot: -2,
        pin: "clip",
        garment: "Bodysuit",
        fit: "Compression",
        sizes: SIZES,
        fabric: "Nylon / Elastane",
        print: "Embroidered",
        colors: ["#9a4a3c"],
        date: "2026",
        description:
          "A second-skin short unitard in clay rust with sculpting seams and an open keyhole back, marked with the embroidered AAA signature.",
      },
      {
        id: "daisy-sleeve-sweatshirt",
        name: "Daisy Sleeve Sweatshirt",
        image: "/products/sweat-daisy-front.png",
        rot: 2,
        pin: "tape",
        garment: "Sweatshirt",
        fit: "Oversized",
        sizes: SIZES,
        fabric: FABRIC,
        print: PRINT,
        colors: ["#f2d23c", "#f5f5f0", "#1a1a1a"],
        date: "2026",
        description:
          "A black oversized crewneck with the waveform at the chest and a printed daisy running the full length of each sleeve.",
      },
      {
        id: "aaa-pocket-tee",
        name: "Patch Pocket Tee",
        image: "/products/tee-pocket.png",
        rot: -1,
        pin: "clip",
        garment: "T-Shirt",
        fit: "Boxy",
        sizes: SIZES,
        fabric: "100% Heavy Cotton",
        print: "Embroidered",
        colors: ["#9a8156", "#46506b", "#3a64a8"],
        date: "2026",
        description:
          "An oversized khaki box-tee with a denim chest pocket carrying the embroidered AAA frame and tonal butterflies.",
      },
      {
        id: "corduroy-patch-cap",
        name: "Corduroy Distress Cap",
        image: "/products/cap-corduroy.png",
        rot: 2,
        pin: "tape",
        garment: "Headwear",
        fit: "Adjustable",
        sizes: "One Size",
        fabric: "Cotton Corduroy",
        print: "Frayed Denim Patch",
        colors: ["#d8c9a8", "#a9c3d6"],
        date: "2026",
        description:
          "A sand-corduroy cap with a frayed powder-blue denim AAA patch and raw contrast stitching, finished by hand.",
      },
    ],
  },
  {
    id: "for-him",
    label: "For Him",
    blurb: "Statement layers & custom footwear for him",
    products: [
      {
        id: "lakers-sweatshirt",
        name: "Lakers Tribute Sweatshirt",
        image: "/products/sweat-lakers-front.png",
        rot: -2,
        pin: "tape-double",
        garment: "Sweatshirt",
        fit: "Oversized",
        sizes: SIZES,
        fabric: FABRIC,
        print: PRINT,
        colors: ["#141414", "#f2c94c", "#8b5cf6", "#f5f5f0"],
        date: "2026",
        description:
          "A black oversized crewneck with a Lakers-tribute chest print and hand-laced gold and purple cross-stitching down the sleeves.",
      },
      {
        id: "zoro-hoodie",
        name: "Swordsman Hoodie",
        image: "/products/hoodie-zoro-front.png",
        rot: 2,
        pin: "clip",
        garment: "Hoodie",
        fit: "Oversized",
        sizes: SIZES,
        fabric: FABRIC,
        print: "Appliqué + Screen Print",
        colors: ["#f3f1ea", "#161616", "#2f9e44"],
        date: "2026",
        description:
          "An off-white hoodie with a raw-edged anime swordsman patch and black katakana panels down both sleeves.",
      },
      {
        id: "flame-dunk",
        name: "Flame Dunk Low",
        image: "/products/dunk-flame.png",
        rot: -1,
        pin: "tape",
        garment: "Footwear",
        fit: "True to size",
        sizes: SHOE_SIZES,
        fabric: "Leather",
        print: "Hand-Painted",
        colors: ["#e8731a", "#1f3a4a", "#f2c94c"],
        date: "2026",
        description:
          "A low-top Dunk hand-painted in blaze orange with airbrushed flames wrapping the swoosh. Sealed and flexed for wear.",
      },
      {
        id: "mona-lisa-jordan-mid",
        name: "Mona Lisa Jordan 1 Mid",
        image: "/products/jordan-mona-lisa.png",
        rot: 2,
        pin: "clip",
        garment: "Footwear",
        fit: "True to size",
        sizes: SHOE_SIZES,
        fabric: "Leather",
        print: "Hand-Painted",
        colors: ["#5a5236", "#3a2f24", "#cfc6b0"],
        date: "2026",
        description:
          "A mid-top Jordan 1 hand-painted with a Mona Lisa portrait across the panels, finished with a gold AAA mark.",
      },
      {
        id: "zebra-brim-cap",
        name: "Zebra Brim Cap",
        image: "/products/cap-zebra.png",
        rot: -2,
        pin: "tape",
        garment: "Headwear",
        fit: "Adjustable",
        sizes: "One Size",
        fabric: "Brushed Cotton Twill",
        print: "Hand-Painted Brim",
        colors: ["#1a1a1a", "#efe7d6"],
        date: "2026",
        description:
          "A washed-black six-panel cap with the AAA waveform stitched in natural thread and a hand-painted zebra brim.",
      },
    ],
  },
  {
    id: "winter",
    label: "Winter Collection",
    blurb: "Heavyweight fleece, knit & layered warmth",
    products: [
      {
        id: "floral-patch-hoodie",
        name: "Floral Mosaic Hoodie",
        image: "/products/hoodie-floral-patch.png",
        rot: 2,
        pin: "tape-double",
        garment: "Hoodie",
        fit: "Oversized",
        sizes: SIZES,
        fabric: FABRIC,
        print: "Hand-Stitched Patch",
        colors: ["#4a2c2a", "#7a2e2a", "#3a3a3a", "#b8a98c", "#efe7d6"],
        date: "2026",
        description:
          "A heavyweight oversized hoodie washed to faded oxblood, with a raw-edged floral mosaic patch sewn at the chest.",
      },
      {
        id: "frayed-pocket-sweatshirt",
        name: "Frayed Pocket Sweatshirt",
        image: "/products/sweat-frayed-front.png",
        rot: -2,
        pin: "clip",
        garment: "Sweatshirt",
        fit: "Oversized",
        sizes: SIZES,
        fabric: FABRIC,
        print: "Hand-Frayed Appliqué",
        colors: ["#efe7d6", "#e6d9bf", "#3a3a3a"],
        date: "2026",
        description:
          "A cream oversized crewneck with a hand-frayed shearling pocket torn open over a charcoal panel and charcoal elbow patches.",
      },
      {
        id: "roland-garros-tracksuit",
        name: "Clay Court Tracksuit",
        image: "/products/tracksuit-roland-garros.png",
        rot: 1,
        pin: "tape",
        garment: "Tracksuit",
        fit: "Oversized · 2-piece",
        sizes: SIZES,
        fabric: FABRIC,
        print: "Embroidery + Screen Print",
        colors: ["#5a241c", "#f2d23c"],
        date: "2026",
        description:
          "A heavyweight oxblood half-zip and jogger set with a clay-court print across the back. A complete two-piece.",
      },
    ],
  },
  {
    id: "summer",
    label: "Summer Collection",
    blurb: "Lightweight pieces for long, bright days",
    products: [
      {
        id: "cloud-dunk",
        name: "Cloud Dunk Low",
        image: "/products/dunk-cloud.png",
        rot: -1,
        pin: "clip",
        garment: "Footwear",
        fit: "True to size",
        sizes: SHOE_SIZES,
        fabric: "Leather",
        print: "Hand-Painted",
        colors: ["#a9d4e6", "#f2b9c4", "#f5f5f5", "#e6c66a"],
        date: "2026",
        description:
          "A pastel low-top Dunk hand-painted with a blue-sky-and-clouds upper, fuzzy rope laces and a gold-glitter swoosh.",
      },
      {
        id: "skate-flannel-hoodie",
        name: "Skate Flannel Hybrid",
        image: "/products/hoodie-skate-flannel.png",
        rot: 2,
        pin: "tape",
        garment: "Hoodie",
        fit: "Oversized",
        sizes: SIZES,
        fabric: FABRIC,
        print: PRINT,
        colors: ["#e9e1cf", "#1f4a3c", "#3a6b5e", "#9bb0a6"],
        date: "2026",
        description:
          "A cream oversized hoodie spliced at the hem into a green tartan flannel, with a plaid collar and skate-star pocket graphic.",
      },
      {
        id: "notebook-af1",
        name: "Notebook AF1",
        image: "/products/af1-notebook.png",
        rot: -2,
        pin: "tape",
        garment: "Footwear",
        fit: "True to size",
        sizes: SHOE_SIZES,
        fabric: "Leather",
        print: "Hand-Drawn",
        colors: ["#f5f5f5", "#2d6cdf", "#eb5757"],
        date: "2026",
        description:
          "A white Air Force 1 hand-drawn like lined notebook paper — blue rules, red-pen doodles and a scrawled AAA.",
      },
    ],
  },
  {
    id: "hoodies",
    label: "Hoodies",
    blurb: "The full hoodie archive, front to back",
    products: [
      {
        id: "bubble-hoodie",
        name: "Bubble Hoodie",
        image: "/products/hoodie-bubble.png",
        rot: -2,
        pin: "tape-double",
        garment: "Hoodie",
        fit: "Oversized",
        sizes: SIZES,
        fabric: FABRIC,
        print: PRINT,
        colors: ["#121212", "#c9d2db", "#f5f5f5"],
        date: "2026",
        description:
          "A jet-black oversized hoodie scattered with painterly iridescent soap bubbles front, back and sleeves.",
      },
      {
        id: "souls-are-rare-hoodie",
        name: "Souls Are Rare Hoodie",
        image: "/products/hoodie-souls-front.png",
        rot: 2,
        pin: "clip",
        garment: "Hoodie",
        fit: "Oversized",
        sizes: SIZES,
        fabric: FABRIC,
        print: "Hand Embroidery",
        colors: ["#2738c4", "#f2750a", "#e9c39a"],
        date: "2026",
        description:
          "A royal-blue hoodie hand-embroidered in orange thread, with the mantra arched across the back.",
      },
      {
        id: "gym-not-emotionally-hoodie",
        name: "“At The Gym” Hoodie",
        image: "/products/hoodie-gym-front.png",
        rot: -1,
        pin: "tape",
        garment: "Hoodie",
        fit: "Oversized",
        sizes: SIZES,
        fabric: FABRIC,
        print: "Acid Wash + Glow Print",
        colors: ["#5a5640", "#6b675a", "#d9d2bf"],
        date: "2026",
        description:
          "An acid-washed olive hoodie with a soft glow-print waveform and a confessional message across the back.",
      },
      {
        id: "just-start-sweatshirt",
        name: "“Just Start” Sweatshirt",
        image: "/products/sweat-juststart-front.png",
        rot: 2,
        pin: "clip",
        garment: "Sweatshirt",
        fit: "Oversized",
        sizes: SIZES,
        fabric: FABRIC,
        print: PRINT,
        colors: ["#9a948a", "#8a8170", "#ece6da", "#2a2724"],
        date: "2026",
        description:
          "A washed espresso crewneck with a painted waveform and a cut-and-paste ransom-note message on the back.",
      },
      {
        id: "luffy-straw-hat-hoodie",
        name: "Straw-Hat Crew Hoodie",
        image: "/products/hoodie-luffy.png",
        rot: -2,
        pin: "tape",
        garment: "Hoodie",
        fit: "Oversized",
        sizes: SIZES,
        fabric: FABRIC,
        print: "Embroidery + Screen Print",
        colors: ["#f2c029", "#161616", "#c0392b"],
        date: "2026",
        description:
          "A sunflower-yellow hoodie with an embroidered straw-hat skull crest and bold black katakana sleeve panels.",
      },
      {
        id: "bloom-sticker-hoodie",
        name: "Bloom Sticker Hoodie",
        image: "/products/hoodie-bloom-sticker-front.png",
        rot: 1,
        pin: "clip",
        garment: "Hoodie",
        fit: "Oversized",
        sizes: SIZES,
        fabric: FABRIC,
        print: PRINT,
        colors: ["#141414", "#f2c94c", "#eb5757", "#2d9cdb", "#e7a9c4"],
        date: "2026",
        description:
          "A black oversized hoodie with a painted blue smiley-bloom and one full sleeve collaged in sticker-style graphics.",
      },
    ],
  },
  {
    id: "footwear",
    label: "Footwear",
    blurb: "Custom-painted, one-pair-at-a-time",
    products: [
      {
        id: "marble-flame-af1",
        name: "Marbled Flame AF1",
        image: "/products/af1-marble-flame.png",
        rot: -2,
        pin: "clip",
        garment: "Footwear",
        fit: "True to size",
        sizes: SHOE_SIZES,
        fabric: "Leather",
        print: "Hand-Finished",
        colors: ["#d6bd8a", "#c0392b", "#b08d5a"],
        date: "2026",
        description:
          "An Air Force 1 in a tonal sand marble-camo with a red swoosh and red rope laces.",
      },
      {
        id: "jade-croc-jordan-mid",
        name: "Jade Croc Jordan 1 Mid",
        image: "/products/jordan-croc-green.png",
        rot: 2,
        pin: "tape",
        garment: "Footwear",
        fit: "True to size",
        sizes: SHOE_SIZES,
        fabric: "Leather",
        print: "Embossed Texture",
        colors: ["#f3f3ef", "#6fae3a"],
        date: "2026",
        description:
          "A mid-top Jordan 1 wrapped in embossed jade-green crocodile texture with a hand-drawn leaf-wing logo.",
      },
      {
        id: "neon-leaf-jordan-high",
        name: "Neon Leaf Jordan 1 High",
        image: "/products/jordan-neon-green.png",
        rot: -1,
        pin: "tape",
        garment: "Footwear",
        fit: "True to size",
        sizes: SHOE_SIZES,
        fabric: "Leather",
        print: "Hand-Finished",
        colors: ["#f3f3ef", "#8fd400"],
        date: "2026",
        description:
          "A high-top Jordan 1 with volt and lime panels, fuzzy neon laces and a hand-drawn leaf-wing logo.",
      },
    ],
  },
  {
    id: "home",
    label: "For Your House",
    blurb: "Hand-finished objects & headwear for the home",
    products: [
      {
        id: "shearling-aaa-letters",
        name: "Shearling AAA Letters",
        image: "/products/art-shearling-letters.png",
        rot: 2,
        pin: "clip",
        garment: "Art Object",
        fit: "Set of 3",
        sizes: "One of one",
        fabric: "Shearling / Sculpted Core",
        print: "Hand-Finished",
        colors: ["#e7ddcb", "#3a64a8"],
        date: "2026",
        description:
          "A set of three freestanding AAA letters built up in cream shearling — a soft, tactile logo object for the home.",
      },
      {
        id: "peacock-burlap-cap",
        name: "Peacock Burlap Cap",
        image: "/products/cap-peacock-burlap.png",
        rot: -2,
        pin: "tape",
        garment: "Headwear",
        fit: "Adjustable",
        sizes: "One Size",
        fabric: "Cotton + Raw Burlap",
        print: "Hand Embroidery",
        colors: ["#4a3a2a", "#c8b78f", "#1f6f8a"],
        date: "2026",
        description:
          "An espresso cap with a frayed raw-burlap brim, a burlap AAA patch and a real peacock feather at the side.",
      },
      {
        id: "washed-line-cap",
        name: "Washed Line-Art Cap",
        image: "/products/cap-washed-line.png",
        rot: 1,
        pin: "clip",
        garment: "Headwear",
        fit: "Adjustable",
        sizes: "One Size",
        fabric: "Garment-Washed Cotton",
        print: "Embroidery + Hand-Painted Line",
        colors: ["#6f6a63", "#d9d2c2"],
        date: "2026",
        description:
          "A stone-washed grey dad cap with the embroidered waveform and a single painted line across the crown and brim.",
      },
    ],
  },
]

export const ALL_PRODUCTS: Product[] = SECTIONS.flatMap((s) => s.products)

export function findProduct(id: string): Product | undefined {
  return ALL_PRODUCTS.find((p) => p.id === id)
}

export function findSection(id: string): Section | undefined {
  return SECTIONS.find((s) => s.id === id)
}

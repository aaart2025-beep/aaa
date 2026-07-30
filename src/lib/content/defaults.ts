import { products } from "@/lib/products";
import type { SiteContent, ContentCollection } from "./types";

/** Every editable string on the site, keyed. The admin console edits these. */
export const DEFAULT_TEXTS: Record<string, string> = {
  "brand.wordmark": "AAA",

  // Navigation (labels)
  "nav.home": "Home",
  "nav.shop": "Shop",
  "nav.create": "Create",
  "nav.collections": "Collections",
  "nav.about": "About",
  "nav.contact": "Contact",

  // Home hero (revealed at the end of the scroll video)
  "hero.headlineA": "Wearable art",
  "hero.headlineB": "made by hand",
  "hero.subtitle": "Original clothing, custom footwear & one-off art objects.",
  "hero.cta": "Our Collection",
  "hero.ctaHover": "Take me to the shop",
  "hero.shopCta": "Enter the shop",
  "hero.introCta": "Tap to begin",

  // Our Collection page
  "collection.eyebrow": "AAA — The Collection",
  "collection.title": "Our Collection",
  "collection.intro":
    "Hand-made pieces, grouped by who and what they're for. Tap any item to open it.",

  // Shop page (the catalog of every piece)
  "shop.eyebrow": "AAA — The Shop",
  "shop.title": "Our Shop",
  "shop.intro":
    "AAA is a luxury fashion and art brand creating unique custom-designed pieces that speak individuality, creativity and timeless style.",
  "shop.customTitle": "Create Your Own Design",
  "shop.customBody":
    "Have an idea, a sketch, a photo? Upload your image and our studio will hand-craft it into a one-of-a-kind wearable piece. Every AAA custom order is made-to-order, just for you.",
  "shop.customCta": "Upload your image",

  // Create page (the design-it-yourself studio)
  "create.eyebrow": "The drafting table",
  "create.title": "Design it yourself.",
  "create.intro":
    "Your page in the workbook: pick a base, click any part of the drawing and paint it, drag the AAA mark wherever it belongs, choose fabric, size and cuts. The studio hand-makes exactly what you draft.",
  "create.note": "every draft is buildable!",

  // Product page
  "product.back": "Back to the shop",
  "product.notes": "Construction notes",
  "product.buy": "Buy now",

  // About page
  "about.eyebrow": "The artist",
  "about.title": "One pair of hands,",
  "about.title2": "one piece at a time.",
  "about.opening": "Hi — I'm Amit.",
  "about.body1":
    "AAA started exactly the way this website looks: as a workbook. A place where sketches, fabric swatches and half-ideas pile up until one of them refuses to stay on the page.",
  "about.body2":
    "Everything in the shop is made by hand in my studio — painted sneakers sealed and flexed for real wear, hoodies rebuilt with patches and embroidery, one-off objects that are equal parts furniture and inside joke.",
  "about.body3":
    "Nothing is mass-produced. When a piece sells, it's gone — the page turns, and the book moves on. If you want something handmade, made in small numbers, you're in the right place.",
  "about.quote": "Souls are rare. Pretty faces are everywhere.",
  "about.cta": "See the pieces",
  "about.ctaCreate": "Design your own",
  "about.processTitle": "How a piece happens",
  "about.process1": "It starts as a sketch in this book — a line, a joke, a feeling.",
  "about.process2": "Then the hunt: the right blank, the right fabric, the right thread.",
  "about.process3": "Paint, stitch, fray, seal — every mark made by hand, no two alike.",
  "about.process4": "Photographed, numbered and filed here. Then it's yours.",
  "about.photoAlt": "The AAA studio table",
  "about.photoNote": "where it all happens",

  // Contact page
  "contact.eyebrow": "Correspondence",
  "contact.title": "Write to the studio",
  "contact.body":
    "Commissions, custom pieces, sizing questions, or just to say the Mona Lisa Jordans are a lot — every message lands on this desk and gets a reply from the artist.",
  "contact.email": "aaart2025@gmail.com",
  "contact.cardLabel": "Preferred channel",
  "contact.note": "often replies within a day or two — usually with sketches",
  "contact.socialLabel": "Or find the studio here",

  // Footer
  "footer.follow": "Follow the studio",
  "footer.tagline": "Wear your art",
  "footer.newsletter": "Join the AAA community",
  "footer.credit": "Made by Amit Amar",
  "footer.backToCover": "Back to cover",

  // Login screen
  "login.heading": "Welcome back",
  "login.subtitle": "Sign in to continue to the collection.",
};

export const DEFAULT_COLLECTIONS: ContentCollection[] = [
  {
    id: "for-her",
    title: "For Her",
    subtitle: "Sculpted silhouettes & wearable art",
    images: [
      "/products/bodysuit-rust.png",
      "/products/sweat-daisy-front.png",
      "/products/tee-pocket.png",
      "/products/dunk-cloud.png",
      "/products/cap-corduroy.png",
      "/products/sweat-frayed-front.png",
      "/products/hoodie-souls-front.png",
      "/products/top-kilim.png",
      "/products/halter-ecru-front.png",
    ],
  },
  {
    id: "for-him",
    title: "For Him",
    subtitle: "Statement layers & custom footwear",
    images: [
      "/products/sweat-lakers-front.png",
      "/products/hoodie-zoro-front.png",
      "/products/hoodie-luffy.png",
      "/products/dunk-flame.png",
      "/products/af1-marble-flame.png",
      "/products/jordan-mona-lisa.png",
      "/products/sweat-juststart-front.png",
      "/products/cap-zebra.png",
      "/products/tracksuit-roland-garros.png",
    ],
    reverse: true,
  },
  {
    id: "hats",
    title: "Hats",
    subtitle: "Caps & headwear, hand-finished",
    images: [
      "/products/cap-baroque.png",
      "/products/cap-creation.png",
      "/products/cap-corduroy.png",
      "/products/cap-zebra.png",
      "/products/cap-peacock-burlap.png",
      "/products/cap-washed-line.png",
    ],
  },
  {
    id: "shoes",
    title: "Shoes",
    subtitle: "Hand-finished one-of-one sneakers",
    images: [
      "/products/af1-yankees.png",
      "/products/jordan-jade.png",
      "/products/dunk-flame.png",
      "/products/dunk-cloud.png",
      "/products/af1-marble-flame.png",
      "/products/af1-notebook.png",
      "/products/jordan-croc-green.png",
      "/products/jordan-neon-green.png",
      "/products/jordan-mona-lisa.png",
    ],
    reverse: true,
  },
  {
    id: "summer",
    title: "Summer Collection",
    subtitle: "Lightweight pieces for bright days",
    images: [
      "/products/dunk-cloud.png",
      "/products/hoodie-skate-flannel.png",
      "/products/tee-pocket.png",
      "/products/bodysuit-rust.png",
      "/products/af1-notebook.png",
      "/products/jordan-neon-green.png",
      "/products/cap-corduroy.png",
      "/products/hoodie-souls-front.png",
    ],
  },
  {
    id: "winter",
    title: "Winter Collection",
    subtitle: "Heavyweight fleece & layered warmth",
    images: [
      "/products/hoodie-floral-patch.png",
      "/products/sweat-frayed-front.png",
      "/products/hoodie-bubble.png",
      "/products/sweat-lakers-front.png",
      "/products/hoodie-gym-front.png",
      "/products/cap-peacock-burlap.png",
      "/products/tracksuit-yellow-stitch.png",
      "/products/hoodie-rainbow-child.png",
    ],
    reverse: true,
  },
  {
    id: "for-home",
    title: "For Your Home",
    subtitle: "One-off art objects & textiles",
    images: [
      "/products/art-shearling-letters.png",
      "/products/chair-plushie.png",
      "/products/skirt-kilim.png",
      "/products/cap-peacock-burlap.png",
      "/products/sherpa-back.png",
    ],
  },
];

/** Starter size guide — the studio replaces the numbers with real ones in the
 * admin console (Site → Size Guide). Kept generic so the page is never empty. */
const DEFAULT_SIZE_GUIDE: SiteContent["sizeGuide"] = {
  intro:
    "Measurements are approximate — every piece is made by hand. Measure a garment you already own and compare. Questions? Message us and we'll help you pick.",
  rows: [
    { size: "XS", measure: "Chest — · Length — · Sleeve —" },
    { size: "S", measure: "Chest — · Length — · Sleeve —" },
    { size: "M", measure: "Chest — · Length — · Sleeve —" },
    { size: "L", measure: "Chest — · Length — · Sleeve —" },
    { size: "XL", measure: "Chest — · Length — · Sleeve —" },
  ],
};

export function defaultContent(): SiteContent {
  // Deep copy so callers can never mutate the seed.
  return structuredClone({
    texts: DEFAULT_TEXTS,
    products,
    collections: DEFAULT_COLLECTIONS,
    navVisible: {},
    sizeGuide: DEFAULT_SIZE_GUIDE,
  });
}

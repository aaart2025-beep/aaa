import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TransitionLink } from "@/components/transition/page-transition";
import { resolveViews, sizesLabel, specOf, defaultSizes, priceInfo } from "@/lib/products";
import { readContent } from "@/lib/content/store";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";
import { localizeProduct } from "@/lib/i18n/products-he";
import { PaperShell } from "@/components/paper/paper-shell";
import { PaperHeader } from "@/components/paper/paper-header";
import { PaintPrice } from "@/components/paper/paint-price";
import { SpecImage } from "@/components/paper/spec-image";
import { BuyPanel } from "@/components/cart/buy-panel";
import { AaaLogo } from "@/components/book/aaa-logo";
import { PolicyDialog } from "@/components/policy/policy-dialog";
import { SketchDoodle } from "@/components/paper/sketch-doodle";
import { CarePolicyContent } from "@/lib/policies";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aaa-teal-theta.vercel.app";
const absUrl = (u?: string) => (u && /^https?:/i.test(u) ? u : `${SITE_URL}${u ?? ""}`);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { products } = await readContent();
  const raw = products.find((p) => p.slug === slug);
  if (!raw) return { title: "Not found — AAA" };
  const lang = await getLang();
  const product = localizeProduct(raw, lang);
  const title = `${product.name} — AAA`;
  const image = product.images?.[0];
  return {
    title,
    description: product.tagline,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title,
      description: product.tagline,
      type: "website",
      url: `/shop/${product.slug}`,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description: product.tagline, images: image ? [image] : undefined },
  };
}

/* Spec-field value → shop dictionary key. specOf() runs on the English product
 * (its regexes only match English), then each value is translated for Hebrew. */
const GARMENT_KEY: Record<string, string> = {
  Cap: "shop.garmentCap",
  Sneaker: "shop.garmentSneaker",
  "Art Object": "shop.garmentArtObject",
  Hoodie: "shop.garmentHoodie",
  Sweatshirt: "shop.garmentSweatshirt",
  Tracksuit: "shop.garmentTracksuit",
  Bodysuit: "shop.garmentBodysuit",
  "T-Shirt": "shop.garmentTee",
  Halter: "shop.garmentHalter",
  Cami: "shop.garmentCami",
  Skirt: "shop.garmentSkirt",
  Pullover: "shop.garmentPullover",
  Garment: "shop.garmentGarment",
};
const FIT_KEY: Record<string, string> = {
  Oversized: "shop.fitOversized",
  "Cropped boxy": "shop.fitCroppedBoxy",
  Compression: "shop.fitCompression",
  "True to size": "shop.fitTrueToSize",
  Adjustable: "shop.fitAdjustable",
  "One of one": "shop.fitOneOfOne",
};
const SHORT_DETAIL_KEY: Record<string, string> = {
  Print: "shop.sdPrint",
  Embroidery: "shop.sdEmbroidery",
  "Hand-paint": "shop.sdHandPaint",
  Appliqué: "shop.sdApplique",
  Stitch: "shop.sdStitch",
  Washed: "shop.sdWashed",
};

/** Short "fabric detail" tag from the print/finish method. */
function shortDetail(print: string): string {
  if (/print/i.test(print)) return "Print";
  if (/embroid/i.test(print)) return "Embroidery";
  if (/paint/i.test(print)) return "Hand-paint";
  if (/appliqu/i.test(print)) return "Appliqué";
  if (/stitch/i.test(print)) return "Stitch";
  if (/wash/i.test(print)) return "Washed";
  return print.split(" ")[0];
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p className="font-archivo text-[clamp(12px,1.4vw,15px)] leading-tight text-ink">
      <span className="font-bold">{label}:</span> <span className="text-ink/85">{value}</span>
    </p>
  );
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await readContent();
  const raw = content.products.find((p) => p.slug === slug);
  if (!raw) notFound();

  const lang = await getLang();
  const t = (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars);
  const text = (key: string, fallback: string) => content.texts[key] ?? fallback;
  // Localised copy (tagline / details / colours); NAME always stays English.
  const product = localizeProduct(raw, lang);

  // specOf() matches English words, so derive the spec from the English source
  // and translate each value. Fabric/Print resolve to detail strings, which we
  // map back to their aligned Hebrew detail by index.
  const spec = specOf(raw);
  const detailHe = new Map<string, string>();
  raw.details.forEach((d, i) => {
    const he = product.details[i];
    if (he) detailHe.set(d, he);
  });
  const trDetail = (s: string) => (lang === "he" ? detailHe.get(s) ?? s : s);
  const trGarment = (g: string) => (lang === "he" && GARMENT_KEY[g] ? t(GARMENT_KEY[g]) : g);
  const trFit = (f: string) => (lang === "he" && FIT_KEY[f] ? t(FIT_KEY[f]) : f);
  const trShort = (s: string) => (lang === "he" && SHORT_DETAIL_KEY[s] ? t(SHORT_DETAIL_KEY[s]) : s);
  const trSizes = (): string => {
    if (lang !== "he") return sizesLabel(raw);
    const sizes = raw.sizes?.length ? raw.sizes : defaultSizes(raw.category);
    if (sizes.length > 2 && sizes.every((s) => /^US \d+$/.test(s))) {
      return `${sizes[0]} – ${sizes[sizes.length - 1]}`;
    }
    return sizes
      .map((s) => (s === "One size" ? t("shop.sizeOneSize") : s === "One of one" ? t("shop.sizeOneOfOne") : s))
      .join(", ");
  };

  const { price: salePrice, original: listPrice, percent: discountPct } = priceInfo(product);
  const views = resolveViews(product);
  const swatches = (product.colors ?? []).filter((c) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c)).slice(0, 5);
  // Buyable sizes: drop single "One size" / "One of one" placeholders so we only
  // show a picker when there's a real choice to make.
  const buyableSizes = (product.sizes?.length ? product.sizes : defaultSizes(product.category)).filter(
    (s) => !/^one\b/i.test(s),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: (product.images ?? []).map(absUrl),
    description: product.tagline,
    brand: { "@type": "Brand", name: "AAA — Amit Amar Art" },
    offers: {
      "@type": "Offer",
      priceCurrency: "ILS",
      price: salePrice,
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/shop/${product.slug}`,
    },
  };

  return (
    <PaperShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
     <div className="flex min-h-[100svh] flex-col">
      <PaperHeader />

      {/* the spec sheet — no frame, it lives on the book page. Centred single
          column: specs, then the piece large in the middle, then price. */}
      <div className="mx-auto flex min-h-0 w-full max-w-[640px] flex-1 flex-col px-4 pb-5 pt-2 sm:px-6">
        <TransitionLink
          href="/shop"
          className="font-typewriter mb-1 inline-flex shrink-0 items-center gap-1.5 self-start text-[10px] uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-ink"
        >
          <span aria-hidden>←</span> {lang === "he" ? t("shop.backToShop") : text("product.back", "Back to the shop")}
        </TransitionLink>

        <article className="flex min-h-0 flex-1 flex-col">
          {/* title — masthead already carries the logo, so no second mark here */}
          <div className="shrink-0 py-2.5 text-center">
            <h1 className="font-archivo text-[clamp(1.5rem,4.4vw,2.8rem)] font-extrabold uppercase leading-[0.98] tracking-tight text-ink">
              {product.name}
            </h1>
          </div>

          {/* spec grid */}
          <div className="shrink-0 border-t border-ink/60">
            <div className="flex items-center justify-between gap-3 py-2">
              <Field label={t("shop.fieldGarment")} value={trGarment(spec.garment)} />
              {swatches.length > 0 && (
                <span className="flex shrink-0 items-center gap-1.5" aria-hidden>
                  {swatches.map((c) => (
                    <span key={c} className="h-3.5 w-3.5 rounded-full border border-ink/40" style={{ backgroundColor: c }} />
                  ))}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 border-t border-dashed border-ink/30">
              <div className="border-r border-dashed border-ink/30 py-2 pr-4">
                <Field label={t("shop.fieldFit")} value={trFit(spec.fit)} />
              </div>
              <div className="py-2 pl-4">
                <Field label={t("shop.fieldFabricDetail")} value={trShort(shortDetail(spec.print))} />
              </div>
              <div className="border-r border-t border-dashed border-ink/30 py-2 pr-4">
                <Field label={t("shop.fieldSize")} value={trSizes()} />
              </div>
              <div className="border-t border-dashed border-ink/30 py-2 pl-4">
                <Field label={t("shop.fieldDate")} value={spec.date} />
              </div>
            </div>
          </div>

          {/* the piece — centred and large in the middle, floating on the paper.
              Grows to fill on tall screens, never crushed below the floor. */}
          <div className="relative flex min-h-[clamp(320px,46vh,540px)] flex-1 flex-col border-t border-ink/60 py-4">
            <SpecImage name={product.name} views={views} />
            {/* a working drawing inked into the sheet's margin */}
            <SketchDoodle
              complexity="simple"
              className="pointer-events-none absolute bottom-6 left-1 w-16 opacity-80 sm:w-20"
              strokeClassName="text-ink/70"
            />
          </div>

          {/* fabric + print */}
          <div className="shrink-0 border-t border-ink/60">
            <div className="py-2">
              <Field label={t("shop.fieldFabric")} value={trDetail(spec.fabric)} />
            </div>
            <div className="border-t border-dashed border-ink/30 py-2">
              <Field label={t("shop.fieldPrint")} value={trDetail(spec.print)} />
            </div>
          </div>

          {/* price + size + buy */}
          <div className="shrink-0 border-t border-ink/60 py-3">
            {discountPct ? (
              <p className="font-typewriter mb-2 text-[11px] uppercase tracking-[0.16em] text-ink/70">
                <span className="bg-red-600 px-1.5 py-0.5 font-bold text-white">{t("shop.offBadge", { pct: discountPct })}</span>
              </p>
            ) : null}
            <BuyPanel
              slug={product.slug}
              name={product.name}
              price={salePrice}
              image={product.images[0]}
              sizes={buyableSizes}
              priceSlot={
                <PaintPrice
                  price={salePrice}
                  original={listPrice}
                  prefix="≈"
                  textClassName="text-[26px]"
                  strikeClassName="text-[17px]"
                  className="px-5 py-1.5"
                />
              }
              careSlot={
                <PolicyDialog
                  title={t("checkout.careTitle")}
                  triggerLabel={t("shop.careWashing")}
                  triggerClassName="font-archivo border border-ink/55 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink/80 transition-colors hover:bg-ink hover:text-paper"
                >
                  <CarePolicyContent />
                </PolicyDialog>
              }
            />
          </div>

          {/* credit */}
          <div className="mt-3 flex shrink-0 items-center justify-between gap-3 border-t border-ink/60 pt-2.5">
            <span className="font-archivo text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/70">
              {t("shop.designedBy")}
            </span>
            <AaaLogo className="h-5 w-auto opacity-80" />
          </div>
        </article>
      </div>
     </div>
    </PaperShell>
  );
}

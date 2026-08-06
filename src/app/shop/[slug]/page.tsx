import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TransitionLink } from "@/components/transition/page-transition";
import { specOf, priceInfo } from "@/lib/products";
import { sizeOptionsFor, sizeGuideFor, categoryUsesDimensions } from "@/lib/sizing";
import { readContent } from "@/lib/content/store";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";
import { localizeProduct } from "@/lib/i18n/products-he";
import { PaperShell } from "@/components/paper/paper-shell";
import { PaperHeader } from "@/components/paper/paper-header";
import { PaintPrice } from "@/components/paper/paint-price";
import { SpecCard } from "@/components/paper/spec-card";
import { BuyPanel } from "@/components/cart/buy-panel";
import { ColorVariantProvider, ColorGallery } from "@/components/shop/color-variant";
import { AaaLogo } from "@/components/book/aaa-logo";
import { WHATSAPP_URL } from "@/components/paper/paper-footer";
import { PolicyDialog } from "@/components/policy/policy-dialog";
import { SizeGuideTable } from "@/components/shop/size-guide-table";
import { FitHeading } from "@/components/paper/fit-heading";
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
/** Up to n other pieces to suggest under a product — same category first, then
 * the rest of the catalog. Hidden pieces and the current one are skipped. */
function pickRelated<T extends { slug: string; category: string; hidden?: boolean }>(all: T[], current: T, n: number): T[] {
  const pool = all.filter((p) => !p.hidden && p.slug !== current.slug);
  const same = pool.filter((p) => p.category === current.category);
  const rest = pool.filter((p) => p.category !== current.category);
  return [...same, ...rest].slice(0, n);
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
  // "You might also like" — other pieces, same category first.
  const relatedLoc = pickRelated(content.products, raw, 4).map((p) => localizeProduct(p, lang));

  // specOf() matches English words, so derive the spec from the English source
  // and translate each value. Fabric/Print resolve to detail strings, which we
  // map back to their aligned Hebrew detail by index.
  const spec = specOf(raw);
  const trGarment = (g: string) => (lang === "he" && GARMENT_KEY[g] ? t(GARMENT_KEY[g]) : g);
  const trFit = (f: string) => (lang === "he" && FIT_KEY[f] ? t(FIT_KEY[f]) : f);

  const { price: salePrice, original: listPrice, percent: discountPct } = priceInfo(product);
  const swatches = (product.colors ?? []).filter((c) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c)).slice(0, 5);

  // Sizes come from the category cascade (product → admin category config →
  // built-in default). Art / home pieces are measured by dimensions instead.
  const usesDimensions = categoryUsesDimensions(content, raw.category);
  const sizeOptions = sizeOptionsFor(content, raw);
  // Buyable sizes: drop single "One size" / "One of one" placeholders (and all
  // sizes for dimension pieces) so a picker only shows for a real choice.
  const buyableSizes = usesDimensions ? [] : sizeOptions.filter((s) => !/^one\b/i.test(s));

  // Size table: this piece's own measurements → its category's table → the
  // site-wide fallback. Hidden for dimension pieces. Studio free text, not localised.
  const rowHas = (g?: { rows?: { size?: string; measure?: string }[] }) =>
    (g?.rows ?? []).some((r) => (r.size ?? "").trim() || (r.measure ?? "").trim());
  const sizeGuide = sizeGuideFor(content, raw);
  const hasSizeGuide = !usesDimensions && rowHas(sizeGuide);

  // Available sizes shown below the piece (sold-out ones dropped), localised.
  const sizeToken = (s: string) =>
    s === "One size" ? t("shop.sizeOneSize") : s === "One of one" ? t("shop.sizeOneOfOne") : s;
  const availableSizes = sizeOptions.filter((s) => !(raw.soldOutSizes ?? []).includes(s));
  const availableSizesLabel =
    availableSizes.length > 2 && availableSizes.every((s) => /^(US|EU) \d+$/.test(s))
      ? `${availableSizes[0]} – ${availableSizes[availableSizes.length - 1]}`
      : availableSizes.length
        ? availableSizes.map(sizeToken).join(", ")
        : t("shop.soldOut");

  // Dimensions line for art / home pieces (only the fields that are filled in).
  const dims = raw.dimensions;
  const dimensionsLabel = [
    dims?.height && `${t("shop.dimHeight")}: ${dims.height}`,
    dims?.width && `${t("shop.dimWidth")}: ${dims.width}`,
    dims?.depth && `${t("shop.dimDepth")}: ${dims.depth}`,
  ]
    .filter(Boolean)
    .join(" · ");

  // The description button appears only when the piece has description copy.
  const hasDescription = (product.description ?? "").trim().length > 0;

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
      availability: product.soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
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

        <ColorVariantProvider colors={raw.colors ?? []}>
        <article className="flex min-h-0 flex-1 flex-col">
          {/* title — masthead already carries the logo, so no second mark here.
              FitHeading shrinks the font so any name length stays on one line. */}
          <div className="shrink-0 overflow-hidden py-2.5 text-center">
            <FitHeading
              text={product.name}
              className="font-archivo text-[clamp(1.5rem,4.4vw,2.8rem)] font-extrabold uppercase leading-[0.98] tracking-tight text-ink"
            />
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
            <div className="border-t border-dashed border-ink/30 py-2">
              <Field label={t("shop.fieldFit")} value={trFit(spec.fit)} />
            </div>
          </div>

          {/* the piece — centred and large in the middle, floating on the paper.
              Grows to fill on tall screens, never crushed below the floor. */}
          <div className="relative flex min-h-[clamp(360px,50vh,480px)] flex-1 flex-col border-t border-ink/60 py-3 sm:min-h-[clamp(420px,62vh,760px)]">
            <ColorGallery product={product} colorImages={raw.colorImages} />
            {/* sold-out is shown as a stamp beside the price below — never over
                the piece on the product page, so the garment stays fully visible */}
            {/* a working drawing inked into the sheet's margin */}
            <SketchDoodle
              complexity="simple"
              className="pointer-events-none absolute bottom-6 left-1 w-16 opacity-80 sm:w-20"
              strokeClassName="text-ink/70"
            />
          </div>

          {/* available sizes — or dimensions for art pieces (left) + sold-out stamp (right) */}
          <div className="shrink-0 border-t border-ink/60">
            <div className="flex items-center justify-between gap-3 py-2">
              {usesDimensions ? (
                dimensionsLabel ? (
                  <Field label={t("shop.dimensions")} value={dimensionsLabel} />
                ) : (
                  <span />
                )
              ) : (
                <Field label={t("shop.fieldSizes")} value={availableSizesLabel} />
              )}
              {product.soldOut && (
                <span className="inline-block shrink-0 -rotate-[4deg] rounded border-2 border-red-600/80 bg-paper px-3 py-1 font-archivo text-[13px] font-extrabold uppercase tracking-[0.16em] text-red-600 shadow-[2px_2px_0_rgba(40,34,24,0.2)]">
                  {t("shop.soldOut")}
                </span>
              )}
            </div>
          </div>

          {/* price + size + buy */}
          <div className="shrink-0 border-t border-ink/60 py-3">
            {discountPct && !product.soldOut ? (
              <p className="font-typewriter mb-2 text-[11px] uppercase tracking-[0.16em] text-ink/70">
                <span className="bg-red-600 px-1.5 py-0.5 font-bold text-white">{t("shop.offBadge", { pct: discountPct })}</span>
              </p>
            ) : null}
            {product.onePiece && !product.soldOut ? (
              <p className="mb-2">
                <span className="one-piece-badge font-archivo text-[12px] uppercase tracking-[0.14em]">
                  {t("shop.onePiece")}
                </span>
              </p>
            ) : null}
            <BuyPanel
              slug={product.slug}
              name={product.name}
              price={salePrice}
              image={product.images[0]}
              sizes={buyableSizes}
              unavailableSizes={product.soldOutSizes}
              colors={raw.colors ?? []}
              colorImages={raw.colorImages}
              soldOut={product.soldOut}
              priceSlot={
                <PaintPrice
                  price={salePrice}
                  original={listPrice}
                  textClassName="text-[26px]"
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
              guideSlot={
                hasSizeGuide ? (
                  <PolicyDialog
                    title={t("shop.sizeGuideTitle")}
                    triggerLabel={
                      <>
                        {t("shop.sizeGuide")} <span aria-hidden>↗</span>
                      </>
                    }
                    triggerClassName="font-typewriter inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-ink/60 underline decoration-ink/30 underline-offset-2 transition-colors hover:text-ink"
                  >
                    <SizeGuideTable
                      guide={sizeGuide}
                      sizeCol={t("shop.sizeCol")}
                      measureCol={t("shop.measureCol")}
                      emptyText={t("shop.sizeGuideEmpty")}
                    />
                  </PolicyDialog>
                ) : undefined
              }
              descSlot={
                hasDescription ? (
                  <PolicyDialog
                    title={t("shop.description")}
                    triggerLabel={
                      <>
                        {t("shop.description")} <span aria-hidden>↗</span>
                      </>
                    }
                    triggerClassName="font-typewriter inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-ink/60 underline decoration-ink/30 underline-offset-2 transition-colors hover:text-ink"
                  >
                    <p className="font-typewriter text-[12.5px] leading-[1.8] tracking-[0.02em] text-ink/80">
                      {product.description}
                    </p>
                  </PolicyDialog>
                ) : undefined
              }
              orderSlot={
                product.soldOut ? (
                  <PolicyDialog
                    title={t("shop.orderNowTitle")}
                    triggerLabel={t("shop.orderNow")}
                    triggerClassName="chip-lime font-archivo px-5 py-3 text-[12px] font-bold uppercase tracking-[0.16em]"
                  >
                    <div className="flex flex-col gap-3">
                      <p className="font-typewriter text-[12.5px] leading-[1.8] tracking-[0.02em] text-ink/80">
                        {t("shop.orderNowBody")}
                      </p>
                      <a
                        href={WHATSAPP_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="chip-lime font-archivo inline-flex w-fit items-center gap-2 px-5 py-3 text-[12px] font-bold uppercase tracking-[0.16em]"
                      >
                        {t("shop.orderNowCta")}
                      </a>
                    </div>
                  </PolicyDialog>
                ) : undefined
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
        </ColorVariantProvider>
      </div>

      {relatedLoc.length > 0 && (
        <section className="mx-auto w-full max-w-[680px] px-4 pb-14 sm:px-6">
          <h2 className="font-archivo mb-5 border-t border-ink/40 pt-5 text-[13px] font-bold uppercase tracking-[0.18em] text-ink/80">
            {t("shop.related")}
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4 sm:gap-x-4">
            {relatedLoc.map((p) => (
              <SpecCard key={p.slug} product={p} tone="#faf7f1" />
            ))}
          </div>
        </section>
      )}
     </div>
    </PaperShell>
  );
}

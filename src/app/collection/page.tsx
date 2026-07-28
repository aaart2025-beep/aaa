import type { Metadata } from "next";
import { CollectionSection } from "@/components/collection/collection-section";
import { readContent } from "@/lib/content/store";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";
import { PaperShell } from "@/components/paper/paper-shell";
import { PaperHeader } from "@/components/paper/paper-header";
import { PaperFooter } from "@/components/paper/paper-footer";
import { HandNote } from "@/components/paper/annotations";
import { InkedText, Reveal } from "@/components/paper/inked";
import { SketchDoodle } from "@/components/paper/sketch-doodle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Collection — AAA",
  description:
    "The full collection, grouped for who and what it's for: for her, for him, summer, winter, and for your home.",
};

export default async function CollectionPage() {
  const content = await readContent();
  const lang = await getLang();
  const t = (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars);
  const eyebrow =
    lang === "he" ? t("shop.collectionEyebrow") : content.texts["collection.eyebrow"] ?? "AAA — The Collection";
  const title = lang === "he" ? t("shop.collectionTitle") : content.texts["collection.title"] ?? "Our Collection";
  const intro =
    lang === "he"
      ? t("shop.collectionIntro")
      : content.texts["collection.intro"] ??
        "Hand-made pieces, grouped by who and what they're for. Tap any item to open it.";

  // Map each image URL back to the product it belongs to, so tapping an item
  // opens its product page (falls back to the shop if it isn't a product photo).
  const slugByImage = new Map<string, string>();
  for (const p of content.products) {
    for (const img of p.images) {
      if (!slugByImage.has(img)) slugByImage.set(img, p.slug);
    }
  }
  const hrefFor = (src: string): string => {
    const slug = slugByImage.get(src);
    return slug ? `/shop/${slug}` : "/shop";
  };

  return (
    <PaperShell>
      <PaperHeader />

      <header className="px-5 pb-10 pt-10 text-center sm:px-8 sm:pb-12 sm:pt-12">
        <p className="font-typewriter text-[10px] uppercase tracking-[0.3em] text-ink/70 sm:text-[11px]">
          {eyebrow}
        </p>
        <h1 className="font-script mt-3 text-[clamp(2.4rem,7vw,4.4rem)] font-bold leading-[1.02] text-ink">
          <InkedText text={title} mode="script" speed={48} />
        </h1>
        <p className="font-typewriter mx-auto mt-4 max-w-xl text-[11.5px] leading-[1.9] tracking-[0.04em] text-ink/65">
          <InkedText text={intro} mode="type" startDelay={900} />
        </p>
        <HandNote rot={-2} className="mt-2 text-[17px]">
          <InkedText text={t("shop.albumNote")} mode="script" speed={34} startDelay={1800} />
        </HandNote>
      </header>

      <div className="flex flex-col gap-10 px-4 pb-20 sm:gap-12 sm:px-8">
        {content.collections.map((c, i) => (
          <Reveal key={c.id} delay={0.05}>
            <CollectionSection
              index={i}
              href={`/collection/${c.id}`}
              title={c.title}
              subtitle={c.subtitle}
              images={c.images}
              hrefs={c.images.map(hrefFor)}
              reverse={c.reverse}
            />
            {i % 2 === 1 && (
              <div className="mt-10 flex justify-center">
                <SketchDoodle complexity="simple" caption className="w-24 sm:w-28" />
              </div>
            )}
          </Reveal>
        ))}
      </div>

      <PaperFooter />
    </PaperShell>
  );
}

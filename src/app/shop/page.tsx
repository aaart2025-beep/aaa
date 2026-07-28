import type { Metadata } from "next";
import { Upload } from "lucide-react";
import { readContent } from "@/lib/content/store";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";
import { PaperShell } from "@/components/paper/paper-shell";
import { PaperHeader } from "@/components/paper/paper-header";
import { PaperFooter } from "@/components/paper/paper-footer";
import { ShopGrid } from "@/components/paper/shop-grid";
import { HandNote, ArrowDoodle, StitchMarks } from "@/components/paper/annotations";
import { InkedText, Reveal } from "@/components/paper/inked";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Shop — AAA",
  description: "The full shop: caps, footwear, clothing and art objects — every piece, one of one.",
};

export default async function ShopPage() {
  const content = await readContent();
  const lang = await getLang();
  const t = (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars);
  const text = (key: string, fallback: string) => content.texts[key] ?? fallback;
  // English keeps admin-editable content; Hebrew comes from the shop dictionary.
  const loc = (key: string, fallback: string) => (lang === "he" ? t(key) : text(key, fallback));
  const email = text("contact.email", "hello@example.com");

  return (
    <PaperShell>
      <PaperHeader />

      {/* ------------------------------------------------------------ */}
      {/* Heading band — the pieces start right beneath it; the         */}
      {/* working drawings live scattered among them.                   */}
      {/* ------------------------------------------------------------ */}
      <section className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-x-10 gap-y-6 px-5 pb-9 pt-9 sm:px-8 lg:pt-11">
        <div className="relative">
          <p className="font-typewriter text-[10px] uppercase tracking-[0.3em] text-ink/70 sm:text-[11px]">
            {loc("shop.eyebrow", "AAA — The Shop")}
          </p>
          <h1 className="font-script mt-2 text-[clamp(2.8rem,7vw,4.6rem)] font-bold leading-[1.02] text-ink">
            <InkedText text={loc("shop.title", "Our Shop")} mode="script" speed={48} />
          </h1>
          <p className="font-typewriter mt-4 max-w-[46ch] text-[12px] leading-[1.9] tracking-[0.04em] text-ink/70">
            <InkedText
              text={loc(
                "shop.intro",
                "AAA is a luxury fashion and art brand creating unique custom-designed pieces that speak individuality, creativity and timeless style.",
              )}
              mode="type"
              startDelay={900}
            />
          </p>
        </div>

        {/* a quiet signature corner */}
        <div className="pointer-events-none hidden flex-col items-end gap-0.5 pb-1 lg:flex" aria-hidden>
          <div className="flex items-center gap-1.5">
            <HandNote rot={-4} className="text-[16px]">
              <InkedText text={t("shop.fromWorkbook")} mode="script" speed={40} startDelay={1800} />
            </HandNote>
            <ArrowDoodle className="h-7 w-12 rotate-[24deg]" />
          </div>
          <span className="font-script ink-underline pr-1 text-[30px] leading-tight text-ink/80">
            <InkedText text="Arte" mode="script" speed={120} startDelay={2300} />
          </span>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* The pinboard — drawings scattered between the spec sheets     */}
      {/* ------------------------------------------------------------ */}
      <div className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <ShopGrid products={content.products.filter((p) => !p.hidden)} />
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Create your own design                                        */}
      {/* ------------------------------------------------------------ */}
      <section className="px-5 pb-20 sm:px-8">
        <Reveal className="relative mx-auto max-w-5xl bg-paper px-6 py-10 shadow-paper sm:px-12">
          <StitchMarks className="absolute left-4 top-3 h-3 w-9" />
          <StitchMarks className="absolute right-4 top-3 h-3 w-9" />
          <div className="grid items-center gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div>
              <h2 className="font-script text-[clamp(1.9rem,4vw,2.6rem)] font-bold leading-tight text-ink">
                <InkedText text={loc("shop.customTitle", "Create Your Own Design")} mode="script" speed={40} />
              </h2>
              <p className="font-typewriter mt-4 max-w-[52ch] text-[11.5px] leading-[1.9] tracking-[0.04em] text-ink/70">
                <InkedText
                  text={loc(
                    "shop.customBody",
                    "Have an idea, a sketch, a photo? Upload your image and our studio will hand-craft it into a one-of-a-kind wearable piece. Every AAA custom order is made-to-order, just for you.",
                  )}
                  mode="type"
                  startDelay={500}
                />
              </p>
            </div>
            <a
              href={`mailto:${email}?subject=${encodeURIComponent(t("shop.customMailSubject"))}&body=${encodeURIComponent(t("shop.customMailBody"))}`}
              className="dashed-slot group flex min-h-[150px] flex-col items-center justify-center gap-2.5 p-6 text-center transition-colors hover:bg-ink/[0.04]"
            >
              <Upload className="h-5 w-5 text-ink/70 transition-transform group-hover:-translate-y-0.5" strokeWidth={1.6} />
              <span className="font-typewriter text-[10px] uppercase tracking-[0.2em] text-ink/65">
                {loc("shop.customCta", "Upload your image")}
              </span>
              <HandNote rot={-2} className="text-[15px]">
                {t("shop.replyDay")}
              </HandNote>
            </a>
            <p className="mt-2 text-center font-typewriter text-[8.5px] leading-[1.5] tracking-[0.06em] text-ink/70">
              {t("shop.uploadRights")}
            </p>
          </div>
        </Reveal>
      </section>

      <PaperFooter />
    </PaperShell>
  );
}

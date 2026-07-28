import type { Metadata } from "next";
import Image from "next/image";
import { readContent } from "@/lib/content/store";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";
import { PaperShell } from "@/components/paper/paper-shell";
import { PaperHeader } from "@/components/paper/paper-header";
import { PaperFooter } from "@/components/paper/paper-footer";
import { HandNote, ArrowDoodle, Tape, StitchMarks } from "@/components/paper/annotations";
import { TransitionLink } from "@/components/transition/page-transition";
import { InkedText, Reveal } from "@/components/paper/inked";
import { SketchDoodle } from "@/components/paper/sketch-doodle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About — AAA",
  description: "The artist behind AAA: one pair of hands, one piece at a time.",
};

export default async function AboutPage() {
  const content = await readContent();
  const lang = await getLang();
  const t = (k: string, v?: Record<string, string | number>) => translate(lang, k, v);
  const text = (key: string, fallback: string) =>
    lang === "he" ? t(`pages.${key}`) : (content.texts[key] ?? fallback);

  const steps = [
    text("about.process1", "It starts as a sketch in this book — a line, a joke, a feeling."),
    text("about.process2", "Then the hunt: the right blank, the right fabric, the right thread."),
    text("about.process3", "Paint, stitch, fray, seal — every mark made by hand, no two alike."),
    text("about.process4", "Photographed, numbered and filed here. Then it's yours."),
  ];

  return (
    <PaperShell>
      <PaperHeader />

      <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        {/* heading */}
        <header className="relative max-w-2xl">
          <p className="font-typewriter text-[10px] uppercase tracking-[0.3em] text-ink/70">
            {text("about.eyebrow", "The artist")}
          </p>
          <h1 className="font-script mt-2 text-[clamp(2.6rem,6.5vw,4.4rem)] font-bold leading-[1.02] text-ink">
            <InkedText text={text("about.title", "One pair of hands,")} mode="script" speed={42} />
            <br />
            <span className="ink-underline">
              <InkedText text={text("about.title2", "one piece at a time.")} mode="script" speed={42} startDelay={900} />
            </span>
          </h1>
        </header>

        <div className="mt-12 grid gap-12 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-16">
          {/* the letter */}
          <div className="max-w-[58ch]">
            <p className="font-script text-[22px] leading-snug text-ink/80">
              <InkedText text={text("about.opening", "Hi — I'm Amit.")} mode="script" speed={50} startDelay={1700} />
            </p>
            <div className="font-typewriter mt-5 space-y-5 text-[12px] leading-[2.05] tracking-[0.03em] text-ink/75">
              <p>
                <InkedText mode="type" startDelay={2200} text={text(
                  "about.body1",
                  "AAA started exactly the way this website looks: as a workbook. A place where sketches, fabric swatches and half-ideas pile up until one of them refuses to stay on the page.",
                )} />
              </p>
              <p>
                <InkedText mode="type" startDelay={0} text={text(
                  "about.body2",
                  "Everything in the shop is made by hand in my studio — painted sneakers sealed and flexed for real wear, hoodies rebuilt with patches and embroidery, one-off objects that are equal parts furniture and inside joke.",
                )} />
              </p>
              <p>
                <InkedText mode="type" startDelay={0} text={text(
                  "about.body3",
                  "Nothing is mass-produced. When a piece sells, it's gone — the page turns, and the book moves on. If you want something that exists exactly once, you're in the right place.",
                )} />
              </p>
            </div>

            {/* pull quote */}
            <figure className="relative mt-10 border-l-2 border-ink/25 pl-5">
              <blockquote className="font-script text-[clamp(1.5rem,3vw,2rem)] leading-snug text-ink/85">
                <InkedText text={'“' + text("about.quote", "Souls are rare. Pretty faces are everywhere.") + '”'} mode="script" speed={30} />
              </blockquote>
              <figcaption className="font-typewriter mt-2 text-[9px] uppercase tracking-[0.22em] text-ink/70">
                {t("pages.about.quoteAttribution")}
              </figcaption>
            </figure>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <TransitionLink
                href="/shop"
                className="chip-lime font-typewriter px-5 py-2.5 text-[10px] uppercase tracking-[0.2em]"
              >
                {text("about.cta", "See the pieces")}
              </TransitionLink>
              <TransitionLink
                href="/create"
                className="chip-ink font-typewriter px-5 py-2.5 text-[10px] uppercase tracking-[0.2em]"
              >
                {text("about.ctaCreate", "Design your own")}
              </TransitionLink>
            </div>
          </div>

          {/* the studio photo + process */}
          <aside className="flex flex-col gap-10">
            <Reveal as="figure" className="relative max-w-[380px] self-center rotate-[1.6deg] bg-paper p-3 pb-4 shadow-paper md:self-start">
              <Tape className="-top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 -rotate-2" />
              <div className="relative aspect-[4/3] overflow-hidden border border-ink/15 bg-white/55">
                <Image
                  src="/images/studio.png"
                  alt={text("about.photoAlt", "The AAA studio table")}
                  fill
                  priority
                  sizes="(max-width: 768px) 86vw, 380px"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-2.5 flex items-baseline justify-between">
                <span className="font-typewriter text-[9px] uppercase tracking-[0.18em] text-ink/70">
                  {t("pages.about.figCaption")}
                </span>
                <HandNote rot={-2} className="text-[15px]">
                  {text("about.photoNote", "where it all happens")}
                </HandNote>
              </figcaption>
            </Reveal>

            <div className="relative">
              <div className="pointer-events-none absolute -top-7 left-2 hidden md:block">
                <ArrowDoodle className="h-7 w-12 rotate-[110deg]" />
              </div>
              <h2 className="font-typewriter text-[10px] uppercase tracking-[0.26em] text-ink/70">
                {text("about.processTitle", "How a piece happens")}
              </h2>
              <ol className="mt-3 space-y-3">
                {steps.map((step, i) => (
                  <Reveal as="li" key={step} delay={i * 0.12} className="flex items-baseline gap-3">
                    <span className="font-typewriter shrink-0 text-[10px] tracking-[0.1em] text-ink/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-typewriter text-[11.5px] leading-[1.85] tracking-[0.03em] text-ink/75">
                      {step}
                    </span>
                  </Reveal>
                ))}
              </ol>
              <div className="mt-4 flex items-end justify-between">
                <StitchMarks className="h-3 w-9" />
                <SketchDoodle complexity="complex" caption className="w-28 sm:w-32" />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <PaperFooter />
    </PaperShell>
  );
}

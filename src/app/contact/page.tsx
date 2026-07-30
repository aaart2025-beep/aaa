import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { InstagramIcon, WhatsappIcon } from "@/components/paper/social-icons";
import { readContent } from "@/lib/content/store";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";
import { PaperShell } from "@/components/paper/paper-shell";
import { PaperHeader } from "@/components/paper/paper-header";
import { PaperFooter, INSTAGRAM_URL, WHATSAPP_URL } from "@/components/paper/paper-footer";
import { HandNote, Paperclip, StitchMarks } from "@/components/paper/annotations";
import { SketchDoodle } from "@/components/paper/sketch-doodle";
import { InkedText, Reveal } from "@/components/paper/inked";
import { ContactForm } from "@/components/site/contact-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact — AAA",
  description: "Write to the studio: commissions, customs, questions.",
};

export default async function ContactPage() {
  const content = await readContent();
  const lang = await getLang();
  const t = (k: string, v?: Record<string, string | number>) => translate(lang, k, v);
  const text = (key: string, fallback: string) =>
    lang === "he" ? t(`pages.${key}`) : (content.texts[key] ?? fallback);
  const email = "aaart2025@gmail.com";

  return (
    <PaperShell>
      <PaperHeader />

      <div className="mx-auto flex max-w-6xl flex-col items-center px-5 pb-24 pt-12 text-center sm:px-8 sm:pt-16">
        <p className="font-typewriter text-[10px] uppercase tracking-[0.3em] text-ink/70">
          {text("contact.eyebrow", "Correspondence")}
        </p>
        <h1 className="font-script mt-2 text-[clamp(2.6rem,6.5vw,4.2rem)] font-bold leading-[1.02] text-ink">
          <InkedText text={text("contact.title", "Write to the studio")} mode="script" speed={46} />
        </h1>
        <p className="font-typewriter mt-5 max-w-[52ch] text-[12px] leading-[2] tracking-[0.04em] text-ink/70">
          <InkedText mode="type" startDelay={1100} text={text(
            "contact.body",
            "Commissions, custom pieces, sizing questions, or just to say the Mona Lisa Jordans are a lot — every message lands on this desk and gets a reply from the artist.",
          )} />
        </p>

        {/* the note card */}
        <Reveal className="relative mt-12 w-full max-w-md rotate-[-0.8deg] bg-paper px-7 py-9 shadow-paper">
          <Paperclip className="absolute -top-6 left-1/2 z-10 h-12 w-6 -translate-x-1/2 drop-shadow-sm" />
          <StitchMarks className="absolute right-4 top-3 h-3 w-9" />

          <p className="font-typewriter text-[9px] uppercase tracking-[0.26em] text-ink/70">
            {text("contact.cardLabel", "Preferred channel")}
          </p>
          <a
            href={`mailto:${email}?subject=${encodeURIComponent("Hello AAA")}`}
            className="chip-lime font-typewriter mt-4 inline-flex items-center gap-2 px-6 py-3 text-[11px] uppercase tracking-[0.18em]"
          >
            <Mail className="h-4 w-4" strokeWidth={1.8} />
            {email}
          </a>
          <div className="mt-5">
            <HandNote rot={-2} className="text-[17px]">
              <InkedText text={text("contact.note", "replies within a day — usually with sketches")} mode="script" speed={30} startDelay={600} />
            </HandNote>
          </div>

          <div className="mt-7 border-t border-ink/15 pt-5">
            <p className="font-typewriter text-[9px] uppercase tracking-[0.26em] text-ink/70">
              {text("contact.socialLabel", "Or find the studio here")}
            </p>
            <div className="mt-3 flex items-center justify-center gap-4 text-ink/65">
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram" className="transition-colors hover:text-ink">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="transition-colors hover:text-ink">
                <WhatsappIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </Reveal>

        {/* on-site contact form — saved to the studio inbox and emailed */}
        <div className="mt-12 w-full max-w-xl">
          <p className="font-typewriter mb-4 text-center text-[9px] uppercase tracking-[0.26em] text-ink/70">
            {t("contactForm.heading")}
          </p>
          <ContactForm />
        </div>

        {/* a page from the sketchbook, left on the desk beside the note */}
        <div className="mt-10 flex justify-center">
          <SketchDoodle caption className="w-28 sm:w-32" />
        </div>
      </div>

      <PaperFooter />
    </PaperShell>
  );
}

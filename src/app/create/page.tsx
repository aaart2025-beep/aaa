import type { Metadata } from "next";
import { readContent } from "@/lib/content/store";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";
import { PaperShell } from "@/components/paper/paper-shell";
import { PaperHeader } from "@/components/paper/paper-header";
import { PaperFooter } from "@/components/paper/paper-footer";
import { Creator } from "@/components/creator/creator";
import { InkedText } from "@/components/paper/inked";
import { HandNote, ArrowDoodle } from "@/components/paper/annotations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create — AAA",
  description:
    "Design your own one-of-one AAA piece: pick a base, paint every part, place the mark, choose fabric and cuts — priced live.",
};

export default async function CreatePage() {
  const content = await readContent();
  const lang = await getLang();
  const t = (k: string, v?: Record<string, string | number>) => translate(lang, k, v);
  const text = (key: string, fallback: string) =>
    lang === "he" ? t(`pages.${key}`) : (content.texts[key] ?? fallback);
  const email = content.texts["contact.email"] ?? "hello@example.com";

  return (
    <PaperShell>
      <PaperHeader />

      <div className="mx-auto max-w-6xl px-5 pb-20 pt-9 sm:px-8 lg:pt-11">
        <header className="relative mb-10 max-w-2xl">
          <p className="font-typewriter text-[10px] uppercase tracking-[0.3em] text-ink/70">
            {text("create.eyebrow", "The drafting table")}
          </p>
          <h1 className="font-script mt-2 text-[clamp(2.4rem,5.5vw,3.8rem)] font-bold leading-[1.04] text-ink">
            <InkedText text={text("create.title", "Design it yourself.")} mode="script" speed={42} />
          </h1>
          <p className="font-typewriter mt-4 max-w-[52ch] text-[11.5px] leading-[1.9] tracking-[0.04em] text-ink/70">
            <InkedText
              text={text(
                "create.intro",
                "Your page in the workbook: pick a base, click any part of the drawing and paint it, drag the AAA mark wherever it belongs, choose fabric, size and cuts. The studio hand-makes exactly what you draft.",
              )}
              mode="type"
              startDelay={1000}
            />
          </p>
          <div className="pointer-events-none absolute -right-4 top-2 hidden items-center gap-1.5 lg:flex" aria-hidden>
            <ArrowDoodle flip className="h-7 w-12 -rotate-[18deg]" />
            <HandNote rot={3} className="text-[16px]">
              {text("create.note", "every draft is buildable!")}
            </HandNote>
          </div>
        </header>

        <Creator products={content.products} email={email} />
      </div>

      <PaperFooter />
    </PaperShell>
  );
}

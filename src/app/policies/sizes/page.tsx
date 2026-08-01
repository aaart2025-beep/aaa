import type { Metadata } from "next";
import { PaperShell } from "@/components/paper/paper-shell";
import { PaperHeader } from "@/components/paper/paper-header";
import { PaperFooter } from "@/components/paper/paper-footer";
import { TransitionLink } from "@/components/transition/page-transition";
import { SizeGuideTable } from "@/components/shop/size-guide-table";
import { readContent } from "@/lib/content/store";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";

/* Size guide — an admin-editable measurements table (Site → Size Guide in the
 * console). Content is read fresh so saved edits show immediately. The table
 * itself is studio-entered text, so it isn't run through the dictionary. */

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const t = (k: string) => translate(lang, k);
  return {
    title: `${t("shop.sizeGuideTitle")} — AAA`,
    description: t("shop.sizeGuideTitle"),
    alternates: { canonical: "/policies/sizes" },
  };
}

export default async function SizeGuidePage() {
  const lang = await getLang();
  const t = (k: string) => translate(lang, k);
  const { sizeGuide } = await readContent();

  return (
    <PaperShell>
      <PaperHeader />
      <div className="mx-auto w-full max-w-[680px] px-5 pb-16 pt-8 sm:px-8">
        <TransitionLink
          href="/shop"
          className="font-typewriter mb-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-ink"
        >
          <span aria-hidden>←</span> {t("shop.backToShop")}
        </TransitionLink>
        <h1 className="font-archivo mb-6 border-b border-ink/60 pb-3 text-[clamp(1.4rem,4vw,2.2rem)] font-extrabold uppercase leading-tight tracking-tight text-ink">
          {t("shop.sizeGuideTitle")}
        </h1>

        <SizeGuideTable
          guide={sizeGuide}
          sizeCol={t("shop.sizeCol")}
          measureCol={t("shop.measureCol")}
          emptyText={t("shop.sizeGuideEmpty")}
        />
      </div>
      <PaperFooter />
    </PaperShell>
  );
}

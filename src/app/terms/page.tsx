import type { Metadata } from "next";
import { PaperShell } from "@/components/paper/paper-shell";
import { PaperHeader } from "@/components/paper/paper-header";
import { PaperFooter } from "@/components/paper/paper-footer";
import { TransitionLink } from "@/components/transition/page-transition";
import { TermsOfSaleContent } from "@/lib/policies";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const t = (k: string) => translate(lang, k);
  return {
    title: `${t("policies.terms.title")} — AAA`,
    description: t("policies.terms.metaDescription"),
    alternates: { canonical: "/terms" },
  };
}

export default async function TermsOfSalePage() {
  const lang = await getLang();
  const t = (k: string) => translate(lang, k);
  return (
    <PaperShell>
      <PaperHeader />
      <div className="mx-auto w-full max-w-[680px] px-5 pb-16 pt-8 sm:px-8">
        <TransitionLink
          href="/shop"
          className="font-typewriter mb-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-ink"
        >
          <span aria-hidden>←</span> {t("policies.backToShop")}
        </TransitionLink>
        <h1 className="font-archivo mb-4 border-b border-ink/60 pb-3 text-[clamp(1.4rem,4vw,2.2rem)] font-extrabold uppercase leading-tight tracking-tight text-ink">
          {t("policies.terms.title")}
        </h1>
        <p className="font-typewriter mb-6 rounded-md border border-amber-700/40 bg-amber-500/10 px-3 py-2 text-[10.5px] leading-[1.6] tracking-[0.02em] text-ink/80">
          {t("policies.disclaimer.legalDraft")}
        </p>
        <TermsOfSaleContent />
      </div>
      <PaperFooter />
    </PaperShell>
  );
}

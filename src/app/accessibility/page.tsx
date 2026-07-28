import type { Metadata } from "next";
import { PaperShell } from "@/components/paper/paper-shell";
import { PaperHeader } from "@/components/paper/paper-header";
import { PaperFooter } from "@/components/paper/paper-footer";
import { TransitionLink } from "@/components/transition/page-transition";
import { AccessibilityStatementContent } from "@/lib/policies";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: `${translate(lang, "policies.accessibility.title")} — AAA`,
    description: translate(lang, "policies.accessibility.metaDescription"),
    alternates: { canonical: "/accessibility" },
  };
}

export default async function AccessibilityStatementPage() {
  const lang = await getLang();
  const t = (k: string, v?: Record<string, string | number>) => translate(lang, k, v);
  return (
    <PaperShell>
      <PaperHeader />
      <div className="mx-auto w-full max-w-[680px] px-5 pb-16 pt-8 sm:px-8">
        <TransitionLink
          href="/shop"
          className="font-typewriter mb-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-ink"
        >
          <span aria-hidden>←</span> {t("pages.a11y.backToShop")}
        </TransitionLink>
        <h1 className="font-archivo mb-6 border-b border-ink/60 pb-3 text-[clamp(1.4rem,4vw,2.2rem)] font-extrabold uppercase leading-tight tracking-tight text-ink">
          {t("policies.accessibility.title")}
        </h1>
        <AccessibilityStatementContent />
      </div>
      <PaperFooter />
    </PaperShell>
  );
}

import type { Metadata } from "next";
import { PaperShell } from "@/components/paper/paper-shell";
import { PaperHeader } from "@/components/paper/paper-header";
import { PaperFooter } from "@/components/paper/paper-footer";
import { TransitionLink } from "@/components/transition/page-transition";
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
  const rows = (sizeGuide?.rows ?? []).filter((r) => (r.size ?? "").trim() || (r.measure ?? "").trim());

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

        {sizeGuide?.intro?.trim() ? (
          <p className="font-typewriter mb-6 text-[12px] leading-[1.8] tracking-[0.02em] text-ink/75">
            {sizeGuide.intro}
          </p>
        ) : null}

        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-start">
              <thead>
                <tr className="border-b-2 border-ink/60">
                  <th className="font-archivo py-2 pe-4 text-start text-[11px] font-extrabold uppercase tracking-tight text-ink">
                    {t("shop.sizeCol")}
                  </th>
                  <th className="font-archivo py-2 text-start text-[11px] font-extrabold uppercase tracking-tight text-ink">
                    {t("shop.measureCol")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-dashed border-ink/25 align-top">
                    <td className="font-typewriter whitespace-nowrap py-2.5 pe-4 text-[12px] font-bold uppercase tracking-[0.06em] text-ink">
                      {r.size}
                    </td>
                    <td className="font-typewriter py-2.5 text-[12px] leading-[1.7] tracking-[0.02em] text-ink/80">
                      {r.measure}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="font-typewriter text-[12px] leading-[1.8] tracking-[0.02em] text-ink/70">
            {t("shop.sizeGuideEmpty")}
          </p>
        )}
      </div>
      <PaperFooter />
    </PaperShell>
  );
}

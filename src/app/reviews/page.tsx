import type { Metadata } from "next";
import { PaperShell } from "@/components/paper/paper-shell";
import { PaperHeader } from "@/components/paper/paper-header";
import { PaperFooter } from "@/components/paper/paper-footer";
import { TransitionLink } from "@/components/transition/page-transition";
import { ReviewForm } from "@/components/site/review-form";
import { ReviewWall } from "@/components/reviews/review-wall";
import { readReviews } from "@/lib/reviews/store";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const t = (k: string) => translate(lang, k);
  return { title: `${t("reviews.title")} — AAA`, description: t("reviews.intro"), alternates: { canonical: "/reviews" } };
}

export default async function ReviewsPage() {
  const lang = await getLang();
  const t = (k: string) => translate(lang, k);
  const approved = (await readReviews())
    .filter((r) => r.status === "approved")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <PaperShell>
      <PaperHeader />
      <div className="mx-auto w-full max-w-[820px] px-5 pb-16 pt-8 sm:px-8">
        <TransitionLink
          href="/shop"
          className="font-typewriter mb-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-ink"
        >
          <span aria-hidden>←</span> {t("shop.backToShop")}
        </TransitionLink>

        <p className="font-typewriter text-[10px] uppercase tracking-[0.3em] text-ink/70">{t("reviews.eyebrow")}</p>
        <h1 className="font-archivo mt-1 text-[clamp(1.8rem,5vw,2.8rem)] font-extrabold uppercase leading-none tracking-tight text-ink">
          {t("reviews.title")}
        </h1>
        <p className="font-typewriter mt-3 max-w-[52ch] text-[12.5px] leading-[1.9] text-ink/70">{t("reviews.intro")}</p>

        <div className="mt-8">
          {approved.length > 0 ? (
            <ReviewWall reviews={approved} />
          ) : (
            <p className="font-typewriter text-[12px] text-ink/60">{t("reviews.empty")}</p>
          )}
        </div>

        <div className="mx-auto mt-14 max-w-xl border-t border-ink/40 pt-8">
          <h2 className="font-archivo mb-4 text-center text-[13px] font-bold uppercase tracking-[0.18em] text-ink/80">
            {t("reviews.formHeading")}
          </h2>
          <ReviewForm />
        </div>
      </div>
      <PaperFooter />
    </PaperShell>
  );
}

import { TransitionLink } from "@/components/transition/page-transition";
import { SketchDoodle } from "@/components/paper/sketch-doodle";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";

export default async function NotFound() {
  const lang = await getLang();
  const t = (k: string, v?: Record<string, string | number>) => translate(lang, k, v);
  return (
    <main className="book-theme bg-grid-paper flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <SketchDoodle complexity="simple" className="mb-4 w-20" />
      <p className="font-typewriter text-[11px] uppercase tracking-[0.3em] text-ink/70">{t("pages.notFound.eyebrow")}</p>
      <h1 className="font-script mt-3 text-[clamp(2.2rem,7vw,3.6rem)] leading-tight text-ink">
        {t("pages.notFound.title")}
      </h1>
      <p className="font-typewriter mt-3 max-w-sm text-[12.5px] leading-[1.9] tracking-[0.04em] text-ink/70">
        {t("pages.notFound.body")}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <TransitionLink
          href="/shop"
          className="chip-lime font-archivo px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em]"
        >
          {t("pages.notFound.openShop")}
        </TransitionLink>
        <TransitionLink
          href="/"
          className="chip-ink font-archivo px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em]"
        >
          {t("pages.notFound.backCover")}
        </TransitionLink>
      </div>
    </main>
  );
}

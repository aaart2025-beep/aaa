import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { readContent } from "@/lib/content/store";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";
import { TransitionLink } from "@/components/transition/page-transition";
import { Tape, HandNote } from "@/components/paper/annotations";
import { SketchDoodle } from "@/components/paper/sketch-doodle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Staff entrance — AAA",
  description: "Sign in to the AAA studio.",
};

/* The staff door: a quiet page of the same workbook, not a different site.
 * One taped note-card with underline fields and the lime chip. */
export default async function LoginPage() {
  const content = await readContent();
  const lang = await getLang();
  const t = (k: string, v?: Record<string, string | number>) => translate(lang, k, v);
  const heading = lang === "he" ? t("pages.login.heading") : (content.texts["login.heading"] ?? "Staff entrance");
  const subtitle =
    lang === "he" ? t("pages.login.subtitle") : (content.texts["login.subtitle"] ?? "Sign in to open the studio console.");
  return (
    <main className="book-theme bg-grid-paper relative flex min-h-screen items-center justify-center px-5 py-14">
      <div className="relative w-full max-w-md">
        <div className="shadow-paper relative -rotate-[0.6deg] bg-paper px-7 py-9 sm:px-9">
          <Tape className="-top-2.5 left-8 z-10 h-5 w-16 -rotate-[8deg]" />
          <Tape className="-top-2.5 right-8 z-10 h-5 w-16 rotate-[10deg]" />

          <p className="font-typewriter text-[10px] uppercase tracking-[0.3em] text-ink/70">{t("pages.login.makersOnly")}</p>
          <h1 className="font-script mt-2 text-[clamp(1.9rem,6vw,2.6rem)] leading-tight text-ink">{heading}</h1>
          <p className="font-typewriter mt-2 text-[12px] leading-[1.8] tracking-[0.04em] text-ink/70">{subtitle}</p>

          <div className="mt-7">
            <LoginForm />
          </div>

          <HandNote rot={-2.5} className="mt-6 block text-[15px] text-ink/70">
            {t("pages.login.note")}
          </HandNote>

          <SketchDoodle complexity="simple" className="absolute -bottom-2 right-4 w-14 opacity-70" strokeClassName="text-ink/70" />
        </div>

        <p className="mt-6 text-center">
          <TransitionLink
            href="/"
            className="font-typewriter text-[10px] uppercase tracking-[0.2em] text-ink/70 underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            {t("pages.login.back")}
          </TransitionLink>
        </p>
      </div>
    </main>
  );
}

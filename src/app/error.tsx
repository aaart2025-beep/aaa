"use client";

import { SketchDoodle } from "@/components/paper/sketch-doodle";
import { useT } from "@/lib/i18n/context";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  return (
    <main className="book-theme bg-grid-paper flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <SketchDoodle complexity="simple" className="mb-4 w-20" />
      <p className="font-typewriter text-[11px] uppercase tracking-[0.3em] text-ink/70">{t("pages.error.eyebrow")}</p>
      <h1 className="font-script mt-3 text-[clamp(2.2rem,7vw,3.6rem)] leading-tight text-ink">{t("pages.error.title")}</h1>
      <p className="font-typewriter mt-3 max-w-sm text-[12.5px] leading-[1.9] tracking-[0.04em] text-ink/70">
        {t("pages.error.body")}
      </p>
      <button
        type="button"
        onClick={reset}
        className="chip-lime font-archivo mt-8 px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em]"
      >
        {t("pages.error.tryAgain")}
      </button>
    </main>
  );
}

"use client";

import { useLang } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

/* One-tap language switch. Shows the language you'd switch TO, so it reads as
 * an action: in English it shows "עברית", in Hebrew it shows "EN". */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, toggle } = useLang();
  const label = lang === "he" ? "EN" : "עברית";
  const aria = lang === "he" ? "Switch to English" : "מעבר לעברית";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={aria}
      className={cn(
        "font-typewriter inline-flex h-8 min-w-8 items-center justify-center rounded-sm border border-ink/25 px-2 text-[11px] uppercase tracking-[0.12em] text-ink/70 transition-colors hover:border-ink hover:text-ink",
        className,
      )}
    >
      {label}
    </button>
  );
}

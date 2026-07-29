"use client";

import * as React from "react";
import { Accessibility, X } from "lucide-react";
import { useT } from "@/lib/i18n/context";

/* A real, code-level accessibility control (not a third-party overlay widget —
 * those get sued too). Three preferences, persisted to localStorage and applied
 * to <html> so they survive navigation and reloads:
 *   - text size  → CSS `zoom` on the root (scales the px-heavy layout like the
 *                  browser's own zoom, which the layout already survives)
 *   - high contrast → forces the ink opacity-ramp text to full strength + underlines links
 *   - reduce motion → stops CSS animation/transition site-wide
 * The matching no-flash bootstrap runs in layout.tsx before paint. */

const STORAGE_KEY = "aaa-a11y";

type TextSize = "normal" | "large" | "xlarge";
export interface A11yPrefs {
  text: TextSize;
  contrast: boolean;
  motion: boolean; // true = reduce motion
}

const DEFAULT_PREFS: A11yPrefs = { text: "normal", contrast: false, motion: false };
const ZOOM: Record<TextSize, string> = { normal: "", large: "1.15", xlarge: "1.3" };

function readPrefs(): A11yPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const p = JSON.parse(raw) as Partial<A11yPrefs>;
    return {
      text: p.text === "large" || p.text === "xlarge" ? p.text : "normal",
      contrast: !!p.contrast,
      motion: !!p.motion,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

/** Apply prefs to <html> and persist. Kept in sync with the inline bootstrap. */
export function applyPrefs(prefs: A11yPrefs): void {
  const el = document.documentElement;
  el.style.setProperty("zoom", ZOOM[prefs.text]);
  el.classList.toggle("a11y-contrast", prefs.contrast);
  el.classList.toggle("a11y-reduce-motion", prefs.motion);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* storage unavailable (private mode) — prefs still apply for this session */
  }
}

/** Inline script string run in <head> before paint so choices don't flash. */
export const A11Y_BOOTSTRAP = `(function(){try{var p=JSON.parse(localStorage.getItem('${STORAGE_KEY}')||'{}');var e=document.documentElement;var z=p.text==='large'?'1.15':p.text==='xlarge'?'1.3':'';e.style.setProperty('zoom',z);if(p.contrast)e.classList.add('a11y-contrast');if(p.motion)e.classList.add('a11y-reduce-motion');}catch(_){}})();`;

const chip =
  "font-typewriter inline-flex min-h-11 items-center justify-center rounded-md border px-3 text-[11px] uppercase tracking-[0.12em] transition-colors";
const chipOn = "border-ink bg-ink text-paper";
const chipOff = "border-ink/30 bg-transparent text-ink/80 hover:border-ink/60";

export function AccessibilityMenu() {
  const t = useT();
  const [open, setOpen] = React.useState(false);
  const [prefs, setPrefs] = React.useState<A11yPrefs>(DEFAULT_PREFS);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // hydrate from storage once on mount (values are already applied by the bootstrap)
  React.useEffect(() => {
    setPrefs(readPrefs());
  }, []);

  const update = React.useCallback((patch: Partial<A11yPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      applyPrefs(next);
      return next;
    });
  }, []);

  // close on Escape (return focus to the trigger) and on outside click
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || buttonRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  // move focus into the panel when it opens
  React.useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>("button, a")?.focus();
  }, [open]);

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-[70] sm:left-auto sm:right-[max(1rem,env(safe-area-inset-right))] print:hidden">
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label={t("pages.a11yMenu.dialogLabel")}
          className="book-theme absolute bottom-14 left-0 w-[248px] rounded-lg border border-ink/25 bg-paper p-4 shadow-[4px_6px_0_rgba(40,34,24,0.18)] sm:left-auto sm:right-0"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-archivo text-[13px] font-bold uppercase tracking-[0.08em] text-ink">
              {t("pages.a11yMenu.title")}
            </h2>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
              aria-label={t("pages.a11yMenu.close")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink/70 hover:text-ink"
            >
              <X className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>

          <fieldset className="mb-3">
            <legend className="font-typewriter mb-1.5 text-[10px] uppercase tracking-[0.18em] text-ink/70">
              {t("pages.a11yMenu.textSize")}
            </legend>
            <div className="flex gap-1.5" role="group" aria-label={t("pages.a11yMenu.textSize")}>
              {([
                ["normal", "A", "pages.a11yMenu.textNormal"],
                ["large", "A+", "pages.a11yMenu.textLarge"],
                ["xlarge", "A++", "pages.a11yMenu.textLargest"],
              ] as [TextSize, string, string][]).map(([val, label, aria]) => (
                <button
                  key={val}
                  type="button"
                  aria-label={t(aria)}
                  aria-pressed={prefs.text === val}
                  onClick={() => update({ text: val })}
                  className={`${chip} flex-1 ${prefs.text === val ? chipOn : chipOff}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              aria-pressed={prefs.contrast}
              onClick={() => update({ contrast: !prefs.contrast })}
              className={`${chip} w-full justify-between ${prefs.contrast ? chipOn : chipOff}`}
            >
              <span>{t("pages.a11yMenu.highContrast")}</span>
              <span aria-hidden>{prefs.contrast ? t("pages.a11yMenu.on") : t("pages.a11yMenu.off")}</span>
            </button>
            <button
              type="button"
              aria-pressed={prefs.motion}
              onClick={() => update({ motion: !prefs.motion })}
              className={`${chip} w-full justify-between ${prefs.motion ? chipOn : chipOff}`}
            >
              <span>{t("pages.a11yMenu.reduceMotion")}</span>
              <span aria-hidden>{prefs.motion ? t("pages.a11yMenu.on") : t("pages.a11yMenu.off")}</span>
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-ink/15 pt-2.5">
            <button
              type="button"
              onClick={() => update(DEFAULT_PREFS)}
              className="font-typewriter text-[10px] uppercase tracking-[0.14em] text-ink/70 underline underline-offset-2 hover:text-ink"
            >
              {t("pages.a11yMenu.reset")}
            </button>
            <a
              href="/accessibility"
              className="font-typewriter text-[10px] uppercase tracking-[0.14em] text-ink/70 underline underline-offset-2 hover:text-ink"
            >
              {t("pages.a11yMenu.statement")}
            </a>
          </div>
        </div>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t("pages.a11yMenu.dialogLabel")}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/25 bg-paper text-ink shadow-[3px_4px_0_rgba(40,34,24,0.22)] transition-transform hover:-translate-y-0.5"
      >
        <Accessibility className="h-6 w-6" strokeWidth={1.7} />
      </button>
    </div>
  );
}

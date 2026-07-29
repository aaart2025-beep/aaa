"use client";

import * as React from "react";
import { TransitionLink } from "@/components/transition/page-transition";
import { LanguageToggle } from "@/components/site/language-toggle";
import { cn } from "@/lib/utils";

export interface MobileNavProps {
  links: { href: string; label: string }[];
  loginHref: string;
  loginLabel: string;
  homeLabel?: string;
  homeHref?: string;
  showHome?: boolean;
  admin?: boolean;
  tone?: "dark" | "light";
  /** Translated chrome labels (default to English). */
  adminLabel?: string;
  menuLabel?: string;
  closeLabel?: string;
  footerNote?: string;
  /** Legal/policy links shown at the bottom of the menu. */
  legalLinks?: { href: string; label: string }[];
  legalHeading?: string;
  /** Show the EN/HE language switch inside the menu. */
  showLangToggle?: boolean;
}

/* Phone menu as a page of the same workbook: a full-height paper sheet that
 * slides in from the right — typewriter rows with ink rules, comfy 48px
 * touch targets, safe-area padding, Escape + backdrop to close. */
export function MobileNav({
  links,
  loginHref,
  loginLabel,
  homeLabel = "Home",
  homeHref = "/",
  showHome = true,
  admin = false,
  tone = "dark",
  adminLabel = "Admin Console",
  menuLabel = "Menu",
  closeLabel = "Close menu",
  footerNote = "amit_amar_art — made by hand",
  legalLinks = [],
  legalHeading = "Policies & terms",
  showLangToggle = true,
}: MobileNavProps) {
  const [open, setOpen] = React.useState(false);
  const isDark = tone === "dark";
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const close = React.useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Escape closes; body scroll locks while open
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  const rowCls =
    "font-typewriter flex min-h-12 items-center border-b border-ink/10 px-1.5 text-[13px] uppercase tracking-[0.16em] text-ink/80 transition-colors hover:bg-ink/5 hover:text-ink";

  return (
    <div className="sm:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? closeLabel : menuLabel}
        aria-expanded={open}
        className={cn(
          "flex size-11 items-center justify-center rounded-lg border text-[19px] leading-none transition-colors",
          isDark ? "border-white/20 text-white hover:bg-white/10" : "border-ink/20 text-ink hover:bg-ink/5",
        )}
      >
        {open ? "✕" : "☰"}
      </button>

      {/* backdrop */}
      <button
        aria-hidden
        tabIndex={-1}
        onClick={close}
        className={cn(
          "fixed inset-0 z-[70] cursor-default bg-ink/35 backdrop-blur-[1px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* the paper sheet */}
      <aside
        role="dialog"
        aria-label="Menu"
        aria-hidden={!open}
        className={cn(
          "book-theme bg-grid-paper fixed inset-y-0 right-0 z-[71] flex w-[min(320px,86vw)] flex-col bg-paper shadow-[-18px_0_50px_oklch(0.21_0.004_60/0.28)] transition-transform duration-[360ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-ink/15 px-5 pb-3 pt-[max(0.875rem,env(safe-area-inset-top))]">
          <span className="font-typewriter text-[11px] uppercase tracking-[0.3em] text-ink/70">AAA — {menuLabel}</span>
          <button
            type="button"
            onClick={close}
            aria-label={closeLabel}
            className="-mr-2.5 flex h-11 w-11 items-center justify-center text-[17px] text-ink/70 transition-colors hover:text-ink"
          >
            ✕
          </button>
        </header>

        <nav className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
          {showHome && (
            <TransitionLink href={homeHref} onClick={close} className={rowCls}>
              {homeLabel}
            </TransitionLink>
          )}
          {links.map((l) => (
            <TransitionLink key={l.label} href={l.href} onClick={close} className={rowCls}>
              {l.label}
            </TransitionLink>
          ))}
          {admin && (
            <TransitionLink href="/admin" onClick={close} className={cn(rowCls, "text-amber-700")}>
              {adminLabel}
            </TransitionLink>
          )}
        </nav>

        <footer className="shrink-0 border-t border-ink/15 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {/* legal / policy links */}
          {legalLinks.length > 0 && (
            <div className="mb-2">
              <p className="font-typewriter px-1.5 pb-1 text-[9px] uppercase tracking-[0.22em] text-ink/50">
                {legalHeading}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 px-1.5">
                {legalLinks.map((l) => (
                  <TransitionLink
                    key={l.href}
                    href={l.href}
                    onClick={close}
                    className="font-typewriter inline-flex min-h-9 items-center text-[11px] uppercase tracking-[0.12em] text-ink/70 transition-colors hover:text-ink"
                  >
                    {l.label}
                  </TransitionLink>
                ))}
              </div>
            </div>
          )}

          {/* language switch — lives here so it's off the top bar on phones */}
          {showLangToggle && (
            <div className="mb-1 border-t border-ink/10 px-1.5 pt-2">
              <LanguageToggle />
            </div>
          )}

          <TransitionLink
            href={loginHref}
            onClick={close}
            className="font-typewriter flex min-h-12 items-center border-t border-ink/10 px-1.5 pt-1 text-[12px] uppercase tracking-[0.16em] text-ink/70 transition-colors hover:text-ink"
          >
            {loginLabel}
          </TransitionLink>
          <p className="font-script mt-1 text-[15px] text-ink/70">{footerNote}</p>
        </footer>
      </aside>
    </div>
  );
}

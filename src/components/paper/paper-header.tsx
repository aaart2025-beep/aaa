import Link from "next/link";
import { User } from "lucide-react";
import { TransitionLink } from "@/components/transition/page-transition";
import { MobileNav } from "@/components/site/mobile-nav";
import { SearchOverlay } from "@/components/site/search-overlay";
import { LanguageToggle } from "@/components/site/language-toggle";
import { CartButton } from "@/components/cart/cart-button";
import { AaaLogo } from "@/components/book/aaa-logo";
import { isAdmin } from "@/lib/auth";
import { readContent } from "@/lib/content/store";
import { navTextKey, visibleNavItems } from "@/lib/nav";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";
import type { Lang } from "@/lib/i18n/config";

/* The workbook masthead — typewriter nav around the hand-drawn AAA waveform,
 * sitting on the paper like a printed letterhead. Sticky, solid paper (no
 * backdrop blur), thin ink rule beneath. Order & visibility come from the
 * shared nav module (admin can toggle items on/off). Bilingual: Hebrew uses
 * the translated nav labels, English keeps the admin-editable content text. */

export async function PaperHeader({
  forceLang,
  showLangToggle = true,
  showMobileMenu = true,
}: {
  /** Override the language (the entrance forces English). */
  forceLang?: Lang;
  /** Hide the language switch (e.g. on the always-English entrance). */
  showLangToggle?: boolean;
  /** Hide the mobile hamburger menu (e.g. on the entrance/cover, before the shop). */
  showMobileMenu?: boolean;
} = {}) {
  const [admin, content, cookieLang] = await Promise.all([isAdmin(), readContent(), getLang()]);
  const lang = forceLang ?? cookieLang;
  const t = (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars);
  const navLabel = (key: string, fallback: string) =>
    lang === "he" ? t(`chrome.nav.${key}`) : (content.texts[navTextKey(key)] ?? fallback);

  const items = visibleNavItems(content.navVisible).map((n) => ({
    href: n.href,
    side: n.side,
    label: navLabel(n.key, n.fallback),
  }));
  const leftItems = items.filter((n) => n.side === "left");
  const rightItems = items.filter((n) => n.side === "right");

  // Legal links for the mobile menu (near the language switch).
  const legalLinks = [
    { href: "/policies/returns", label: t("chrome.footerReturns") },
    { href: "/policies/shipping", label: t("chrome.footerShipping") },
    { href: "/policies/sizes", label: t("chrome.footerSizes") },
    { href: "/policies/care", label: t("chrome.footerCare") },
    { href: "/privacy", label: t("chrome.footerPrivacy") },
    { href: "/terms", label: t("chrome.footerTerms") },
    { href: "/accessibility", label: t("chrome.footerAccessibility") },
  ];

  const navLink =
    "font-typewriter text-[11px] uppercase tracking-[0.18em] text-ink/65 transition-colors hover:text-ink";

  return (
    <header className="sticky top-0 z-50 border-b border-ink/15 bg-paper px-4 pb-2 pt-[max(0.625rem,env(safe-area-inset-top))] sm:px-8">
      {/* decorative top rule */}
      <div className="mx-auto flex max-w-6xl items-center gap-3 text-ink/70">
        <span className="h-px flex-1 bg-ink/20" />
        <span className="font-typewriter text-[9px] uppercase tracking-[0.3em]">
          {t("chrome.estHandmade")}
        </span>
        <span className="h-px flex-1 bg-ink/20" />
      </div>

      <div className="mx-auto mt-1.5 flex max-w-6xl items-center justify-between gap-4">
        {/* left: nav (desktop) / logo (mobile) */}
        <nav aria-label="Primary" className="hidden flex-1 items-center gap-6 sm:flex">
          {leftItems.map((item) => (
            <TransitionLink key={item.href} href={item.href} className={navLink}>
              {item.label}
            </TransitionLink>
          ))}
        </nav>

        {/* phone: spacer so the wordmark sits dead-centre against the menu button */}
        <span aria-hidden className="flex-1 sm:hidden" />

        {/* center: wordmark → home (turns back to the cover) */}
        <TransitionLink
          href="/#enter"
          aria-label="AAA — home"
          className="flex flex-col items-center justify-center sm:flex-none"
        >
          <AaaLogo className="h-9 w-auto sm:h-11" />
          <span className="mt-0.5 font-script text-[15px] leading-none tracking-wide text-ink/70">
            amit_amar_art
          </span>
        </TransitionLink>

        {/* right: nav + icons */}
        <div className="flex flex-1 items-center justify-end gap-5">
          <nav aria-label="Secondary" className="hidden items-center gap-6 sm:flex">
            {rightItems.map((item) => (
              <TransitionLink key={item.href} href={item.href} className={navLink}>
                {item.label}
              </TransitionLink>
            ))}
            {admin && (
              <Link
                href="/admin"
                className="font-typewriter rounded-sm border border-amber-600/50 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-amber-700 transition-colors hover:bg-amber-500/10"
              >
                {t("chrome.admin")}
              </Link>
            )}
          </nav>
          <div className="hidden items-center gap-3.5 text-ink/70 sm:flex">
            {showLangToggle && <LanguageToggle />}
            <SearchOverlay className="text-ink/70" label={t("chrome.searchShop")} />
            <Link
              href={admin ? "/admin" : "/login"}
              aria-label={t("chrome.account")}
              className="transition-colors hover:text-ink"
            >
              <User className="h-[17px] w-[17px]" strokeWidth={1.6} />
            </Link>
            <CartButton />
          </div>
          <div className="flex items-center gap-3 text-ink/70 sm:hidden">
            {/* Language switch lives inside the menu on phones (keeps the AAA
                wordmark centred). */}
            <SearchOverlay className="text-ink/70" label={t("chrome.searchShop")} />
            <CartButton />
            {showMobileMenu && (
              <MobileNav
                tone="light"
                admin={admin}
                showHome
                homeLabel={navLabel("home", "Home")}
                homeHref="/#enter"
                loginHref={admin ? "/admin" : "/login"}
                loginLabel={admin ? t("chrome.console") : t("chrome.login")}
                adminLabel={t("chrome.adminConsole")}
                menuLabel={t("chrome.menu")}
                closeLabel={t("chrome.closeMenu")}
                footerNote={t("chrome.madeByHand")}
                legalLinks={legalLinks}
                legalHeading={t("chrome.footerLegal")}
                showLangToggle={showLangToggle}
                links={items.map((n) => ({ href: n.href, label: n.label }))}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

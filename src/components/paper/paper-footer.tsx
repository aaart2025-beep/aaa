import { TransitionLink } from "@/components/transition/page-transition";
import { InstagramIcon, WhatsappIcon } from "@/components/paper/social-icons";
import { AaaLogo } from "@/components/book/aaa-logo";
import { readContent } from "@/lib/content/store";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";

/* Studio socials — single source of truth for the storefront. */
export const INSTAGRAM_URL = "https://www.instagram.com/aaa.is.art/";
export const WHATSAPP_URL = "https://wa.me/972503363443";

/* The back matter of every workbook page: socials, the waveform colophon, a
 * typed newsletter line and the way back to the cover. Bilingual: Hebrew uses
 * the dictionary, English keeps the admin-editable content text. */

export async function PaperFooter() {
  const [content, lang] = await Promise.all([readContent(), getLang()]);
  const t = (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars);
  // Hebrew → dictionary; English → admin content text (falls back to English default).
  const text = (key: string, fallback: string, tKey: string) =>
    lang === "he" ? t(tKey) : (content.texts[key] ?? fallback);
  const email = content.texts["contact.email"] ?? "aaart2025@gmail.com";

  return (
    <footer className="border-t border-ink/15 px-5 pb-8 pt-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* three equal columns so the colophon logo sits dead-centre on the
            page, aligned with the masthead wordmark above it */}
        <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-3">
          {/* socials */}
          <div className="flex flex-col items-center gap-2.5 sm:items-start">
            <span className="font-typewriter text-[10px] uppercase tracking-[0.22em] text-ink/70">
              {text("footer.follow", "Follow the studio", "chrome.followStudio")}
            </span>
            <div className="flex items-center gap-3 text-ink/65">
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram" className="transition-colors hover:text-ink">
                <InstagramIcon />
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="transition-colors hover:text-ink">
                <WhatsappIcon />
              </a>
            </div>
          </div>

          {/* colophon — centred logo */}
          <div className="order-first flex flex-col items-center sm:order-none">
            <AaaLogo className="h-12 w-auto text-ink/85" />
            <span className="font-typewriter mt-1.5 text-[10px] uppercase tracking-[0.28em] text-ink/70">
              {text("footer.tagline", "Wear your art", "chrome.wearYourArt")}
            </span>
          </div>

          {/* newsletter — opens a pre-filled mail draft */}
          <form
            action={`mailto:${email}`}
            method="post"
            encType="text/plain"
            className="flex w-full max-w-[280px] flex-col items-center gap-2 justify-self-center sm:items-end sm:justify-self-end"
          >
            <label
              htmlFor="footer-email"
              className="font-typewriter text-[10px] uppercase tracking-[0.22em] text-ink/70"
            >
              {text("footer.newsletter", "Join the AAA community", "chrome.joinCommunity")}
            </label>
            <div className="flex w-full items-stretch gap-2">
              <input
                id="footer-email"
                type="email"
                name="email"
                required
                placeholder={t("chrome.emailPlaceholder")}
                className="font-typewriter w-full min-w-0 border-b border-ink/40 bg-transparent px-1 pb-1 text-[16px] tracking-[0.06em] text-ink placeholder:text-ink/70 focus:border-ink focus:outline-none sm:text-[11.5px]"
              />
              <button
                type="submit"
                className="chip-lime font-typewriter shrink-0 px-3.5 py-2.5 text-[10px] uppercase tracking-[0.16em] sm:py-1.5"
              >
                {t("chrome.subscribe")}
              </button>
            </div>
          </form>
        </div>

        {/* bottom rule */}
        <div className="mt-9 flex flex-col items-center gap-3 border-t border-ink/15 pt-4 sm:flex-row sm:justify-between">
          <p className="font-typewriter text-[10px] uppercase tracking-[0.18em] text-ink/70">
            © {new Date().getFullYear()} AAA — {text("footer.credit", "Made by Amit Amar", "chrome.madeByAmit")}
          </p>
          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            {[
              { href: "/policies/returns", label: t("chrome.footerReturns") },
              { href: "/policies/shipping", label: t("chrome.footerShipping") },
              { href: "/policies/care", label: t("chrome.footerCare") },
              { href: "/privacy", label: t("chrome.footerPrivacy") },
              { href: "/terms", label: t("chrome.footerTerms") },
              { href: "/accessibility", label: t("chrome.footerAccessibility") },
            ].map((l) => (
              <TransitionLink
                key={l.href}
                href={l.href}
                className="font-typewriter inline-flex min-h-10 items-center text-[10px] uppercase tracking-[0.2em] text-ink/70 transition-colors hover:text-ink"
              >
                {l.label}
              </TransitionLink>
            ))}
            <TransitionLink
              href="/"
              className="font-typewriter inline-flex min-h-10 items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-ink/70 transition-colors hover:text-ink"
            >
              {text("footer.backToCover", "Back to cover", "chrome.backToCover")}
              <span aria-hidden>↺</span>
            </TransitionLink>
          </nav>
        </div>
        <p className="mx-auto mt-4 max-w-2xl text-center font-typewriter text-[9.5px] leading-[1.6] tracking-[0.05em] text-ink/70">
          {t("chrome.footerDisclaimer")}
        </p>
      </div>
    </footer>
  );
}

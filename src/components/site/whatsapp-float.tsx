import { WhatsappIcon } from "@/components/paper/social-icons";
import { WHATSAPP_URL } from "@/components/paper/paper-footer";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";

/* Floating WhatsApp contact, stacked directly above the accessibility button
 * with matching chrome and size (h-12 w-12) so a chat entry point is always
 * one tap away on every page. Offset = a11y bottom + button height (3rem) +
 * 0.5rem gap. */

export async function WhatsAppFloat() {
  const lang = await getLang();
  const t = (k: string, v?: Record<string, string | number>) => translate(lang, k, v);
  return (
    <div className="fixed bottom-[calc(max(1rem,env(safe-area-inset-bottom))+3.5rem)] right-[max(1rem,env(safe-area-inset-right))] z-[70] print:hidden">
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        aria-label={t("pages.whatsapp.aria")}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/25 bg-paper text-ink shadow-[3px_4px_0_rgba(40,34,24,0.22)] transition-transform hover:-translate-y-0.5"
      >
        <WhatsappIcon className="h-6 w-6" />
      </a>
    </div>
  );
}

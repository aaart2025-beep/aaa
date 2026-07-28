import type { Metadata } from "next";
import { PaperShell } from "@/components/paper/paper-shell";
import { PaperHeader } from "@/components/paper/paper-header";
import { PaperFooter } from "@/components/paper/paper-footer";
import { TransitionLink } from "@/components/transition/page-transition";
import { ClearCart } from "@/components/checkout/clear-cart";
import { OrderRefBadge } from "@/components/checkout/order-ref";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order received — AAA" };

export default async function CheckoutSuccessPage() {
  const lang = await getLang();
  const t = (k: string, v?: Record<string, string | number>) => translate(lang, k, v);
  return (
    <PaperShell>
      <PaperHeader />
      <ClearCart />
      <div className="mx-auto flex w-full max-w-[620px] flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <p className="font-typewriter text-[10px] uppercase tracking-[0.3em] text-ink/70">{t("pages.success.eyebrow")}</p>
        <h1 className="font-archivo text-[clamp(2rem,7vw,3.4rem)] font-extrabold uppercase leading-none tracking-tight text-ink">
          {t("checkout.thankYou")}
        </h1>
        <OrderRefBadge />
        <p className="font-typewriter max-w-md text-[11px] leading-[1.9] tracking-[0.04em] text-ink/65">
          {t("checkout.successBody")}
        </p>
        <TransitionLink
          href="/shop"
          className="chip-lime font-archivo mt-2 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.16em]"
        >
          {t("checkout.continue")}
        </TransitionLink>
      </div>
      <PaperFooter />
    </PaperShell>
  );
}

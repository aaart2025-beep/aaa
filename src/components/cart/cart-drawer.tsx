"use client";

import * as React from "react";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart, cartCount, cartSubtotal } from "@/lib/cart/store";
import { formatPrice } from "@/lib/products";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useTransitionNav } from "@/components/transition/page-transition";

/* Slide-out bag, mounted once globally. Lists lines with qty steppers + a
 * subtotal. Checkout is the interim "email this order" (works today); the
 * Stripe Checkout handler swaps in here once wired. */
export function CartDrawer() {
  const items = useCart((s) => s.items);
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const nav = useTransitionNav();
  const router = useRouter();
  const t = useT();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // close on Escape; lock body scroll while open
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, close]);

  const count = mounted ? cartCount(items) : 0;
  const subtotal = mounted ? cartSubtotal(items) : 0;

  const goCheckout = () => {
    close();
    if (nav) nav.navigate("/checkout");
    else router.push("/checkout");
  };

  return (
    <>
      {/* backdrop */}
      <div
        aria-hidden
        onClick={close}
        className={cn(
          "fixed inset-0 z-[60] bg-ink/35 backdrop-blur-[1px] transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      {/* panel */}
      <aside
        role="dialog"
        aria-label={t("chrome.yourBag")}
        aria-hidden={!isOpen}
        className={cn(
          "book-theme bg-grid-paper fixed right-0 top-0 z-[61] flex h-full w-[min(420px,92vw)] flex-col bg-paper shadow-[-18px_0_50px_oklch(0.21_0.004_60/0.28)] transition-transform duration-[360ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-ink/15 px-5 py-4">
          <h2 className="font-archivo text-[15px] font-extrabold uppercase tracking-tight text-ink">
            {t("chrome.yourBag")} {mounted && count > 0 && <span className="text-ink/70">· {count}</span>}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label={t("chrome.closeBag")}
            className="-mr-2.5 flex h-11 w-11 items-center justify-center text-ink/70 transition-colors hover:text-ink"
          >
            <X className="h-5 w-5" strokeWidth={1.6} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {!mounted || items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <span className="font-script text-[22px] text-ink/70">{t("chrome.bagEmpty")}</span>
              <span className="font-typewriter text-[9px] uppercase tracking-[0.18em] text-ink/70">{t("chrome.bagEmptyHint")}</span>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((i) => (
                <li key={`${i.slug}:${i.variant ?? ""}`} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-ink/15 bg-paper-dark/30">
                    {i.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.image} alt="" className="h-full w-full object-contain p-1" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-archivo truncate text-[11px] font-bold uppercase tracking-tight text-ink">{i.name}</span>
                      <button
                        type="button"
                        onClick={() => remove(i.slug, i.variant)}
                        aria-label={t("chrome.removeItem", { name: i.name })}
                        className="-mr-2 -mt-2 flex h-10 w-10 shrink-0 items-center justify-center text-ink/70 transition-colors hover:text-ink"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {i.variant && <span className="font-typewriter text-[9.5px] uppercase tracking-[0.14em] text-ink/70">{i.variant}</span>}
                    <div className="mt-auto flex items-center justify-between pt-1.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQty(i.slug, i.qty - 1, i.variant)}
                          aria-label={t("chrome.decreaseQty")}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/25 text-ink/70 transition-colors hover:border-ink hover:text-ink sm:h-8 sm:w-8"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-typewriter w-6 text-center text-[12px] text-ink">{i.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(i.slug, i.qty + 1, i.variant)}
                          aria-label={t("chrome.increaseQty")}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/25 text-ink/70 transition-colors hover:border-ink hover:text-ink sm:h-8 sm:w-8"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-typewriter text-[12px] text-ink">{formatPrice(i.price * i.qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {mounted && items.length > 0 && (
          <footer className="shrink-0 border-t border-ink/15 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex items-baseline justify-between">
              <span className="font-typewriter text-[10px] uppercase tracking-[0.2em] text-ink/70">{t("chrome.subtotal")}</span>
              <span className="font-archivo text-[18px] font-extrabold text-ink">{formatPrice(subtotal)}</span>
            </div>
            <button
              type="button"
              onClick={goCheckout}
              className="chip-lime font-archivo mt-3 w-full px-5 py-3 text-center text-[12px] font-bold uppercase tracking-[0.18em]"
            >
              {t("chrome.checkout")}
            </button>
            <p className="font-typewriter mt-2 text-center text-[9px] uppercase tracking-[0.14em] text-ink/70">
              {t("chrome.reviewNext")}
            </p>
          </footer>
        )}
      </aside>
    </>
  );
}

"use client";

import * as React from "react";
import { ShoppingBag } from "lucide-react";
import { useCart, cartCount } from "@/lib/cart/store";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

/* Header bag with a live item count. Count renders 0 until mount to avoid a
 * hydration mismatch (the cart lives in localStorage, client-only). */
export function CartButton({ className }: { className?: string }) {
  const items = useCart((s) => s.items);
  const open = useCart((s) => s.open);
  const t = useT();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const count = mounted ? cartCount(items) : 0;

  return (
    <button
      type="button"
      onClick={open}
      aria-label={t("chrome.openBag", { count, itemWord: count === 1 ? t("chrome.item") : t("chrome.items") })}
      className={cn("relative flex h-11 w-11 items-center justify-center transition-colors hover:text-ink", className)}
    >
      <ShoppingBag className="h-[17px] w-[17px]" strokeWidth={1.6} />
      <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-lime text-[9px] font-semibold text-ink">
        {count}
      </span>
    </button>
  );
}

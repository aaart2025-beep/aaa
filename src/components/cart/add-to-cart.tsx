"use client";

import { useCart } from "@/lib/cart/store";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

/* Adds a product line and pops the bag open. Variant is optional (e.g. a size). */
export function AddToCart({
  slug,
  name,
  price,
  image,
  variant,
  label,
  className,
}: {
  slug: string;
  name: string;
  price: number;
  image?: string;
  variant?: string;
  label?: string;
  className?: string;
}) {
  const add = useCart((s) => s.add);
  const t = useT();
  return (
    <button
      type="button"
      onClick={() => add({ slug, name, price, image, variant })}
      className={cn("chip-lime font-archivo px-7 py-3 text-[12px] font-bold uppercase tracking-[0.18em]", className)}
    >
      {label ?? t("chrome.addToBag")}
    </button>
  );
}

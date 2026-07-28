"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { useT } from "@/lib/i18n/context";

/* Shows the order reference from ?ref=… on the client, so the success page
 * stays a static server component (works on the static export build too). */
function RefBadge() {
  const t = useT();
  const ref = useSearchParams().get("ref");
  if (!ref) return null;
  return (
    <p className="font-typewriter text-[11px] uppercase tracking-[0.2em] text-ink/70">
      {t("checkout.orderRef")}:{" "}
      <span className="font-archivo border border-ink/40 px-2 py-0.5 text-[12px] font-bold tracking-[0.12em] text-ink">
        {ref}
      </span>
    </p>
  );
}

export function OrderRefBadge() {
  return (
    <React.Suspense fallback={null}>
      <RefBadge />
    </React.Suspense>
  );
}

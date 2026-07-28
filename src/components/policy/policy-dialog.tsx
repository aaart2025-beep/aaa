"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useT } from "@/lib/i18n/context";

/* A pressable button that opens a scrollable modal with policy content. Reused
 * for the product "Care & washing" button and the checkout policy links. */
export function PolicyDialog({
  triggerLabel,
  triggerClassName,
  title,
  children,
}: {
  triggerLabel: React.ReactNode;
  triggerClassName?: string;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const t = useT();

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]" aria-hidden onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="book-theme bg-grid-paper relative z-10 flex max-h-[85vh] w-full max-w-[640px] flex-col bg-paper shadow-[0_22px_64px_oklch(0.21_0.004_60/0.38)]"
          >
            <header className="flex shrink-0 items-center justify-between border-b border-ink/15 px-5 py-4">
              <h2 className="font-archivo pr-4 text-[13px] font-extrabold uppercase tracking-tight text-ink">{title}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label={t("policies.close")} className="shrink-0 text-ink/70 transition-colors hover:text-ink">
                <X className="h-5 w-5" strokeWidth={1.6} />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
          </div>
        </div>
      )}
    </>
  );
}

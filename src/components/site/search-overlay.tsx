"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { searchProducts, formatPrice, priceInfo } from "@/lib/products";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

/* Site search. The magnifier icon opens a paper overlay with a single input;
 * results appear live as you type (name / category / description / keywords),
 * ranked so name matches lead. Enter jumps to the first result. Escape or the
 * backdrop closes it, and pressing "/" anywhere on the page opens it. Pure
 * client component — the catalog is a static array, so no network round-trip. */

export function SearchOverlay({
  className,
  iconClassName,
  strokeWidth = 1.6,
  label = "Search",
}: {
  className?: string;
  iconClassName?: string;
  strokeWidth?: number;
  label?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const t = useT();

  const results = React.useMemo(() => searchProducts(query, 8), [query]);

  const close = React.useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  // "/" opens search from anywhere (unless already typing in a field).
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (e.key === "/" && !typing && !open) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // While open: focus the field, lock body scroll, Escape closes.
  React.useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      window.location.href = `/shop/${results[0].slug}`;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        className={cn("transition-colors hover:text-ink", className)}
      >
        <Search className={cn("h-[17px] w-[17px]", iconClassName)} strokeWidth={strokeWidth} />
      </button>

      {/* overlay */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-[90] flex justify-center transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        {/* backdrop */}
        <button
          aria-hidden
          tabIndex={-1}
          onClick={close}
          className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-[2px]"
        />

        {/* paper panel */}
        <div
          className={cn(
            "book-theme bg-grid-paper relative mx-4 mt-[max(4.5rem,env(safe-area-inset-top))] h-fit w-full max-w-2xl bg-paper shadow-[0_24px_60px_oklch(0.21_0.004_60/0.35)] transition-transform duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
            open ? "translate-y-0" : "-translate-y-4",
          )}
        >
          <form onSubmit={onSubmit} className="flex items-center gap-3 border-b border-ink/20 px-5 py-4">
            <Search className="h-5 w-5 shrink-0 text-ink/60" strokeWidth={1.6} />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("chrome.searchPlaceholder")}
              aria-label={t("chrome.searchPlaceholder")}
              className="font-typewriter w-full bg-transparent text-[16px] font-bold tracking-[0.02em] text-ink placeholder:font-normal placeholder:text-ink/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={close}
              aria-label="Close search"
              className="font-typewriter shrink-0 text-[16px] leading-none text-ink/60 transition-colors hover:text-ink"
            >
              ✕
            </button>
          </form>

          {query.trim() !== "" && (
            <div className="max-h-[min(60vh,28rem)] overflow-y-auto">
              {results.length === 0 ? (
                <p className="font-typewriter px-5 py-6 text-[12px] uppercase tracking-[0.12em] text-ink/60">
                  {t("chrome.searchNoResults", { q: query.trim() })}
                </p>
              ) : (
                <ul className="flex flex-col py-1">
                  {results.map((p) => {
                    const info = priceInfo(p);
                    return (
                      <li key={p.slug}>
                        <Link
                          href={`/shop/${p.slug}`}
                          onClick={close}
                          className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-ink/[0.06]"
                        >
                          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border border-ink/15 bg-paper-dark/30">
                            {p.images?.[0] && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.images[0]} alt="" className="h-full w-full object-contain p-1" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="font-archivo block truncate text-[12.5px] font-bold uppercase tracking-tight text-ink">
                              {p.name}
                            </span>
                            <span className="font-typewriter block text-[10px] uppercase tracking-[0.14em] text-ink/60">
                              {p.category}
                            </span>
                          </span>
                          <span className="font-typewriter shrink-0 text-[12px] font-bold text-ink">
                            {formatPrice(info.price)}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          <div className="border-t border-ink/15 px-5 py-2">
            <p className="font-typewriter text-[9px] uppercase tracking-[0.16em] text-ink/50">
              {t("chrome.searchHint")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

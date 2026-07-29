"use client"

import Link from "next/link"
import { User } from "lucide-react"
import { CartButton } from "@/components/cart/cart-button"
import { SearchOverlay } from "@/components/site/search-overlay"
import { AaaLogo } from "./aaa-logo"
import { cn } from "@/lib/utils"
import { useLang } from "@/lib/i18n/context"

export interface NavLink {
  label: string
  href: string
}

/** Map a nav href to its translation key so the home header localises without
 * threading keys through the book experience. */
const HREF_KEY: Record<string, string> = {
  "/": "home",
  "/shop": "shop",
  "/collection": "collections",
  "/create": "create",
  "/about": "about",
  "/contact": "contact",
}

export function SiteHeader({
  visible,
  items,
}: {
  visible: boolean
  /** Visible nav items (order & on/off come from the shared nav module). */
  items?: NavLink[]
}) {
  const { lang, t } = useLang()
  const HOME: NavLink = { label: t("chrome.nav.home"), href: "/" }
  const localize = (item: NavLink): NavLink => {
    const key = HREF_KEY[item.href]
    return lang === "he" && key ? { ...item, label: t(`chrome.nav.${key}`) } : item
  }

  const nav: NavLink[] = [HOME, ...(items ?? []).map(localize)]
  const half = Math.ceil(nav.length / 2)
  const left = nav.slice(0, half)
  const right = nav.slice(half)

  return (
    <header
      aria-hidden={!visible}
      className={cn(
        "z-30 w-full shrink-0 px-4 pt-3 transition-all duration-700 sm:px-8",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-6 opacity-0",
      )}
    >
      {/* decorative top rule */}
      <div className="mx-auto flex max-w-6xl items-center gap-3 text-ink/70">
        <span className="h-px flex-1 bg-ink/20" />
        <span className="text-tracked text-[10px] uppercase">{t("chrome.estHandmade")}</span>
        <span className="h-px flex-1 bg-ink/20" />
      </div>

      <div className="mx-auto mt-2 flex max-w-6xl items-center justify-between gap-4">
        {/* left: nav */}
        <nav className="hidden flex-1 items-center gap-5 md:flex">
          {left.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-tracked text-[11px] uppercase text-ink/70 transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* center: wordmark → home */}
        <Link href="/" className="flex flex-1 flex-col items-center justify-center md:flex-none">
          <AaaLogo className="h-10 w-auto" />
          <span className="mt-1 font-display text-[13px] italic tracking-[0.35em] text-ink/70">
            amit_amar_art
          </span>
        </Link>

        {/* right: nav + icons */}
        <div className="flex flex-1 items-center justify-end gap-5">
          <nav className="hidden items-center gap-5 md:flex">
            {right.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-tracked text-[11px] uppercase text-ink/70 transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-ink/70">
            <SearchOverlay className="text-ink/70" iconClassName="h-[18px] w-[18px]" label={t("chrome.search")} />
            <Link href="/login" aria-label={t("chrome.account")} className="transition-colors hover:text-ink">
              <User className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </Link>
            <CartButton className="text-ink/70" />
          </div>
        </div>
      </div>
    </header>
  )
}

"use client"

import { Upload } from "lucide-react"
import { AaaLogo } from "./aaa-logo"
import { ProductCard } from "./product-card"
import { SpecSheet } from "./spec-sheet"
import { Typewriter } from "./typewriter"
import { cn } from "@/lib/utils"
import { useT } from "@/lib/i18n/context"
import type { Product, Section } from "@/lib/book-data"

/* ---------- shared page shell ---------- */
export function Sheet({
  children,
  grid,
  side,
  className,
}: {
  children: React.ReactNode
  grid?: boolean
  /** which edge sits against the spine */
  side?: "left" | "right"
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden",
        grid ? "bg-grid-paper" : "bg-paper-grain",
        className,
      )}
    >
      {children}
    </div>
  )
}

/* ---------- CLOSED COVER ---------- */
export function CoverFace({ onEnter }: { onEnter?: () => void }) {
  const t = useT()
  return (
    <div className="bg-cover-cloth relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-8 py-12 text-center sm:px-10 sm:py-14">
      {/* soft canvas vignette + sheen */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow:
            "inset 0 0 70px oklch(0.21 0.004 60 / 0.12), inset 0 2px 0 oklch(1 0 0 / 0.35)",
        }}
        aria-hidden="true"
      />
      {/* darker bound spine edge on the left */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-3"
        style={{
          background:
            "linear-gradient(to right, oklch(0.21 0.004 60 / 0.16), oklch(0.21 0.004 60 / 0))",
        }}
        aria-hidden="true"
      />

      <div className="flex w-full items-start justify-between font-display text-xl text-ink/85 sm:text-2xl">
        <span>Hand_</span>
        <span>_Made</span>
      </div>

      <div className="flex flex-col items-center">
        <AaaLogo className="h-28 w-auto sm:h-32" strokeWidth={2} />
        <div className="mt-14 text-tracked text-[10px] uppercase text-ink/70">{t("shop.madeBy")}</div>
        <div className="mt-2 text-tracked text-sm uppercase text-ink/85">Amit_Amar_Art</div>
      </div>

      {onEnter ? (
        <button
          onClick={onEnter}
          className="group flex flex-col items-center gap-1.5 text-tracked text-xs uppercase text-ink/75 transition-colors hover:text-ink"
        >
          {t("shop.enter")}
          <svg width="20" height="12" viewBox="0 0 20 12" fill="none" className="animate-bounce">
            <path d="M2 2 L10 9 L18 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <div className="h-6" aria-hidden="true" />
      )}
    </div>
  )
}

/* ---------- ABOUT (intro, left) ---------- */
export function AboutPage({ active = false }: { active?: boolean }) {
  const t = useT()
  return (
    <Sheet side="left" className="justify-center px-9 py-12 sm:px-11">
      <AaaLogo className="mb-8 h-10 w-auto opacity-70" />
      <p className="text-tracked text-[10px] uppercase text-ink/70">{t("shop.estHandMade")}</p>
      <h1 className="mt-3 font-display text-[2.4rem] leading-[1.05] text-ink">
        <Typewriter as="span" active={active} text={t("shop.aboutHeadline1")} speed={42} caret={false} className="block" />
        <span className="relative inline-block">
          <Typewriter as="span" active={active} text={t("shop.aboutHeadline2")} speed={42} startDelay={760} className="block" />
          <span className="absolute -bottom-1 left-0 h-[6px] w-full bg-lime/80" />
        </span>
      </h1>
      <p className="mt-6 max-w-[22rem] text-pretty text-sm leading-relaxed text-ink/70">
        {t("shop.aboutPara1")}
      </p>
      <p className="mt-4 max-w-[22rem] text-pretty text-sm leading-relaxed text-ink/70">
        {t("shop.aboutPara2")}
      </p>
      <div className="mt-8 flex items-center gap-3 text-tracked text-[10px] uppercase text-ink/70">
        <span className="h-px w-10 bg-ink/30" />
        {t("shop.theAtelier")}
      </div>
    </Sheet>
  )
}

/* ---------- NAVIGATOR / CONTENTS (intro, right) ---------- */
export function NavigatorPage({
  sections,
  onGoTo,
}: {
  sections: Section[]
  onGoTo: (sectionId: string) => void
}) {
  const t = useT()
  return (
    <Sheet side="right" className="justify-center overflow-hidden px-8 py-8 sm:px-10">
      <p className="text-tracked text-[10px] uppercase text-ink/70">{t("shop.contents")}</p>
      <h2 className="mt-1 font-display text-2xl text-ink">{t("shop.theCollections")}</h2>
      <ul className="mt-4 flex flex-col">
        {sections.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onGoTo(s.id)}
              className="group flex w-full items-baseline gap-3 border-b border-ink/12 py-2 text-left outline-none focus-visible:bg-lime/20"
            >
              <span className="text-tracked text-[10px] text-ink/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1">
                <span className="block font-display text-base text-ink transition-colors group-hover:text-ink/70">
                  {s.label}
                </span>
                <span className="text-[10px] leading-snug text-ink/70">{s.blurb}</span>
              </span>
              <span
                aria-hidden="true"
                className="text-ink/70 transition-transform group-hover:translate-x-1"
              >
                {"\u2192"}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}

/* ---------- SECTION TITLE (left) ---------- */
export function SectionTitlePage({ section, index }: { section: Section; index: number }) {
  const t = useT()
  return (
    <Sheet side="left" className="justify-between px-9 py-12 sm:px-11">
      <div className="text-tracked text-[10px] uppercase text-ink/70">
        {t("shop.collectionNo", { n: String(index + 1).padStart(2, "0") })}
      </div>

      <div>
        <h2 className="text-balance font-display text-[2.7rem] leading-[1.02] text-ink">
          {section.label}
        </h2>
        <span className="mt-4 block h-[6px] w-20 bg-lime/80" />
        <p className="mt-6 max-w-[20rem] text-pretty text-sm leading-relaxed text-ink/70">
          {section.blurb}.
        </p>
      </div>

      <div className="flex items-center gap-3 text-tracked text-[10px] uppercase text-ink/70">
        <AaaLogo className="h-6 w-auto opacity-60" />
        {t("shop.handMade")}
      </div>
    </Sheet>
  )
}

/* ---------- PRODUCT GRID (right) — pinned cards on blank creamy page ---------- */
export function ProductGridPage({
  section,
  onOpenProduct,
  swingKey,
}: {
  section: Section
  onOpenProduct: (id: string) => void
  swingKey?: string | number
}) {
  const t = useT()
  const count = section.products.length
  return (
    <Sheet side="right" className="overflow-hidden p-6">
      <p className="text-tracked text-[10px] uppercase text-ink/70">
        {count === 1 ? t("shop.pieceOne") : t("shop.pieceMany", { count })}
      </p>
      <div
        className={cn(
          "grid min-h-0 flex-1 content-center gap-x-4 gap-y-6 pt-3",
          count > 2 ? "grid-cols-2" : "grid-cols-1 px-4",
        )}
      >
        {section.products.map((p, i) => (
          <ProductCard
            key={`${swingKey}-${p.id}`}
            product={p}
            onOpen={onOpenProduct}
            delay={i * 90}
            className={cn(count === 1 ? "mx-auto w-2/3" : "")}
          />
        ))}
      </div>
    </Sheet>
  )
}

/* ---------- PRODUCT PHOTO PLATE (product detail, left) ---------- */
export function ProductPhotoPage({ product }: { product: Product }) {
  return (
    <Sheet side="left" className="items-center justify-center p-8">
      <div className="animate-rise-in relative w-full max-w-[300px]">
        {/* pinned photo */}
        <div className="relative bg-paper p-4 pb-10 shadow-paper" style={{ transform: "rotate(-2deg)" }}>
          <span className="tape absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 -rotate-2" />
          <div className="flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              loading="eager"
              decoding="async"
              className="h-auto max-h-[260px] w-auto object-contain mix-blend-multiply"
            />
          </div>
          <p className="mt-3 text-center font-display text-sm italic text-ink/70">{product.name}</p>
        </div>
        <p className="mt-8 px-2 text-pretty text-center text-[12px] leading-relaxed text-ink/70">
          &ldquo;{product.description}&rdquo;
        </p>
      </div>
    </Sheet>
  )
}

/* ---------- PRODUCT SPEC (product detail, right) ---------- */
export function ProductSpecPage({
  product,
  onAddToCart,
}: {
  product: Product
  onAddToCart: (id: string) => void
}) {
  const t = useT()
  return (
    <Sheet grid side="right" className="p-7">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-tracked text-[10px] uppercase text-ink/70">{t("shop.specSheet")}</p>
        <p className="text-tracked text-[10px] uppercase text-ink/70">{product.date}</p>
      </div>
      <div className="min-h-0 flex-1">
        <SpecSheet product={product} onAddToCart={onAddToCart} />
      </div>
    </Sheet>
  )
}

/* ---------- CREATE YOUR OWN (closing spread, left) ---------- */
export function CreatePage() {
  const t = useT()
  return (
    <Sheet side="left" className="items-center justify-center p-8">
      <div className="relative flex w-full max-w-[18rem] flex-col items-center bg-paper p-7 text-center shadow-paper">
        <h3 className="font-display text-2xl text-ink">{t("shop.createOwnTitle")}</h3>
        <p className="mt-2 text-xs leading-relaxed text-ink/70">
          {t("shop.createOwnBody")}
        </p>
        <div className="mt-5 flex w-full flex-col items-center gap-2 border border-dashed border-ink/30 px-6 py-7 text-ink/70">
          <Upload className="h-6 w-6" strokeWidth={1.5} />
          <span className="text-tracked text-[10px] uppercase">{t("shop.uploadImage")}</span>
        </div>
      </div>
    </Sheet>
  )
}

/* ---------- BACK COVER ---------- */
export function BackCover() {
  return (
    <div className="bg-cover-cloth relative flex h-full w-full items-center justify-center">
      <AaaLogo className="h-16 w-auto opacity-30" />
      <div className="pointer-events-none absolute inset-3 border border-ink/15" />
    </div>
  )
}

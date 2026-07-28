"use client"

import { cn } from "@/lib/utils"
import { useT } from "@/lib/i18n/context"
import type { Product } from "@/lib/book-data"

function Paperclip({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("text-ink/70", className)}
    >
      <path
        d="M20 86 V24 a13 13 0 0 1 13 -13 a13 13 0 0 1 13 13 V70"
        transform="translate(-13 -4)"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M7 66 V24 a13 13 0 0 1 13 -13"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ProductCard({
  product,
  onOpen,
  delay = 0,
  className,
}: {
  product: Product
  onOpen?: (id: string) => void
  delay?: number
  className?: string
}) {
  const t = useT()
  const rest = product.rot ?? 0
  const pin = product.pin ?? "clip"

  return (
    <button
      type="button"
      onClick={() => onOpen?.(product.id)}
      className={cn(
        "group animate-note-swing relative flex flex-col items-center bg-paper text-left shadow-paper outline-none",
        "transition-transform duration-300 ease-out hover:-translate-y-1.5 focus-visible:-translate-y-1.5",
        "focus-visible:ring-2 focus-visible:ring-lime",
        className,
      )}
      style={
        {
          "--rest-rot": `${rest}deg`,
          animationDelay: `${delay}ms`,
        } as React.CSSProperties
      }
      aria-label={t("shop.openDetailsAria", { name: product.name })}
    >
      {/* attachment */}
      {pin === "clip" && (
        <Paperclip className="absolute -top-5 left-1/2 z-10 h-12 w-6 -translate-x-1/2 drop-shadow-sm" />
      )}
      {pin === "tape" && (
        <span className="tape absolute -top-3 left-1/2 z-10 h-6 w-16 -translate-x-1/2 -rotate-3" />
      )}
      {pin === "tape-double" && (
        <>
          <span className="tape absolute -top-3 -left-2 z-10 h-6 w-14 -rotate-12" />
          <span className="tape absolute -top-3 -right-2 z-10 h-6 w-14 rotate-12" />
        </>
      )}

      <div className="flex w-full flex-1 items-center justify-center p-2 pt-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          loading="eager"
          decoding="async"
          className="h-auto max-h-[96px] w-auto object-contain mix-blend-multiply"
        />
      </div>
      <div className="w-full px-2 pb-2.5 text-center">
        <h3 className="text-tracked text-[10px] font-medium uppercase text-ink">{product.name}</h3>
        <p className="mt-0.5 inline-flex items-center gap-1 text-[8px] uppercase tracking-[0.18em] text-ink/70">
          {t("shop.viewProduct")}
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            {"\u2192"}
          </span>
        </p>
      </div>
    </button>
  )
}

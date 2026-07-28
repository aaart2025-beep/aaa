"use client"

import { useT } from "@/lib/i18n/context"
import type { Product } from "@/lib/book-data"

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/15 py-1.5">
      <dt className="text-tracked text-[10px] uppercase text-ink/70">{label}</dt>
      <dd className="text-right text-[12px] font-medium text-ink">{value}</dd>
    </div>
  )
}

export function SpecSheet({
  product,
  onAddToCart,
}: {
  product: Product
  onAddToCart?: (id: string) => void
}) {
  const t = useT()
  return (
    <div className="animate-rise-in flex h-full flex-col gap-3">
      {/* photo plate */}
      <div className="relative flex h-[150px] shrink-0 items-center justify-center rounded-sm border border-ink/15 bg-paper/60 p-3">
        <span className="absolute left-3 top-3 text-tracked text-[9px] uppercase text-ink/70">
          {t("shop.fig01")}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          loading="eager"
          decoding="async"
          className="h-full w-auto object-contain mix-blend-multiply"
        />
      </div>

      {/* specs */}
      <dl className="flex flex-1 flex-col justify-center">
        <Row label={t("shop.fieldGarment")} value={product.garment} />
        <Row label={t("shop.fieldFit")} value={product.fit} />
        <Row label={t("shop.fieldSizes")} value={product.sizes} />
        <Row label={t("shop.fieldFabric")} value={product.fabric} />
        <Row label={t("shop.fieldPrint")} value={product.print} />
        <div className="flex items-center justify-between gap-4 border-b border-ink/15 py-1.5">
          <dt className="text-tracked text-[10px] uppercase text-ink/70">{t("shop.fieldColors")}</dt>
          <dd className="flex items-center gap-1.5">
            {product.colors.map((c) => (
              <span
                key={c}
                className="h-4 w-4 rounded-full border border-ink/20"
                style={{ backgroundColor: c }}
                aria-hidden="true"
              />
            ))}
          </dd>
        </div>
        <p className="mt-2 line-clamp-2 text-pretty text-[12px] leading-relaxed text-ink/70">
          {product.description}
        </p>
      </dl>

      {/* add to cart */}
      <button
        type="button"
        onClick={() => onAddToCart?.(product.id)}
        className="group mt-1 flex shrink-0 items-center justify-center gap-2 rounded-sm bg-ink py-3 text-tracked text-[11px] uppercase text-paper transition-colors hover:bg-ink/85"
      >
        {t("shop.addToCart")}
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
          {"\u2192"}
        </span>
      </button>
    </div>
  )
}

import { cn } from "@/lib/utils"

/**
 * The AAA brand mark — three brush-stroke "A" peaks with the line running
 * through them and the © tail. Ink on transparent, so it sits on the cream
 * paper surfaces (header, footer, book cover). Sized by height via className.
 */
export function AaaLogo({
  className,
}: {
  className?: string
  /** kept for call-site compatibility; the real mark has no stroke width. */
  strokeWidth?: number
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo-aaa-ink.png"
      alt="AAA"
      width={1582}
      height={714}
      draggable={false}
      className={cn("w-auto select-none", className)}
    />
  )
}

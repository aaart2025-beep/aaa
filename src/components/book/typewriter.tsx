"use client"

import { createElement, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Types out its text character-by-character whenever `active` flips to true.
 * Re-runs every time the page becomes the visible spread, so flipping back and
 * forth re-triggers the effect. Respects prefers-reduced-motion.
 */
export function Typewriter({
  text,
  active,
  speed = 38,
  startDelay = 220,
  className,
  caret = true,
  as: Tag = "span",
}: {
  text: string
  active: boolean
  speed?: number
  startDelay?: number
  className?: string
  caret?: boolean
  as?: React.ElementType
}) {
  const [shown, setShown] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []

    if (!active) {
      setShown(0)
      return
    }

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      setShown(text.length)
      return
    }

    setShown(0)
    for (let i = 1; i <= text.length; i++) {
      timers.current.push(setTimeout(() => setShown(i), startDelay + i * speed))
    }
    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [active, text, speed, startDelay])

  const done = shown >= text.length

  // Rendered via createElement so the polymorphic `as` tag type-checks even with
  // @react-three/fiber's global JSX augmentation in the project.
  return createElement(
    Tag,
    { className: cn("whitespace-pre-wrap", className), "aria-label": text },
    <span key="t" aria-hidden="true">
      {text.slice(0, shown)}
    </span>,
    caret ? (
      <span
        key="c"
        className={cn(
          "ml-[1px] inline-block w-[1px] -translate-y-[2px] self-center bg-current align-middle",
          "h-[0.9em]",
          done ? "animate-pulse opacity-0" : "opacity-70",
        )}
        style={!done ? { animation: "aaa-caret 0.7s steps(1) infinite" } : undefined}
        aria-hidden="true"
      />
    ) : null,
  )
}

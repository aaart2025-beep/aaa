"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, List, X } from "lucide-react"
import { SiteHeader, type NavLink } from "./site-header"
import {
  CoverFace,
  AboutPage,
  NavigatorPage,
  SectionTitlePage,
  ProductGridPage,
  ProductPhotoPage,
  ProductSpecPage,
  CreatePage,
  BackCover,
} from "./book-pages"
import { SECTIONS, findProduct } from "@/lib/book-data"
import { cn } from "@/lib/utils"
import { useT } from "@/lib/i18n/context"

type Spread =
  | { kind: "intro" }
  | { kind: "section"; index: number }
  | { kind: "outro" }

type Phase = "closed" | "opening" | "open"
type TurnDir = "next" | "prev"

const TURN_MS = 900

export function BookExperience({ navItems }: { navItems?: NavLink[] } = {}) {
  const t = useT()
  const spreads = useMemo<Spread[]>(
    () => [
      { kind: "intro" },
      ...SECTIONS.map((_, index) => ({ kind: "section", index }) as Spread),
      { kind: "outro" },
    ],
    [],
  )

  const [phase, setPhase] = useState<Phase>("closed")
  const [cur, setCur] = useState(0)
  const [turn, setTurn] = useState<{ dir: TurnDir; to: number } | null>(null)
  const [flip, setFlip] = useState(false)
  const [openProduct, setOpenProduct] = useState<string | null>(null)
  const [showContents, setShowContents] = useState(false)
  const [cart, setCart] = useState<string[]>([])
  const [introTyped, setIntroTyped] = useState(false)
  const [peek, setPeek] = useState<TurnDir | null>(null)
  const [portrait, setPortrait] = useState(false)
  const [rotateHintDismissed, setRotateHintDismissed] = useState(false)

  // phones in portrait see a ~half-width spread — offer the rotate hint once
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait) and (max-width: 767px)")
    const update = () => setPortrait(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const isAnimating = turn !== null

  // Warm the image cache up-front so photos never pop/flicker during a page turn.
  useEffect(() => {
    for (const section of SECTIONS) {
      for (const p of section.products) {
        const img = new window.Image()
        img.src = p.image
      }
    }
  }, [])

  /* ---------- spread renderers ---------- */
  const renderLeft = useCallback(
    (s: Spread) => {
      if (s.kind === "intro") return <AboutPage active={phase === "open" && introTyped} />
      if (s.kind === "outro") return <CreatePage />
      return <SectionTitlePage section={SECTIONS[s.index]} index={s.index} />
    },
    [phase, introTyped],
  )

  const renderRight = useCallback(
    (s: Spread) => {
      if (s.kind === "intro")
        return (
          <NavigatorPage
            sections={SECTIONS}
            onGoTo={(id) => {
              const idx = SECTIONS.findIndex((sec) => sec.id === id)
              if (idx >= 0) jumpTo(idx + 1)
            }}
          />
        )
      if (s.kind === "outro") return <BackCover />
      return (
        <ProductGridPage
          section={SECTIONS[s.index]}
          swingKey={s.index}
          onOpenProduct={(pid) => setOpenProduct(pid)}
        />
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  /* ---------- navigation ---------- */
  const startTurn = useCallback(
    (dir: TurnDir, to: number) => {
      if (isAnimating || to < 0 || to >= spreads.length) return
      setFlip(false)
      setTurn({ dir, to })
    },
    [isAnimating, spreads.length],
  )

  const next = useCallback(() => startTurn("next", cur + 1), [cur, startTurn])
  const prev = useCallback(() => startTurn("prev", cur - 1), [cur, startTurn])

  const jumpTo = useCallback(
    (to: number) => {
      setShowContents(false)
      if (to === cur || isAnimating) {
        setCur(to)
        return
      }
      startTurn(to > cur ? "next" : "prev", to)
    },
    [cur, isAnimating, startTurn],
  )

  // timers/rafs created from handlers — tracked so unmount can cancel them
  const openTimerRef = useRef(0)
  const leafRafRef = useRef(0)
  useEffect(
    () => () => {
      window.clearTimeout(openTimerRef.current)
      cancelAnimationFrame(leafRafRef.current)
    },
    [],
  )

  // when a leaf finishes turning, commit the new spread
  function onLeafDone() {
    if (!turn) return
    // Commit the new spread UNDERNEATH the still-landed leaf, then remove the leaf
    // one frame later. This guarantees the underlying pages already show the target
    // content before the leaf unmounts — no left/right flash at the page switch.
    setCur(turn.to)
    leafRafRef.current = requestAnimationFrame(() => {
      setTurn(null)
      setFlip(false)
    })
  }

  function openBook() {
    if (phase !== "closed") return
    setPhase("opening")
    openTimerRef.current = window.setTimeout(() => setPhase("open"), 950)
  }

  // trigger the leaf rotation on the frame after it mounts so the transition runs
  useEffect(() => {
    if (turn && !flip) {
      let id2 = 0
      const id1 = requestAnimationFrame(() => {
        id2 = requestAnimationFrame(() => setFlip(true))
      })
      return () => {
        cancelAnimationFrame(id1)
        cancelAnimationFrame(id2)
      }
    }
  }, [turn, flip])

  // safety: if transitionend doesn't fire, commit after the animation window
  useEffect(() => {
    if (!turn) return
    const id = window.setTimeout(onLeafDone, TURN_MS + 250)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn])

  // kick off the intro typewriter once the book is open
  useEffect(() => {
    if (phase === "open") {
      const id = window.setTimeout(() => setIntroTyped(true), 450)
      return () => window.clearTimeout(id)
    }
  }, [phase])

  // keyboard arrows
  useEffect(() => {
    if (phase !== "open") return
    function onKey(e: KeyboardEvent) {
      if (openProduct) {
        if (e.key === "Escape") setOpenProduct(null)
        return
      }
      if (e.key === "ArrowRight") next()
      if (e.key === "ArrowLeft") prev()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [phase, next, prev, openProduct])

  // scroll / swipe to turn pages (left-right wheel, trackpad swipe, or touch)
  const navLock = useRef(false)
  useEffect(() => {
    if (phase !== "open") return
    let acc = 0
    let resetId: number | undefined
    let lockId = 0

    const trigger = (dir: TurnDir) => {
      if (navLock.current) return
      navLock.current = true
      if (dir === "next") next()
      else prev()
      lockId = window.setTimeout(() => {
        navLock.current = false
      }, TURN_MS + 120)
    }

    const onWheel = (e: WheelEvent) => {
      if (openProduct) return // let the product spread scroll if needed
      const d = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (Math.abs(d) < 1) return
      e.preventDefault()
      if (navLock.current) {
        acc = 0
        return
      }
      acc += d
      if (resetId) window.clearTimeout(resetId)
      resetId = window.setTimeout(() => {
        acc = 0
      }, 180)
      if (acc > 50) {
        acc = 0
        trigger("next")
      } else if (acc < -50) {
        acc = 0
        trigger("prev")
      }
    }

    let sx = 0
    let sy = 0
    const onTouchStart = (e: TouchEvent) => {
      sx = e.touches[0].clientX
      sy = e.touches[0].clientY
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (openProduct) return
      const touch = e.changedTouches[0]
      const dx = touch.clientX - sx
      const dy = touch.clientY - sy
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        trigger(dx < 0 ? "next" : "prev") // swipe left → next, right → prev
      }
    }

    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchend", onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchend", onTouchEnd)
      if (resetId) window.clearTimeout(resetId)
      window.clearTimeout(lockId)
      navLock.current = false
    }
  }, [phase, openProduct, next, prev])

  const product = openProduct ? findProduct(openProduct) : undefined
  const curSpread = spreads[cur]
  const targetSpread = turn ? spreads[turn.to] : null

  return (
    <main className="relative flex h-[100dvh] flex-col overflow-hidden bg-background">
      <SiteHeader visible={phase === "open"} items={navItems} />

      {/* portrait phones: the spread is tiny — invite a rotation, dismissible */}
      {phase === "open" && portrait && !rotateHintDismissed && (
        <button
          type="button"
          onClick={() => setRotateHintDismissed(true)}
          className="shadow-paper absolute left-1/2 top-[max(4.25rem,calc(env(safe-area-inset-top)+3.5rem))] z-50 -translate-x-1/2 rotate-[-1.2deg] whitespace-nowrap border border-ink/25 bg-paper px-4 py-2"
          aria-label={t("home.rotateHintDismiss")}
        >
          <span className="font-script text-[16px] text-ink/75">{t("home.rotateHint")}</span>
        </button>
      )}

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 pb-4 pt-1">
        {/* ---------- OPEN BOOK (always mounted; cover overlays until opened) ---------- */}
        <div className="relative" style={{ perspective: "2600px" }}>
          <div
            className={cn(
              "relative flex aspect-[3/2] w-[min(96vw,860px)] max-h-[82dvh] transition-transform duration-[850ms] ease-in-out",
              phase === "open" && "book-shadow",
            )}
            style={{
              transform: phase === "closed" ? "translateX(-25%)" : "translateX(0)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* page thickness blocks behind the spread (stacked page edges) — only once open */}
            {phase === "open" && (
              <>
                <div className="book-edges-left absolute -left-2.5 bottom-1.5 top-1.5 w-3 rounded-l-sm" aria-hidden="true" />
                <div className="book-edges-right absolute -right-2.5 bottom-1.5 top-1.5 w-3 rounded-r-sm" aria-hidden="true" />
                <div className="book-edges-left absolute -left-1.5 bottom-0.5 top-0.5 w-2 rounded-l-sm" aria-hidden="true" />
                <div className="book-edges-right absolute -right-1.5 bottom-0.5 top-0.5 w-2 rounded-r-sm" aria-hidden="true" />
              </>
            )}

            {/* static current spread — left page revealed once the cover finishes opening */}
            <div
              className={cn(
                "relative isolate h-full w-1/2 overflow-hidden rounded-l-sm",
                phase === "open" ? "opacity-100" : "opacity-0",
              )}
            >
              {renderLeft(curSpread)}
            </div>
            <div className="relative isolate h-full w-1/2 overflow-hidden rounded-r-sm">
              {/* while turning forward, reveal the destination right page underneath */}
              {renderRight(turn?.dir === "next" && targetSpread ? targetSpread : curSpread)}
            </div>
            {/* while turning backward, reveal the destination left page underneath */}
            {turn?.dir === "prev" && targetSpread && (
              <div className="absolute left-0 top-0 isolate h-full w-1/2 overflow-hidden rounded-l-sm">
                {renderLeft(targetSpread)}
              </div>
            )}

            {/* ---------- TURNING LEAF ---------- */}
            {turn && targetSpread && (
              <div
                className={cn(
                  "leaf absolute top-0 h-full w-1/2",
                  turn.dir === "next" ? "left-1/2 origin-left" : "left-0 origin-right",
                )}
                style={{
                  transform: flip
                    ? turn.dir === "next"
                      ? "rotateY(-180deg)"
                      : "rotateY(180deg)"
                    : "rotateY(0deg)",
                }}
                onTransitionEnd={onLeafDone}
              >
                {turn.dir === "next" ? (
                  <>
                    <div className="leaf-front h-full w-full rounded-r-sm">
                      {renderRight(curSpread)}
                    </div>
                    <div className="leaf-back h-full w-full rounded-l-sm">
                      {renderLeft(targetSpread)}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="leaf-front h-full w-full rounded-l-sm">
                      {renderLeft(curSpread)}
                    </div>
                    <div className="leaf-back h-full w-full rounded-r-sm">
                      {renderRight(targetSpread)}
                    </div>
                  </>
                )}
                <div className="leaf-sheen pointer-events-none absolute inset-0" aria-hidden="true" />
              </div>
            )}

            {/* ---------- HINGED COVER (front cover swings open around the spine) ---------- */}
            {phase !== "open" && (
              <div
                className={cn(
                  "leaf absolute top-0 left-1/2 z-40 h-full w-1/2 origin-left",
                  phase === "closed" && "book-shadow rounded-r-sm",
                )}
                style={{
                  transform: phase === "opening" ? "rotateY(-180deg)" : "rotateY(0deg)",
                }}
              >
                <div className="leaf-front h-full w-full rounded-r-sm">
                  <CoverFace onEnter={openBook} />
                </div>
                <div className="leaf-back h-full w-full rounded-l-sm">
                  {renderLeft(curSpread)}
                </div>
                <div className="leaf-sheen pointer-events-none absolute inset-0" aria-hidden="true" />
              </div>
            )}

            {/* spine crease + page-depth vignette — only once the book is open */}
            {phase === "open" && (
              <>
                <div className="book-spine pointer-events-none absolute inset-0 z-30" aria-hidden="true" />
                <div
                  className="pointer-events-none absolute inset-0 z-30 rounded-sm"
                  style={{ boxShadow: "inset 0 0 36px oklch(0.21 0.004 60 / 0.1)" }}
                  aria-hidden="true"
                />
              </>
            )}

            {/* ---------- CORNER PEEL HOTSPOTS (hover top corners to fold the page) ---------- */}
            {phase === "open" && !openProduct && !turn && (
              <>
                {/* top-right corner → next */}
                {cur < spreads.length - 1 && (
                  <button
                    type="button"
                    aria-label={t("home.turnNextAria")}
                    onMouseEnter={() => setPeek("next")}
                    onMouseLeave={() => setPeek((p) => (p === "next" ? null : p))}
                    onClick={next}
                    className={cn(
                      "page-corner page-corner-next group absolute top-0 right-0 z-[36] h-20 w-20 cursor-pointer sm:h-24 sm:w-24",
                      peek === "next" && "is-peeking",
                    )}
                  >
                    <span className="page-corner-fold page-corner-fold-next" aria-hidden="true" />
                  </button>
                )}
                {/* top-left corner → prev */}
                {cur > 0 && (
                  <button
                    type="button"
                    aria-label={t("home.prevAria")}
                    onMouseEnter={() => setPeek("prev")}
                    onMouseLeave={() => setPeek((p) => (p === "prev" ? null : p))}
                    onClick={prev}
                    className={cn(
                      "page-corner page-corner-prev group absolute top-0 left-0 z-[36] h-20 w-20 cursor-pointer sm:h-24 sm:w-24",
                      peek === "prev" && "is-peeking",
                    )}
                  >
                    <span className="page-corner-fold page-corner-fold-prev" aria-hidden="true" />
                  </button>
                )}
              </>
            )}

            {/* ---------- PRODUCT DETAIL SPREAD ---------- */}
            {product && (
              <div className="absolute inset-0 z-40 flex rounded-sm" key={product.id}>
                <div className="relative isolate h-full w-1/2 overflow-hidden rounded-l-sm">
                  <ProductPhotoPage product={product} />
                </div>
                <div className="relative isolate h-full w-1/2 overflow-hidden rounded-r-sm">
                  <ProductSpecPage
                    product={product}
                    onAddToCart={(id) => {
                      // The book has no size picker — open the product page so a
                      // size is chosen there before adding to the cart.
                      setCart((c) => (c.includes(id) ? c : [...c, id]))
                      window.location.assign(`/shop/${id}`)
                    }}
                  />
                </div>
                <div className="book-spine pointer-events-none absolute inset-0" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => setOpenProduct(null)}
                  className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-sm bg-ink/90 px-3 py-2 text-tracked text-[10px] uppercase text-paper transition-colors hover:bg-ink"
                >
                  <X className="h-3.5 w-3.5" /> {t("home.close")}
                </button>
              </div>
            )}
          </div>

          {/* ---------- CONTROLS ---------- */}
          {phase === "open" && (
          <div className="pointer-events-none absolute inset-x-0 -bottom-12 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prev}
              disabled={cur === 0 || isAnimating || !!openProduct}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 bg-paper text-ink shadow-paper transition hover:bg-paper-dark disabled:opacity-30"
              aria-label={t("home.prevAria")}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setShowContents((v) => !v)}
              className="pointer-events-auto flex items-center gap-2 rounded-full border border-ink/20 bg-paper px-4 py-2.5 text-tracked text-[10px] uppercase text-ink shadow-paper transition hover:bg-paper-dark"
            >
              <List className="h-4 w-4" /> {t("home.contents")}
            </button>

            <button
              type="button"
              onClick={next}
              disabled={cur === spreads.length - 1 || isAnimating || !!openProduct}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 bg-paper text-ink shadow-paper transition hover:bg-paper-dark disabled:opacity-30"
              aria-label={t("home.nextAria")}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          )}
        </div>

        {/* ---------- CONTENTS DRAWER ---------- */}
        {showContents && phase === "open" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-sm rounded-sm bg-paper p-7 shadow-paper">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-ink">{t("home.contents")}</h2>
                <button
                  type="button"
                  onClick={() => setShowContents(false)}
                  className="text-ink/70 hover:text-ink"
                  aria-label={t("home.closeContents")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ul className="mt-4 flex flex-col">
                <li>
                  <button
                    type="button"
                    onClick={() => jumpTo(0)}
                    className="flex w-full items-center gap-3 border-b border-ink/12 py-2.5 text-left text-sm text-ink hover:text-ink/70"
                  >
                    <span className="text-tracked text-[10px] text-ink/70">00</span>
                    {t("home.aboutAaa")}
                  </button>
                </li>
                {SECTIONS.map((s, i) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => jumpTo(i + 1)}
                      className="flex w-full items-center gap-3 border-b border-ink/12 py-2.5 text-left text-sm text-ink hover:text-ink/70"
                    >
                      <span className="text-tracked text-[10px] text-ink/70">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <p className="pb-3 text-center text-tracked text-[10px] uppercase text-ink/70">
        {phase === "open"
          ? openProduct
            ? t("home.escToGoBack")
            : `${t("home.browsePrompt")}${cart.length ? t("home.cartCount", { count: cart.length }) : ""}`
          : t("home.openToBegin")}
      </p>
    </main>
  )
}

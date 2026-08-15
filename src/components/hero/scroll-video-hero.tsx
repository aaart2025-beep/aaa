"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TransitionLink } from "@/components/transition/page-transition";
import { registerRewind } from "@/components/transition/transition-bus";
import { GooeyText } from "@/components/ui/gooey-text-morphing";
import { HeroLoader } from "@/components/hero/hero-loader";
import { useLang } from "@/lib/i18n/context";

/* Apple-style scroll-driven frame-sequence scrubber, ported to React.
 * Frames preload and paint to a canvas; scroll position maps to a target frame
 * driven by a critically damped SmoothDamp integrator (smooth scrub, soft settle).
 * Nav + headline fade in once the sequence reaches the end. */

const FRAME_COUNT = 361;
// Desktop: landscape frames (cover). Phone: a dedicated portrait video (also 361
// frames) so it fills the screen full-bleed. Same count → identical scrub mapping.
// Bump when frame assets change — busts stale caches (esp. aggressive in-app
// browsers like WhatsApp/Instagram that ignore must-revalidate). Mobile frames
// were replaced; the version query forces a fresh fetch.
const FRAMES_VERSION = "2";
const framePath = (i: number) => `/frames/frame_${String(i).padStart(4, "0")}.webp`;
const framePathMobile = (i: number) =>
  `/frames-mobile/frame_${String(i).padStart(4, "0")}.webp?v=${FRAMES_VERSION}`;
const MOBILE_BREAKPOINT = 768;
const PX_PER_FRAME = 9;
const END_THRESHOLD = 0.99;
// How many opening frames the footage spends "materializing" out of the haze.
const ENTRANCE_FRAMES = 52;
// Under-damped spring that follows the scroll: a floaty, weighty feel that
// carries a little past where you stop and eases gently to rest (no sharp snap).
const SPRING_STIFFNESS = 15; // ω² — lower = looser, longer coast
// ζ ≈ 1.05 (slightly OVER-damped): the frame carries forward and eases to a
// slow stop but never overshoots/reverses. Low stiffness keeps the coast long.
const SPRING_DAMPING = 8.2;
const HERO_READY_KEY = "aaa-hero-ready";
// The loader holds at least this long on a first visit so the wordmark reads
// as an intentional brand beat, never a flicker.
const MIN_BEAT_MS = 450;
// rAF frames of complete stillness before the render loop parks itself.
const IDLE_FRAMES_TO_SLEEP = 30;

interface ScrollVideoHeroProps {
  /** Editable copy keyed by content id; falls back to defaults when absent. */
  texts?: Record<string, string>;
  /** The site-wide header (PaperHeader), revealed once the video ends so the
   * cover hands over to the same nav used inside the book. */
  header?: React.ReactNode;
}

export function ScrollVideoHero({ texts, header }: ScrollVideoHeroProps = {}) {
  // English keeps flowing from the admin-editable content store; Hebrew comes
  // from the `home.` dictionary so both languages render from one source.
  const { lang, t: tr } = useLang();
  const t = (key: string, fallback: string) => texts?.[key] ?? fallback;
  const wordmark = t("brand.wordmark", "AAA");
  const headlineA = lang === "he" ? tr("home.heroHeadlineA") : t("hero.headlineA", "Wearable art");
  const headlineB = lang === "he" ? tr("home.heroHeadlineB") : t("hero.headlineB", "made by hand");
  const shopCta = lang === "he" ? tr("home.heroShopCta") : t("hero.shopCta", "Enter the shop");
  const introCta = lang === "he" ? tr("home.heroIntroCta") : t("hero.introCta", "Tap to begin");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const atmosRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLSpanElement>(null);

  const [ready, setReady] = useState(false);
  const [loaderGone, setLoaderGone] = useState(false);
  const [ended, setEnded] = useState(false);
  const router = useRouter();

  // Repeat visits this session skip the loader entirely (frames come from the
  // HTTP cache). Layout effect so it flips before first paint — no flash.
  useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem(HERO_READY_KEY)) {
        setReady(true);
        setLoaderGone(true);
      }
    } catch {
      /* private mode — loader just runs normally */
    }
  }, []);

  // Warm the nav destinations the moment the hero reaches its end state, so a
  // click commits the route instantly and the glide never waits on a fetch.
  useEffect(() => {
    if (!ended) return;
    for (const href of ["/shop", "/create", "/collection", "/a-book", "/about", "/contact"]) {
      try {
        router.prefetch(href);
      } catch {
        /* best-effort */
      }
    }
  }, [ended, router]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const track = trackRef.current;
    if (!canvas || !track) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    const loadedFlags: boolean[] = new Array(FRAME_COUNT).fill(false);
    let imgW = 1280;
    let imgH = 720;
    let current = 0;
    let rawScrollY = 0;
    let smoothScroll = 0;
    let scrollVel = 0;
    const frameMax = FRAME_COUNT * PX_PER_FRAME;
    let lastDrawn = -1;
    let lastT = performance.now();
    let needsDraw = true;
    let raf = 0;
    let endedLocal = false;
    let rewinding = false;
    let lastA = -1;
    let disposed = false;
    let running = false;
    let idleFrames = 0;
    const startAtEnd = window.location.hash === "#enter";
    // Choose the frame set once, at mount, by viewport width.
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    // iPads / touch tablets report a coarse pointer (iPadOS Safari also reports as
    // "Mac" but with touch points). They must NOT load all 361 full-res frames —
    // that exhausts Safari's memory and blanks the page. Give them the phone's
    // lighter path (decimated frames, lower dpr, softer blur). The frame SET still
    // follows width, so a landscape iPad keeps the landscape cover.
    const isTouch =
      (typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches) ||
      (navigator.maxTouchPoints ?? 0) > 1;
    const lite = isMobile || isTouch;
    const frameSrc = isMobile ? framePathMobile : framePath;

    // Black intro screen holds for ~one viewport of scroll before the video scrubs.
    let introPx = 0;
    const setTrackHeight = () => {
      introPx = Math.round(window.innerHeight * 0.85);
      track.style.height = `${introPx + FRAME_COUNT * PX_PER_FRAME + window.innerHeight}px`;
    };
    const resize = () => {
      // Full native pixel density (capped at 3×) with high-quality resampling:
      // the 1080p frames render at the screen's true resolution. One drawImage
      // per frame change keeps this cheap even at retina sizes.
      const dpr = Math.min(window.devicePixelRatio || 1, lite ? 2 : 3);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.imageSmoothingQuality = "high";
      needsDraw = true;
    };
    // Pick the nearest already-loaded frame so scrubbing never stalls while the
    // sequence is still streaming in.
    const nearestLoaded = (idx: number): number => {
      if (loadedFlags[idx]) return idx;
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (idx - d >= 0 && loadedFlags[idx - d]) return idx - d;
        if (idx + d < FRAME_COUNT && loadedFlags[idx + d]) return idx + d;
      }
      return -1;
    };
    const draw = (rawIdx: number) => {
      const idx = nearestLoaded(rawIdx);
      if (idx < 0) return;
      const img = images[idx];
      if (!img) return;
      const cw = canvas.width;
      const ch = canvas.height;
      // Cover: fill the viewport (desktop landscape & phone portrait both designed to).
      const s = Math.max(cw / imgW, ch / imgH);
      const dw = imgW * s;
      const dh = imgH * s;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };
    // Scroll handler only records the raw position; ALL smoothing + DOM writes
    // happen in the rAF loop, so the black intro overlay and the video frames
    // share one buttery source (fixes the mobile "stuck" overlay).
    const updateTarget = () => {
      rawScrollY = window.scrollY;
    };
    const BLUR_MAX = lite ? 14 : 34; // full-screen blur is costly on phones/tablets

    const tick = (now: number) => {
      let dt = (now - lastT) / 1000;
      lastT = now;
      if (dt > 0.05) dt = 0.05;

      // Under-damped spring toward the live scroll position. Semi-implicit Euler
      // (stable for the clamped dt). zeta < 1 means the frame coasts a little
      // past a stop and springs gently back — momentum, not a hard snap. Substep
      // for rock-solid stability on long frames / heavy scroll flicks.
      {
        const before = smoothScroll - rawScrollY;
        const steps = dt > 0.018 ? 2 : 1;
        const h = dt / steps;
        for (let s = 0; s < steps; s++) {
          const accel =
            -SPRING_STIFFNESS * (smoothScroll - rawScrollY) - SPRING_DAMPING * scrollVel;
          scrollVel += accel * h;
          smoothScroll += scrollVel * h;
        }
        const after = smoothScroll - rawScrollY;
        // Hard guarantee: never overshoot/reverse. If we crossed the target,
        // settle exactly on it instead of bouncing back.
        const crossedTarget = before !== 0 && Math.sign(before) !== Math.sign(after);
        if (crossedTarget) {
          smoothScroll = rawScrollY;
          scrollVel = 0;
        } else if (Math.abs(after) < 0.12 && Math.abs(scrollVel) < 0.12) {
          smoothScroll = rawScrollY;
          scrollVel = 0;
        }
      }

      // Intro overlay (black bg + neon logo) — driven from the SAME smoothed
      // scroll, every frame, on the compositor (translate3d).
      const introT = introPx <= 0 ? 1 : Math.min(Math.max(smoothScroll / introPx, 0), 1);
      if (introRef.current) {
        introRef.current.style.opacity = (1 - introT).toFixed(3);
        introRef.current.style.transform = `translate3d(0, ${(-introT * 36).toFixed(1)}px, 0)`;
        // Clickable only while it's actually the resting intro (top of page),
        // so once it fades out it never swallows clicks meant for the video.
        introRef.current.style.pointerEvents = introT < 0.5 ? "auto" : "none";
      }

      // Video frame from the same smoothed scroll.
      const framePx = Math.max(0, smoothScroll - introPx);
      const p = frameMax <= 0 ? 0 : Math.min(Math.max(framePx / frameMax, 0), 1);
      current = p * (FRAME_COUNT - 1);

      const idx = Math.round(current);
      if (idx !== lastDrawn || needsDraw) {
        draw(idx);
        lastDrawn = idx;
        needsDraw = false;
      }

      if (vignetteRef.current) {
        const speedN = Math.min(Math.abs(scrollVel) / (PX_PER_FRAME * 90), 1);
        vignetteRef.current.style.opacity = (0.22 + speedN * 0.1).toFixed(3);
      }

      // Atmospheric entrance haze (cheaper blur ceiling on mobile). While the
      // page is reversing to the closed book we force it fully clear, so the
      // closed-book frames (which sit inside the opening haze) read crisp — not
      // black — at the end of the rewind.
      const aRaw = rewinding ? 0 : 1 - Math.min(current / ENTRANCE_FRAMES, 1);
      const a = aRaw * aRaw * (3 - 2 * aRaw); // smoothstep
      if (Math.abs(a - lastA) > 0.001) {
        lastA = a;
        canvas.style.filter = `blur(${(a * BLUR_MAX).toFixed(1)}px) saturate(${(1 - a * 0.55).toFixed(3)}) brightness(${(1 - a * 0.16).toFixed(3)})`;
        canvas.style.opacity = (0.14 + (1 - a) * 0.86).toFixed(3);
        canvas.style.transform = `scale(${(1 + a * 0.07).toFixed(4)})`;
        if (atmosRef.current) atmosRef.current.style.opacity = a.toFixed(3);
      }

      // Reveal nav + end content from the RAW scroll (instant at the bottom).
      const rawFramePx = Math.max(0, rawScrollY - introPx);
      const rawProg = frameMax <= 0 ? 0 : Math.min(Math.max(rawFramePx / frameMax, 0), 1);
      if (rawProg >= END_THRESHOLD && !endedLocal) {
        endedLocal = true;
        setEnded(true);
      } else if (rawProg < END_THRESHOLD - 0.04 && endedLocal) {
        endedLocal = false;
        setEnded(false);
      }

      // Park the loop once everything is genuinely still — scroll, frames and
      // autopilot all idle. wake() restarts it from any input or frame load,
      // so a resting page costs zero rAF work.
      const settled =
        smoothScroll === rawScrollY && scrollVel === 0 && !needsDraw && !rewinding && !autoplaying;
      idleFrames = settled ? idleFrames + 1 : 0;
      if (idleFrames >= IDLE_FRAMES_TO_SLEEP) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (disposed || running) return;
      running = true;
      idleFrames = 0;
      lastT = performance.now();
      raf = requestAnimationFrame(tick);
    };

    // Progressive load: reveal as soon as the first needed frame(s) are ready,
    // then STREAM the rest in order (or end-first when arriving via Home) at a
    // bounded concurrency, so the page is interactive almost instantly.
    let loaded = 0;
    let readyTimer = 0;
    let revealTimer = 0;
    const bootT0 = performance.now();
    const CONCURRENCY = 6;
    // Reveal once a small buffer is ready — the black intro fully covers the
    // canvas at rest and nearestLoaded() papers over gaps, so streaming stays
    // comfortably ahead of the 4.6s autoplay scrub.
    const REVEAL_AT = Math.min(FRAME_COUNT, 16);
    const reveal = () => {
      if (disposed) return;
      try {
        sessionStorage.setItem(HERO_READY_KEY, "1");
      } catch {
        /* private mode */
      }
      setReady(true);
    };
    const revealAfterBrandBeat = () => {
      const elapsed = performance.now() - bootT0;
      if (elapsed >= MIN_BEAT_MS) {
        reveal();
        return;
      }
      window.clearTimeout(revealTimer);
      revealTimer = window.setTimeout(reveal, MIN_BEAT_MS - elapsed);
    };
    const loadFrame = (i: number): Promise<void> =>
      new Promise((resolve) => {
        if (images[i]) return resolve();
        const img = new Image();
        img.decoding = "async";
        const done = () => {
          if (disposed) return resolve();
          loadedFlags[i] = true;
          loaded++;
          // Compositor-only progress: written straight to the bar's transform,
          // no React re-render per frame.
          if (progressBarRef.current) {
            progressBarRef.current.style.transform = `scaleX(${(loaded / FRAME_COUNT).toFixed(4)})`;
          }
          if (i === 0 && img.naturalWidth) {
            imgW = img.naturalWidth;
            imgH = img.naturalHeight;
          }
          needsDraw = true;
          wake(); // repaint with the better frame, then re-park
          if (loaded >= REVEAL_AT) {
            window.clearTimeout(readyTimer);
            revealAfterBrandBeat();
          }
          resolve();
        };
        // Fully DECODE the frame before marking it drawable, so painting it
        // during a scrub never blocks on decode (the main hitch with big frames).
        img.onload = () => {
          if (img.decode) img.decode().then(done).catch(done);
          else done();
        };
        img.onerror = done;
        img.src = frameSrc(i + 1);
        images[i] = img;
      });

    // On phones, stream only every 3rd frame: ~120 images instead of 361 (≈3×
    // less network + decode). nearestLoaded() fills the gaps during scrub, so
    // the cover still animates smoothly while the page becomes interactive far
    // faster and no longer stalls on slower mobile connections.
    const STRIDE = lite ? 3 : 1;
    const order: number[] = [];
    if (startAtEnd) {
      for (let i = FRAME_COUNT - 1; i >= 1; i -= STRIDE) order.push(i);
    } else {
      for (let i = 1; i < FRAME_COUNT; i += STRIDE) order.push(i);
    }
    // Always include the final frame so the end state is crisp.
    if (STRIDE > 1 && !order.includes(FRAME_COUNT - 1)) order.push(FRAME_COUNT - 1);

    // First-paint frames: frame 0 for dimensions, plus the last frame if we're
    // landing on the end state, so the correct frame shows immediately.
    const initial = startAtEnd
      ? Promise.all([loadFrame(0), loadFrame(FRAME_COUNT - 1)])
      : loadFrame(0);
    initial.then(() => {
      if (disposed) return;
      // Safety net: never hang the loader if a request stalls on a flaky network.
      readyTimer = window.setTimeout(reveal, 2500);
      let oi = 0;
      let inFlight = 0;
      const pump = () => {
        if (disposed) return; // navigation away halts the stream
        while (inFlight < CONCURRENCY && oi < order.length) {
          const i = order[oi++];
          if (images[i]) continue;
          inFlight++;
          loadFrame(i).then(() => {
            inFlight--;
            pump();
          });
        }
      };
      pump();
    });

    setTrackHeight();
    resize();
    updateTarget();
    smoothScroll = rawScrollY;

    // Arriving via the "Home" nav button (/#enter): land on the FINISHED state —
    // past the video and the black intro — rather than the opening screen.
    if (startAtEnd) {
      const maxScroll = Math.max(0, track.offsetHeight - window.innerHeight);
      window.scrollTo(0, maxScroll);
      rawScrollY = maxScroll;
      smoothScroll = maxScroll;
      scrollVel = 0;
      lastDrawn = -1;
      needsDraw = true;
      lastA = -1;
      endedLocal = true;
      setEnded(true);
      history.replaceState(null, "", window.location.pathname);
    }

    const onScroll = () => {
      updateTarget();
      wake();
    };
    // Coalesce resize storms into one canvas realloc per frame.
    let resizeRaf = 0;
    const onResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        setTrackHeight();
        resize();
        updateTarget();
        wake();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    /* ---- First-swipe autoplay -----------------------------------------
       One downward gesture from the opening screen flies the whole
       sequence (logo fade → book opening) to the end state on its own —
       no need to keep scrolling. A gesture UP (or a new touch) hands
       control straight back to the user; the scrubber keeps working
       exactly as before from wherever the autopilot stopped. */
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let autoplaying = false;
    let autoplayRaf = 0;
    let autoplayT0 = 0;
    // Ignore cancel-inputs right after liftoff — the tail of the triggering
    // flick (wheel momentum) must not abort its own autoplay.
    const AUTOPLAY_GRACE_MS = 450;
    const maxScrollY = () => Math.max(0, track.offsetHeight - window.innerHeight);
    // Armed while resting on (or just past) the black intro screen.
    const autoplayArmed = () =>
      !autoplaying && !rewinding && !reduceMotion && window.scrollY < introPx + frameMax * 0.05;

    const stopAutoplay = () => {
      if (!autoplaying) return;
      autoplaying = false;
      cancelAnimationFrame(autoplayRaf);
      updateTarget(); // resync the scrubber to wherever we stopped
    };

    const startAutoplay = () => {
      if (autoplaying || rewinding || reduceMotion) return;
      const startY = window.scrollY;
      const endY = maxScrollY();
      if (endY - startY < 4) return;
      autoplaying = true;
      autoplayT0 = performance.now();
      wake();
      // Two-phase: the black logo screen wipes away FAST, then the video scrubs
      // at its original, unhurried pace (that timing was already good — only the
      // black hold felt long because of the slow ease-in).
      const introEnd = Math.min(introPx, endY);
      const fromBlack = startY < introEnd - 2;
      const BLACK_MS = 420; // quick exit of the black AAA-logo screen
      const VIDEO_MS = 4200; // the good video scrub pace
      const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
      const easeOutQuad = (x: number) => 1 - (1 - x) * (1 - x);
      const step = (now: number) => {
        if (!autoplaying) return;
        const t = now - autoplayT0;
        if (fromBlack && t < BLACK_MS) {
          // phase 1 — sweep through the black logo screen
          const k = t / BLACK_MS;
          window.scrollTo(0, startY + (introEnd - startY) * easeOutCubic(k));
        } else {
          // phase 2 — scrub the video at the original pace
          const vStart = fromBlack ? introEnd : startY;
          const k = Math.min((fromBlack ? t - BLACK_MS : t) / VIDEO_MS, 1);
          window.scrollTo(0, vStart + (endY - vStart) * easeOutQuad(k));
          if (k >= 1) {
            autoplaying = false;
            return;
          }
        }
        autoplayRaf = requestAnimationFrame(step);
      };
      autoplayRaf = requestAnimationFrame(step);
    };

    const onWheelAuto = (e: WheelEvent) => {
      if (autoplaying) {
        e.preventDefault(); // the autopilot owns the scroll while flying
        if (e.deltaY < -4 && performance.now() - autoplayT0 > AUTOPLAY_GRACE_MS) {
          stopAutoplay(); // scroll up = take the controls back
        }
        return;
      }
      if (e.deltaY > 2 && autoplayArmed()) {
        e.preventDefault();
        startAutoplay();
      }
    };
    let touchY0 = -1;
    const onTouchStartAuto = (e: TouchEvent) => {
      touchY0 = e.touches[0].clientY;
      // A fresh finger during the flight = the user wants control.
      if (autoplaying && performance.now() - autoplayT0 > AUTOPLAY_GRACE_MS) stopAutoplay();
    };
    const onTouchMoveAuto = (e: TouchEvent) => {
      if (autoplaying) {
        e.preventDefault();
        return;
      }
      if (touchY0 < 0) return;
      const dy = touchY0 - e.touches[0].clientY; // > 0 → swiping down the page
      if (dy > 12 && autoplayArmed()) {
        e.preventDefault();
        startAutoplay();
      }
    };
    // Tap / click the opening screen to enter. With Reduce Motion enabled
    // (common on iPads) — or if the scroll track is too short to animate — jump
    // straight to the end state instead of running the scroll autopilot, so a
    // tap ALWAYS gets the visitor in. Otherwise fly the cinematic autoplay.
    const enterInstant = () => {
      const endY = maxScrollY();
      window.scrollTo(0, endY);
      rawScrollY = endY;
      smoothScroll = endY;
      scrollVel = 0;
      lastDrawn = -1;
      lastA = -1;
      // Force the finished state so the shop nav + end content appear even if the
      // scroll math reports no scrollable height (happens on some iPads) — a tap
      // must ALWAYS get the visitor in.
      endedLocal = true;
      setEnded(true);
      needsDraw = true;
      updateTarget();
      wake();
    };
    const onIntroActivate = () => {
      if (autoplaying || rewinding) return;
      // Touch tablets/phones (iPad included), reduce-motion, or a too-short track
      // skip the heavy cinematic scrub — which can stall on iPad — and enter
      // instantly, so tapping the cover always lands in the shop.
      if (reduceMotion || lite || maxScrollY() < 8) enterInstant();
      else startAutoplay();
    };
    const introEl = introRef.current;
    introEl?.addEventListener("click", onIntroActivate);
    // iOS occasionally suppresses the synthetic click on a fixed overlay — bind
    // touchend as a reliable fallback so the tap is never swallowed.
    introEl?.addEventListener("touchend", onIntroActivate);

    window.addEventListener("wheel", onWheelAuto, { passive: false });
    window.addEventListener("touchstart", onTouchStartAuto, { passive: true });
    window.addEventListener("touchmove", onTouchMoveAuto, { passive: false });

    // Hard fail-safe: never leave a device stuck on the black loader if frame
    // loading stalls (seen on iPad Safari) — reveal the cover no later than 4s
    // after mount, regardless of how many frames have arrived.
    const failSafeReveal = window.setTimeout(reveal, 4000);

    wake();

    // Page-transition hook: before gliding to another route, rewind the scrubber
    // back to the closed-book frame so the video visibly reverses first.
    let rewindRaf = 0;
    let rewindTimer = 0;
    const rewindToBookClosed = () =>
      new Promise<void>((resolve) => {
        stopAutoplay(); // a nav click mid-flight grounds the autopilot first
        const startY = window.scrollY;
        // Stop on a frame where the book is fully CLOSED (cover down). In the
        // 361-frame set it sits closed through ~frame 50 and only begins lifting
        // open around ~57. The haze is suppressed for the rewind (see
        // `rewinding`), so this reads crisp, not black.
        const BOOK_CLOSED_FRAME = 40;
        const targetY = introPx + BOOK_CLOSED_FRAME * PX_PER_FRAME;
        if (startY <= targetY + 2) {
          resolve();
          return;
        }
        rewinding = true;
        // Classy reverse: drive the scrubber DIRECTLY (bypassing its own
        // smoothing) along an ease-out-quad curve — slow and smooth, but with a
        // clean finish (no long creeping tail), so it flows straight into the
        // glide without a stuck beat at the end.
        const dur = 1400;
        const t0 = performance.now();
        const easeOutQuad = (x: number) => 1 - (1 - x) * (1 - x);
        const stepBack = (now: number) => {
          if (disposed) return; // never scroll a page we've already left
          const k = Math.min((now - t0) / dur, 1);
          const y = startY + (targetY - startY) * easeOutQuad(k);
          window.scrollTo(0, y);
          // Pin the integrator to the eased value so the frame tracks the curve
          // exactly (no damping lag), then keep it parked on the book.
          rawScrollY = y;
          smoothScroll = y;
          scrollVel = 0;
          if (k < 1) {
            rewindRaf = requestAnimationFrame(stepBack);
          } else {
            // Freeze the render loop so the main thread is free for the glide +
            // the incoming page (the book frame stays painted), then glide.
            cancelAnimationFrame(raf);
            running = false;
            rewindTimer = window.setTimeout(resolve, 120);
          }
        };
        rewindRaf = requestAnimationFrame(stepBack);
      });
    const unregisterRewind = registerRewind(rewindToBookClosed);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(autoplayRaf);
      cancelAnimationFrame(rewindRaf);
      cancelAnimationFrame(resizeRaf);
      unregisterRewind();
      window.clearTimeout(readyTimer);
      window.clearTimeout(revealTimer);
      window.clearTimeout(rewindTimer);
      window.clearTimeout(failSafeReveal);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("wheel", onWheelAuto);
      window.removeEventListener("touchstart", onTouchStartAuto);
      window.removeEventListener("touchmove", onTouchMoveAuto);
      introEl?.removeEventListener("click", onIntroActivate);
      introEl?.removeEventListener("touchend", onIntroActivate);
    };
  }, []);

  return (
    <>
      {/* Loader — unmounted entirely once its fade finishes */}
      {!loaderGone && (
        <HeroLoader wordmark={wordmark} ready={ready} barRef={progressBarRef} onGone={() => setLoaderGone(true)} />
      )}

      {/* Black intro screen — the resting state at the top of the page.
          Fades out as you scroll down and returns when you scroll back up. */}
      <div
        ref={introRef}
        role="button"
        tabIndex={0}
        aria-label={tr("home.heroBeginAria")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") e.currentTarget.click();
        }}
        className="fixed inset-0 z-40 flex cursor-pointer flex-col items-center justify-center bg-night"
        style={{ opacity: 1 }}
      >
        <div className="aaa-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-aaa-white.webp" alt="AAA" className="aaa-logo__layer aaa-logo__base" draggable={false} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-aaa-white.webp" alt="" className="aaa-logo__layer aaa-logo__sweep" draggable={false} />
        </div>
        <span className="aaa-cta absolute bottom-[clamp(40px,9vh,90px)] left-1/2 -translate-x-1/2 pl-[0.34em] text-[11px] font-medium uppercase tracking-[0.34em] text-white whitespace-nowrap">
          {introCta}
        </span>
      </div>

      {/* The site-wide workbook nav (same header as every inside page), handed
          over by the cover once the video reaches its end state. */}
      <div
        aria-hidden={!ended}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          ended ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        {header}
      </div>

      {/* Fixed canvas stage */}
      <div className="fixed inset-0 z-[1] overflow-hidden bg-night">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block h-full w-full origin-center will-change-[opacity,transform,filter]"
          style={{ opacity: 0 }}
        />

        {/* Smoke + glass atmosphere — opacity driven from the entrance haze (a) */}
        <div
          ref={atmosRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ opacity: 0 }}
        >
          <div className="hero-smoke hero-smoke--a" />
          <div className="hero-smoke hero-smoke--b" />
          <div className="hero-glass" />
        </div>

        <div
          ref={vignetteRef}
          className="pointer-events-none absolute inset-0 transition-opacity duration-100"
          style={{
            opacity: 0.22,
            background:
              "radial-gradient(120% 120% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%), linear-gradient(to bottom, rgba(0,0,0,0.25), transparent 22%, transparent 78%, rgba(0,0,0,0.35))",
          }}
        />

        {/* End content */}
        <div
          className={`pointer-events-none absolute bottom-[clamp(48px,12vh,130px)] left-1/2 flex w-[min(90vw,760px)] -translate-x-1/2 flex-col items-center text-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            ended ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          {/* The brand line — small, sitting just above the single way in. The
              real heading is for screen readers / SEO; the blur-morph between
              "Wearable art" and "made by hand" is decorative. */}
          <h1 className="sr-only">{`${headlineA}, ${headlineB}`}</h1>
          <div
            aria-hidden
            className="flex h-[clamp(2.4rem,5vw,3.6rem)] items-center justify-center"
          >
            <GooeyText
              texts={[headlineA, headlineB]}
              morphTime={1.6}
              cooldownTime={3.2}
              active={ended}
              className="font-semibold"
              textClassName="whitespace-nowrap text-white text-[clamp(1.6rem,4vw,2.8rem)] leading-none tracking-tight [text-shadow:0_2px_22px_rgba(0,0,0,0.6)]"
            />
          </div>

          {/* A single way in — the shop. Paper sticker torn from the workbook
              inside, bridging the dark cover with the pages within. */}
          <TransitionLink
            href="/shop"
            className="book-theme bg-grid-paper group pointer-events-auto mt-6 inline-flex -rotate-[1.1deg] flex-col items-center gap-1 border border-ink/70 px-7 py-3.5 font-typewriter text-[12px] font-medium uppercase tracking-[0.25em] text-ink shadow-[4px_4px_0_rgba(0,0,0,0.5),0_10px_42px_rgba(0,0,0,0.55)] transition-transform duration-300 hover:rotate-0 hover:scale-[1.04] sm:mt-7 sm:px-9 sm:py-4 sm:text-[13px]"
          >
            {shopCta}
            <span aria-hidden className="animate-bounce text-[15px] leading-none text-ink/70 group-hover:text-ink">
              ↓
            </span>
          </TransitionLink>
        </div>
      </div>

      {/* Tall track that drives the scrub (transparent; must not eat pointer events) */}
      <div ref={trackRef} className="pointer-events-none relative z-[2]" />
    </>
  );
}

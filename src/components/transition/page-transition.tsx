"use client";

import * as React from "react";
import Link from "next/link";
import type { LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { runRewind } from "./transition-bus";

/* Book page-turn between routes — no curtain, no reload flash.
 *
 * Uses the native View Transitions API: the browser snapshots the current view
 * and the destination, then CSS (see globals.css) turns the old page like a
 * book leaf hinged at the left edge of the viewport, revealing the new page
 * beneath. Navigating "backwards" through the book sweeps the previous leaf
 * back in from over the spine instead.
 *
 * Because it works on rendered snapshots, the hero's fixed canvas and scroll
 * position are captured correctly (no jump), and the live DOM is never wrapped
 * in a transform. Browsers without the API just navigate. */

interface TransitionCtx {
  navigate: (href: string) => void;
}
const Ctx = React.createContext<TransitionCtx | null>(null);

export function useTransitionNav(): TransitionCtx | null {
  return React.useContext(Ctx);
}

function pathOf(href: string): string {
  try {
    return new URL(href, "http://_").pathname;
  } catch {
    return href;
  }
}

/* The site reads as one book: home is the cover, then shop, collections,
 * a-book, about, contact in page order. Deeper routes (e.g. a product page)
 * sit one leaf after their section, so opening a product turns forward and
 * "Back to the shop" turns back. Unknown routes land at the end. */
const SECTION_ORDER: Record<string, number> = {
  "": 0, // home
  shop: 10,
  create: 15,
  collection: 20,
  "a-book": 30,
  about: 40,
  contact: 50,
  login: 60,
  admin: 70,
};

function pageOrder(path: string): number {
  const segments = path.split("/").filter(Boolean);
  const base = SECTION_ORDER[segments[0] ?? ""] ?? 90;
  return base + Math.min(segments.length > 1 ? segments.length - 1 : 0, 9);
}

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void | Promise<void>) => { finished: Promise<void> };
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lockRef = React.useRef(false);
  // Resolves the in-flight transition once the new route actually commits.
  const commitRef = React.useRef<null | (() => void)>(null);

  React.useEffect(() => {
    if (commitRef.current) {
      commitRef.current();
      commitRef.current = null;
    }
  }, [pathname]);

  const navigate = React.useCallback(
    async (href: string) => {
      if (lockRef.current) return;
      if (pathOf(href) === pathname) {
        router.push(href);
        return;
      }
      lockRef.current = true;

      // Warm the destination so the route commits instantly when the leaf
      // starts turning (a stalled commit would freeze on the snapshot).
      try {
        router.prefetch(href);
      } catch {
        /* prefetch is best-effort */
      }

      // On the home hero the video first rewinds to the closed book, THEN the
      // leaf turns — the book closes before its page is turned. No-op on
      // every other page.
      await runRewind();

      const commit = () =>
        new Promise<void>((resolve) => {
          commitRef.current = resolve;
          router.push(href);
          // Safety: never hang if the route never reports a commit.
          window.setTimeout(() => {
            if (commitRef.current === resolve) {
              commitRef.current = null;
              resolve();
            }
          }, 900);
        });

      const doc = document as ViewTransitionDoc;
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      if (doc.startViewTransition && !reduce) {
        const forward = pageOrder(pathOf(href)) >= pageOrder(pathname);
        document.documentElement.dataset.vt = forward ? "turn-forward" : "turn-back";
        const vt = doc.startViewTransition(() => commit());
        vt.finished.finally(() => {
          delete document.documentElement.dataset.vt;
          lockRef.current = false;
        });
      } else {
        await commit();
        lockRef.current = false;
      }
    },
    [pathname, router],
  );

  return <Ctx.Provider value={{ navigate }}>{children}</Ctx.Provider>;
}

type TransitionLinkProps = Omit<LinkProps, "href"> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
    children: React.ReactNode;
  };

/** Drop-in <Link> that routes through the page turn. Falls back to a normal
 * link for new tabs, external URLs, bare "#" and same-page anchors. */
export function TransitionLink({ href, children, onClick, ...rest }: TransitionLinkProps) {
  const ctx = useTransitionNav();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (!ctx || e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (rest.target === "_blank") return;
    if (typeof href !== "string" || href === "#") return;
    if (/^(https?:|mailto:|tel:)/i.test(href)) return;
    e.preventDefault();
    ctx.navigate(href);
  };

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}

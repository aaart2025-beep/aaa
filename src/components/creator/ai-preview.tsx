"use client";

import * as React from "react";
import { Tape, HandNote } from "@/components/paper/annotations";
import { baseOf, type Design } from "@/lib/creator/config";
import { freeRenderUrl } from "@/lib/creator/prompt";
import { useT } from "@/lib/i18n/context";

/* The live AI render of the piece, beside the editor. It keeps the current
 * render on screen while the next one paints (no blank flash), updates ~0.7s
 * after the design settles, and uses a stable seed per garment so tweaks read
 * as the SAME piece changing — not a random new one. Free & keyless: the
 * browser loads the render URL directly, no server needed. */

const loaded = new Set<string>(); // render URLs the browser has already painted

/** Stable key from the fields that change the render. */
function specKey(d: Design): string {
  return JSON.stringify({
    base: d.base,
    z: d.zoneColors,
    fab: d.fabric,
    cuts: [...d.cuts].sort(),
    logo: { c: d.logo.color, s: d.logo.style, y: Math.round(d.logo.y * 3) / 3 },
  });
}

export function AiPreview({ design }: { design: Design }) {
  const t = useT();
  const def = baseOf(design.base);
  const key = specKey(design);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const targetUrl = React.useMemo(() => freeRenderUrl(design), [key]);

  const [shownUrl, setShownUrl] = React.useState<string | null>(() =>
    loaded.has(targetUrl) ? targetUrl : null,
  );
  const [nextUrl, setNextUrl] = React.useState<string | null>(null);
  const [errored, setErrored] = React.useState(false);

  React.useEffect(() => {
    setErrored(false);
    if (targetUrl === shownUrl) {
      setNextUrl(null);
      return;
    }
    if (loaded.has(targetUrl)) {
      setShownUrl(targetUrl);
      setNextUrl(null);
      return;
    }
    // debounce, then start loading the new render — the old one stays visible
    const id = window.setTimeout(() => setNextUrl(targetUrl), 700);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUrl]);

  const updating = nextUrl !== null && !errored;

  return (
    <div className="relative flex flex-col bg-paper p-3 shadow-paper sm:p-5">
      <Tape className="-left-3 -top-2.5 h-5 w-16 -rotate-[18deg]" />
      <Tape className="-right-3 -top-2.5 h-5 w-16 rotate-[18deg]" />

      <div className="relative aspect-[3/4] w-full overflow-hidden border border-ink/15 bg-paper-dark/40">
        {/* the visible, loaded render (dims slightly while the next paints) */}
        {shownUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shownUrl}
            alt={t("pages.aiPreview.renderAlt", { label: def.label })}
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              updating ? "opacity-60" : "opacity-100"
            }`}
          />
        )}

        {/* hidden preloader for the next render; swaps in on load */}
        {nextUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={nextUrl}
            src={nextUrl}
            alt=""
            className="hidden"
            onLoad={() => {
              loaded.add(nextUrl);
              setShownUrl(nextUrl);
              setNextUrl(null);
            }}
            onError={() => {
              setErrored(true);
              setNextUrl(null);
            }}
          />
        )}

        {/* first-ever render: shimmer */}
        {!shownUrl && !errored && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="ai-shimmer absolute inset-0" aria-hidden />
            <span className="relative font-script text-[22px] text-ink/65">{t("pages.aiPreview.painting")}</span>
            <span className="relative font-typewriter text-[8.5px] uppercase tracking-[0.18em] text-ink/70">
              {t("pages.aiPreview.studioRender")}
            </span>
          </div>
        )}

        {/* live "updating" pulse over the previous render */}
        {updating && shownUrl && (
          <span className="font-typewriter absolute left-2 top-2 flex items-center gap-1.5 bg-paper/85 px-2 py-0.5 text-[8px] uppercase tracking-[0.16em] text-ink/65">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" /> {t("pages.aiPreview.updating")}
          </span>
        )}

        {/* error */}
        {errored && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-5 text-center">
            <span className="font-typewriter text-[10px] uppercase tracking-[0.16em] text-ink/70">
              {t("pages.aiPreview.couldntRender")}
            </span>
            <button
              type="button"
              onClick={() => {
                setErrored(false);
                setNextUrl(targetUrl);
              }}
              className="chip-ink font-typewriter px-3 py-1.5 text-[9.5px] uppercase tracking-[0.16em]"
            >
              {t("pages.aiPreview.tryAgain")}
            </button>
          </div>
        )}
      </div>

      <p className="font-typewriter mt-2.5 flex items-baseline justify-between text-[9px] uppercase tracking-[0.18em] text-ink/70">
        <span>{t("pages.aiPreview.label")}</span>
        <span>{t("pages.aiPreview.liveFree")}</span>
      </p>
      <HandNote rot={-2} className="mt-1 self-end text-[14px]">
        {t("pages.aiPreview.note")}
      </HandNote>
    </div>
  );
}

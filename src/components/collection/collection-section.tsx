import { TransitionLink } from "@/components/transition/page-transition";
import { CollectionStripLazy } from "@/components/collection/collection-strip-lazy";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";

interface CollectionSectionProps {
  title: string;
  subtitle: string;
  images: string[];
  /** Per-image product links (parallel to images). */
  hrefs: (string | undefined)[];
  /** Where the "Shop {title}" link goes. */
  href: string;
  /** Position in the album, for the "Nº 01" caption. */
  index: number;
  reverse?: boolean;
}

/* A floating row of products that slides left/right — no panel, no frame, no
 * box. Just a quiet text label and the pieces drifting across the page. */
export async function CollectionSection({
  title,
  subtitle,
  images,
  hrefs,
  href,
  index,
  reverse = false,
}: CollectionSectionProps) {
  const lang = await getLang();
  const t = (k: string, v?: Record<string, string | number>) => translate(lang, k, v);
  return (
    <section className="w-full">
      {/* minimal label — plain text, no frame */}
      <div className="mx-auto mb-1 flex max-w-6xl flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 sm:px-8">
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="font-typewriter shrink-0 text-[9px] uppercase tracking-[0.2em] text-ink/70">
            Nº {String(index + 1).padStart(2, "0")}
          </span>
          <h2 className="font-typewriter truncate text-[13px] uppercase tracking-[0.16em] text-ink sm:text-[15px]">
            {title}
          </h2>
          <span className="font-script hidden truncate text-[16px] text-ink/70 sm:inline">{subtitle}</span>
        </div>
        <TransitionLink
          href={href}
          className="font-typewriter shrink-0 text-[10px] uppercase tracking-[0.16em] text-ink/70 transition-colors hover:text-ink"
        >
          {t("shop.shopTitle", { title })} →
        </TransitionLink>
      </div>

      {/* floating products as a live WebGL strip — drift, bob, curve on scroll */}
      <div className="h-[clamp(200px,32vh,340px)] w-full overflow-hidden">
        <CollectionStripLazy images={images} hrefs={hrefs} reverse={reverse} speed={0.55} />
      </div>

      {/* crawlable + keyboard-reachable links to the pieces shown in the WebGL strip */}
      <ul className="sr-only">
        {images.map((_img, i) =>
          hrefs[i] ? (
            <li key={i}>
              <TransitionLink href={hrefs[i] as string}>{`${title} — ${(hrefs[i] as string).split("/").pop()?.replace(/-/g, " ")}`}</TransitionLink>
            </li>
          ) : null,
        )}
      </ul>
    </section>
  );
}

"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { TransitionLink } from "@/components/transition/page-transition";
import { PaintPrice } from "@/components/paper/paint-price";
import { SketchDoodle } from "@/components/paper/sketch-doodle";
import { priceInfo } from "@/lib/products";
import { useT } from "@/lib/i18n/context";

/* Category gallery in the workbook's own voice: the pieces float free on the
 * graph paper (no cards, no frames — like the main collection page), riding a
 * horizontal rail. Tapping a piece opens its full product page, exactly like
 * the shop. */

export type ProductInfo = {
  slug: string;
  price: number;
  discount?: number;
  images: string[];
  sizes: string[];
  colors: string[];
};

export type GalleryItem = {
  id: number | string;
  title: string;
  desc: string;
  url: string;
  span: string;
  product?: ProductInfo;
};

const railVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 22, rotate: -1.5, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 110, damping: 15 },
  },
};

/* Reduced-motion: appear in place, no fade/slide/spring (framer-motion does not
 * honor prefers-reduced-motion on its own). */
const staticVariants: Variants = {
  hidden: { opacity: 1, y: 0, rotate: 0, scale: 1 },
  visible: { opacity: 1 },
};

function PieceCaption({ item }: { item: GalleryItem }) {
  const ip = item.product ? priceInfo(item.product) : null;
  return (
    <div className="mt-2 flex items-center justify-between gap-1.5 px-0.5">
      <span className="font-typewriter min-w-0 flex-1 truncate text-[10.5px] uppercase tracking-[0.1em] text-ink">
        {item.title}
      </span>
      {ip && (
        <PaintPrice
          price={ip.price}
          original={ip.original}
          strikeClassName="text-[9px]"
          textClassName="text-[11px]"
          className="shrink-0 px-2 py-1"
        />
      )}
    </div>
  );
}

function PiecePhoto({ item }: { item: GalleryItem }) {
  const { percent } = item.product ? priceInfo(item.product) : { percent: undefined };
  return (
    <div className="relative aspect-[3/4]">
      {/* markdown tag — a stamped sale sticker, when the piece is on sale */}
      {percent ? (
        <span className="pointer-events-none absolute left-0 top-1 z-20 -rotate-[7deg] bg-ink px-1.5 py-0.5 font-archivo text-[9px] font-bold uppercase leading-none tracking-[0.06em] text-lime shadow-[2px_2px_0_rgba(40,34,24,0.28)]">
          −{percent}%
        </span>
      ) : null}
      <div className="img-breathe relative h-full w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.url}
          alt={item.title}
          loading="lazy"
          draggable={false}
          className="h-full w-full object-contain drop-shadow-[0_11px_18px_rgba(40,34,24,0.24)] transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.05]"
        />
      </div>
    </div>
  );
}

export function CategoryGallery({
  imageItems,
  title,
  description,
}: {
  imageItems: GalleryItem[];
  title: string;
  description: string;
}) {
  const t = useT();
  const reduce = useReducedMotion();
  const cardV = reduce ? staticVariants : cardVariants;
  return (
    <section className="relative w-full py-12 sm:py-16">
      <div className="mx-auto px-5 text-center sm:px-8">
        <p className="font-typewriter text-[10px] uppercase tracking-[0.3em] text-ink/70 sm:text-[11px]">
          {t("shop.collectionEyebrow")}
        </p>
        <h2 className="font-script mt-2 text-[clamp(2.2rem,6vw,3.8rem)] font-bold leading-[1.05] text-ink">{title}</h2>
        <p className="font-typewriter mx-auto mt-3 max-w-xl text-[12px] leading-[1.9] tracking-[0.04em] text-ink/65">
          {description}
        </p>
      </div>

      {/* the rail — pieces float free on the paper, drifting sideways (native scroll) */}
      <div className="relative mt-9 w-full overflow-x-auto overflow-y-hidden overscroll-x-contain pb-3 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <motion.div
          className="flex w-max items-end gap-6 px-5 sm:gap-9 md:px-8"
          variants={railVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {imageItems.flatMap((item, i) => {
            const rot = `${(i % 2 ? 1 : -1) * (0.5 + ((i * 13) % 10) / 10)}deg`;
            const style = {
              rotate: rot,
              "--breathe-dur": `${6.5 + (i % 5) * 0.6}s`,
              "--breathe-delay": `${((i * 7) % 40) / 10}s`,
            } as React.CSSProperties;
            const cells: React.ReactNode[] = [];

            // a working sketch inked straight onto the page, mid-rail
            if (i === Math.min(3, Math.max(1, imageItems.length - 1))) {
              cells.push(
                <motion.div
                  key="sketch-note"
                  aria-hidden
                  variants={cardV}
                  className="flex w-[9rem] shrink-0 -rotate-[1.5deg] items-center justify-center self-center sm:w-[11rem]"
                >
                  <SketchDoodle caption className="w-[84%]" strokeClassName="text-ink/70" />
                </motion.div>,
              );
            }

            cells.push(
              <motion.div key={item.id} variants={cardV} style={style} className="w-[10rem] shrink-0 sm:w-[13rem]">
                {item.product?.slug ? (
                  <TransitionLink
                    href={`/shop/${item.product.slug}`}
                    aria-label={t("shop.openAria", { name: item.title })}
                    className="group block rounded-sm"
                  >
                    <PiecePhoto item={item} />
                    <PieceCaption item={item} />
                  </TransitionLink>
                ) : (
                  <div className="group block">
                    <PiecePhoto item={item} />
                    <PieceCaption item={item} />
                  </div>
                )}
              </motion.div>,
            );

            return cells;
          })}
        </motion.div>
      </div>
    </section>
  );
}

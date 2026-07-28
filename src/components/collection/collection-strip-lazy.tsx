"use client";

import dynamic from "next/dynamic";

/* Client-side lazy wrapper so three.js stays out of the /collection route's
 * first-load JS (mirrors how the /create configurator is loaded). */
export const CollectionStripLazy = dynamic(
  () => import("./collection-strip-3d").then((m) => m.CollectionStrip3D),
  { ssr: false, loading: () => null },
);

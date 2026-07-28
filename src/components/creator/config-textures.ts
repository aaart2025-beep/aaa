"use client";

import * as React from "react";
import * as THREE from "three";
import { makePatternCanvas, type PatternDef } from "@/lib/creator/patterns";
import { makeFabricNormal, type FabricKind } from "@/lib/creator/fabric-maps";

/* Texture hooks for the 3D configurator. Every texture created here is owned
 * here: replaced or unmounted textures are disposed so GPU memory stays flat
 * no matter how long someone plays with fabrics, colours and patterns. */

/** Normalised display size shared by all garment/shoe fitting math. */
export const TARGET = 1.5;

const FAB: Record<string, { r: number; m: number; e: number }> = {
  leather: { r: 0.32, m: 0, e: 1.1 }, suede: { r: 0.95, m: 0, e: 0.25 }, croc: { r: 0.5, m: 0.05, e: 0.8 }, canvas: { r: 0.9, m: 0, e: 0.35 },
  fleece: { r: 0.96, m: 0, e: 0.2 }, organic: { r: 0.85, m: 0, e: 0.3 }, sherpa: { r: 1.0, m: 0, e: 0.15 }, acid: { r: 0.8, m: 0, e: 0.45 },
  heavy: { r: 0.85, m: 0, e: 0.3 }, slub: { r: 0.9, m: 0, e: 0.25 }, vintage: { r: 0.88, m: 0, e: 0.4 },
  twill: { r: 0.8, m: 0, e: 0.35 }, corduroy: { r: 0.95, m: 0, e: 0.2 }, burlap: { r: 1.0, m: 0, e: 0.2 }, denim: { r: 0.85, m: 0, e: 0.3 },
};
export const fabricPBR = (k: string) => FAB[k] ?? { r: 0.8, m: 0, e: 0.4 };

/* each fabric → a surface-texture kind + how strongly its normal map reads */
const FABRIC_KIND: Record<string, FabricKind> = {
  leather: "leather", suede: "fuzzy", croc: "leather", canvas: "woven",
  fleece: "fuzzy", organic: "woven", sherpa: "fuzzy", acid: "woven",
  heavy: "woven", slub: "woven", vintage: "woven",
  twill: "twill", corduroy: "ribbed", burlap: "woven", denim: "twill",
};
const NORMAL_SCALE: Record<FabricKind, number> = {
  smooth: 0.18, leather: 0.55, woven: 0.5, twill: 0.6, ribbed: 0.85, fuzzy: 0.32,
};

export interface FabricNormal {
  tex: THREE.CanvasTexture;
  scale: number;
}

export function useFabricNormal(fabric: string, repeat = 4): FabricNormal | null {
  const fab = React.useMemo(() => {
    const kind = FABRIC_KIND[fabric] ?? "woven";
    const canvas = makeFabricNormal(kind, 256);
    if (!canvas) return null;
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat, repeat);
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return { tex, scale: NORMAL_SCALE[kind] ?? 0.4 };
  }, [fabric, repeat]);

  React.useEffect(() => {
    const tex = fab?.tex;
    return () => {
      tex?.dispose();
    };
  }, [fab]);

  return fab;
}

export type LogoTex = { texture: THREE.CanvasTexture; aspect: number };

let logoImg: HTMLImageElement | null = null;
let logoImgPromise: Promise<HTMLImageElement | null> | null = null;
function loadLogoImage(): Promise<HTMLImageElement | null> {
  if (logoImg) return Promise.resolve(logoImg);
  if (typeof document === "undefined") return Promise.resolve(null);
  if (!logoImgPromise) {
    logoImgPromise = new Promise((res) => {
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = () => {
        logoImg = im;
        res(im);
      };
      im.onerror = () => res(null);
      im.src = "/brand/logo-aaa-ink.png";
    });
  }
  return logoImgPromise;
}

const LOGO_DEBOUNCE_MS = 120; // one texture per colour settle, not per drag frame

/** The real AAA balloon mark, tinted to the chosen colour, as a decal texture. */
export function useLogoTexture(color: string, embroidered: boolean): LogoTex | null {
  const [tex, setTex] = React.useState<LogoTex | null>(null);
  const liveRef = React.useRef<LogoTex | null>(null);

  React.useEffect(() => {
    let alive = true;
    const id = window.setTimeout(() => {
      loadLogoImage().then((img) => {
        if (!alive || !img) return;
        const W = 600;
        const aspect = img.width / img.height;
        const c = document.createElement("canvas");
        c.width = W;
        c.height = Math.round(W / aspect);
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, c.width, c.height);
        // keep the mark's alpha shape, swap its colour to the chosen one
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.globalCompositeOperation = "source-over";
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        t.needsUpdate = true;
        liveRef.current?.texture.dispose();
        const next = { texture: t, aspect };
        liveRef.current = next;
        setTex(next);
      });
    }, LOGO_DEBOUNCE_MS);
    return () => {
      alive = false;
      window.clearTimeout(id);
    };
  }, [color, embroidered]);

  React.useEffect(
    () => () => {
      liveRef.current?.texture.dispose();
      liveRef.current = null;
    },
    [],
  );

  return tex;
}

export function usePatternTexture(base: string, def: PatternDef): THREE.CanvasTexture | null {
  const tex = React.useMemo(() => {
    if (def.type === "solid") return null;
    const canvas = makePatternCanvas(base, def, 256);
    if (!canvas) return null;
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    // sampled triplanar in the shader (world-space), so garment UVs don't matter
    t.generateMipmaps = false;
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.anisotropy = 8;
    t.needsUpdate = true;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, def.type, def.color, def.scale, def.angle]);

  React.useEffect(() => {
    return () => {
      tex?.dispose();
    };
  }, [tex]);

  return tex;
}

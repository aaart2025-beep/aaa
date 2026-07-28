"use client";

import * as React from "react";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";
import {
  BASES,
  LOGO_STYLES,
  applyPalette,
  baseOf,
  defaultDesign,
  inspirationsFrom,
  paletteFrom,
  priceDesign,
  type BaseKey,
  type Design,
} from "@/lib/creator/config";
import { GARMENT_ART } from "@/components/creator/garment-svgs";
import { MockupPreview } from "@/components/creator/mockup-preview";
import { PATTERNS } from "@/lib/creator/patterns";
import { SHOE_MODELS, shoeModelOf, type ShoeModelKey } from "@/lib/creator/shoes";
import { HandNote, Tape, CircleDoodle } from "@/components/paper/annotations";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/context";
import dynamic from "next/dynamic";

/* bases that have a 3D model (kept local so the heavy 3D module stays lazy) */
const THREE_D_BASES = new Set<BaseKey>(["sneaker", "tee", "cap", "hoodie"]);

/* the WebGL configurator is client-only (no SSR — it needs the browser/WebGL) */
function Loading3D() {
  const t = useT();
  return (
    <div className="font-script flex aspect-[4/3] items-center justify-center bg-paper text-[20px] text-ink/70 shadow-paper sm:aspect-[16/10]">
      {t("pages.creator.loading3d")}
    </div>
  );
}

const Configurator3D = dynamic(
  () => import("@/components/creator/configurator-3d").then((m) => m.Configurator3D),
  {
    ssr: false,
    loading: () => <Loading3D />,
  },
);

/* The Design-It-Yourself studio: pick a base, click a part of the drawing,
 * paint it from the studio's real swatch wall, drag the AAA mark anywhere,
 * choose fabric, size and finishing cuts — the price writes itself like a
 * receipt. Palettes can be borrowed from real pieces in the shop. */

const VB_W = 320;
const VB_H = 300;

function StepTitle({ no, children }: { no: string; children: React.ReactNode }) {
  return (
    <h3 className="font-typewriter flex items-baseline gap-2 text-[10px] uppercase tracking-[0.22em] text-ink/70">
      <span className="text-ink/35">{no}</span> {children}
    </h3>
  );
}

export function Creator({ products, email }: { products: Product[]; email: string }) {
  const t = useT();
  const palette = React.useMemo(() => paletteFrom(products), [products]);
  const inspirations = React.useMemo(() => inspirationsFrom(products), [products]);

  const [design, setDesign] = React.useState<Design>(() => defaultDesign("hoodie"));
  const [activeZone, setActiveZone] = React.useState(0);
  const [activePart, setActivePart] = React.useState<string>(() => shoeModelOf("runner").parts[0].mat);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const dragRef = React.useRef(false);

  const def = baseOf(design.base);
  const { lines, total } = priceDesign(design);
  const Art = GARMENT_ART[design.base];

  const isSneaker = design.base === "sneaker";
  const shoe = shoeModelOf(design.shoeModel);

  /* unified "parts" model: shoe parts for sneakers, garment zones otherwise */
  const parts = isSneaker
    ? shoe.parts.map((p) => ({ key: p.mat, label: p.label, color: design.shoeColors[p.mat] ?? shoe.defaults[p.mat] ?? "#cccccc" }))
    : def.zones.map((z, i) => ({ key: String(i), label: z.label, color: design.zoneColors[i] }));
  const activeKey = isSneaker ? activePart : String(activeZone);
  const activeColor = isSneaker ? design.shoeColors[activePart] ?? shoe.defaults[activePart] ?? "#cccccc" : design.zoneColors[activeZone];

  /* ---------- mutations ---------- */
  const switchBase = (base: BaseKey) => {
    if (base === design.base) return;
    const fresh = defaultDesign(base);
    setDesign({ ...fresh, logo: { ...fresh.logo, style: design.logo.style, color: design.logo.color } });
    setActiveZone(0);
    if (base === "sneaker") setActivePart(shoeModelOf(fresh.shoeModel).parts[0].mat);
  };
  const switchShoe = (key: ShoeModelKey) => {
    const m = shoeModelOf(key);
    setDesign((d) => ({ ...d, shoeModel: key, shoeColors: { ...m.defaults } }));
    setActivePart(m.parts[0].mat);
  };
  const paint = (color: string) => {
    if (isSneaker) {
      setDesign((d) => ({ ...d, shoeColors: { ...d.shoeColors, [activePart]: color } }));
    } else {
      setDesign((d) => ({ ...d, inspiration: undefined, zoneColors: d.zoneColors.map((c, i) => (i === activeZone ? color : c)) }));
    }
  };
  const selectPart = (key: string) => (isSneaker ? setActivePart(key) : setActiveZone(Number(key)));
  const toggleCut = (key: string) =>
    setDesign((d) => ({
      ...d,
      cuts: d.cuts.includes(key) ? d.cuts.filter((c) => c !== key) : [...d.cuts, key],
    }));
  const setPattern = (p: Partial<Design["pattern"]>) =>
    setDesign((d) => ({ ...d, inspiration: undefined, pattern: { ...d.pattern, ...p } }));
  const setLogo = (p: Partial<Design["logo"]>) =>
    setDesign((d) => ({ ...d, logo: { ...d.logo, ...p } }));
  const surprise = () => {
    const pool = palette.length ? palette : ["#26221a", "#f5f5f0", "#a6db1e", "#c0392b", "#2d6cdf", "#e8731a"];
    if (isSneaker) {
      const pick = () => pool[Math.floor(Math.random() * pool.length)];
      setDesign((d) => ({ ...d, shoeColors: Object.fromEntries(shoe.parts.map((p) => [p.mat, pick()])) }));
      return;
    }
    if (inspirations.length === 0) return;
    const insp = inspirations[Math.floor(Math.random() * inspirations.length)];
    setDesign((d) => applyPalette(d, insp.colors, insp.name));
  };

  /* ---------- logo dragging ---------- */
  const logoPointerDown = (e: React.PointerEvent) => {
    dragRef.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const logoPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const x = Math.min(0.92, Math.max(0.08, (e.clientX - r.left) / r.width));
    const y = Math.min(0.9, Math.max(0.08, (e.clientY - r.top) / r.height));
    setDesign((d) => ({ ...d, logo: { ...d.logo, x, y } }));
  };
  const logoPointerUp = () => {
    dragRef.current = false;
  };

  /* ---------- actions ---------- */
  const downloadSketch = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const blob = new Blob(
      [`<?xml version="1.0" encoding="UTF-8"?>\n${svg.outerHTML.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"')}`],
      { type: "image/svg+xml" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aaa-custom-${design.base}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const mailtoHref = React.useMemo(() => {
    const zoneLines = def.zones.map((z, i) => `  ${z.label}: ${design.zoneColors[i]}`).join("\n");
    const cuts = design.cuts.length
      ? design.cuts.map((c) => def.cuts.find((x) => x.key === c)?.label).join(", ")
      : t("pages.creator.mail.none");
    const body = [
      t("pages.creator.mail.intro"),
      ``,
      t("pages.creator.mail.base", { label: def.label }),
      t("pages.creator.mail.colours"),
      zoneLines,
      t("pages.creator.mail.fabric", { label: def.fabrics.find((f) => f.key === design.fabric)?.label ?? "" }),
      t("pages.creator.mail.size", { size: design.size }),
      t("pages.creator.mail.cuts", { cuts }),
      t("pages.creator.mail.logo", {
        details: `${design.logo.style}, ${design.logo.color}, ${Math.round(design.logo.x * 100)}% / ${Math.round(design.logo.y * 100)}%, ${design.logo.scale.toFixed(2)}`,
      }),
      design.inspiration ? t("pages.creator.mail.palette", { name: design.inspiration }) : ``,
      ``,
      t("pages.creator.mail.estPrice", { price: formatPrice(total) }),
      ...lines.map((l) => `  ${l.label} — ${formatPrice(l.amount)}`),
      ``,
      t("pages.creator.mail.attach"),
    ]
      .filter(Boolean)
      .join("\n");
    return `mailto:${email}?subject=${encodeURIComponent(t("pages.creator.mail.subject", { label: def.label }))}&body=${encodeURIComponent(body)}`;
  }, [design, def, lines, total, email, t]);

  /* ================================ UI ================================ */
  return (
    <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
      {/* ----------------- the model — sticky on every size ----------------- */}
      <div className="sticky top-[84px] z-20 lg:self-start">
        {/* garments with a model → live WebGL configurator; the rest → inked editor + mockup */}
        {THREE_D_BASES.has(design.base) ? (
          <Configurator3D design={design} onSelectZone={setActiveZone} onSelectPart={setActivePart} className="aspect-[4/3] sm:aspect-[16/10]" />
        ) : (
        <div className="grid gap-4 sm:grid-cols-2">
        <div className="relative bg-paper p-3 shadow-paper sm:p-5">
          <Tape className="-left-3 -top-2.5 h-5 w-16 -rotate-[24deg]" />
          <Tape className="-right-3 -top-2.5 h-5 w-16 rotate-[24deg]" />

          <svg
            ref={svgRef}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="block w-full touch-none select-none"
            aria-label={t("pages.creator.svgAria", { label: def.label })}
          >
            {/* paper ground inside the file so downloads look right */}
            <rect width={VB_W} height={VB_H} fill="#efe9da" />
            <g stroke="#3a352b" strokeWidth="0.4" opacity="0.12">
              {Array.from({ length: 15 }, (_, i) => (
                <line key={`v${i}`} x1={(i + 1) * 20} y1="0" x2={(i + 1) * 20} y2={VB_H} />
              ))}
              {Array.from({ length: 14 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={(i + 1) * 20} x2={VB_W} y2={(i + 1) * 20} />
              ))}
            </g>

            <Art colors={design.zoneColors} activeZone={activeZone} onZone={setActiveZone} />

            {/* the draggable AAA mark */}
            <g
              transform={`translate(${design.logo.x * VB_W} ${design.logo.y * VB_H}) scale(${design.logo.scale})`}
              onPointerDown={logoPointerDown}
              onPointerMove={logoPointerMove}
              onPointerUp={logoPointerUp}
              className="cursor-grab active:cursor-grabbing"
              aria-label={t("pages.creator.logoAria")}
              role="button"
            >
              <rect x={-34} y={-16} width={68} height={30} fill="transparent" />
              <path
                d="M-30 6 L-18 6 L-10 -8 L-3 7 L4 -10 L11 7 L18 -5 L25 6 L30 6"
                fill="none"
                stroke={design.logo.color}
                strokeWidth={design.logo.style === "embroidered" ? 3.4 : 2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={design.logo.style === "embroidered" ? "2.5 1.6" : undefined}
                opacity={design.logo.style === "painted" ? 0.88 : 1}
              />
            </g>
          </svg>

          <p className="font-typewriter mt-2.5 flex items-baseline justify-between text-[9px] uppercase tracking-[0.18em] text-ink/70">
            <span>{t("pages.creator.oneOfOne", { label: def.label })}</span>
            <span>{t("pages.creator.selected", { label: def.zones[activeZone]?.label ?? "" })}</span>
          </p>
        </div>

        {/* the realistic mockup — exact match to the design, live beside the editor */}
        <MockupPreview design={design} />
        </div>
        )}
      </div>

      {/* ----------------------------- controls ----------------------------- */}
      <div className="flex flex-col gap-7">
        {/* ✶ borrow a palette from a real piece */}
        <section>
          <StepTitle no="✶">{t("pages.creator.step.palette")}</StepTitle>
          <div className="mt-2.5 flex gap-2.5 overflow-x-auto pb-2">
            {inspirations.map((insp) => (
              <button
                key={insp.slug}
                type="button"
                onClick={() => setDesign((d) => applyPalette(d, insp.colors, insp.name))}
                className={cn(
                  "group w-[88px] shrink-0 border bg-paper p-1.5 text-left shadow-paper transition-transform hover:-translate-y-0.5",
                  design.inspiration === insp.name ? "border-ink" : "border-ink/15",
                )}
                title={t("pages.creator.usePalette", { name: insp.name })}
              >
                {insp.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={insp.image} alt="" className="aspect-square w-full object-cover mix-blend-multiply" loading="lazy" />
                )}
                <span className="mt-1 flex gap-0.5">
                  {insp.colors.slice(0, 5).map((c) => (
                    <span key={c} className="h-2 flex-1" style={{ backgroundColor: c }} />
                  ))}
                </span>
                <span className="font-typewriter mt-1 block truncate text-[7.5px] uppercase tracking-[0.08em] text-ink/70">
                  {insp.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 01 base */}
        <section>
          <StepTitle no="01">{t("pages.creator.step.base")}</StepTitle>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {BASES.map((b) => (
              <button
                key={b.key}
                type="button"
                data-active={design.base === b.key}
                onClick={() => switchBase(b.key)}
                className="chip-ink font-typewriter px-3.5 py-1.5 text-[10px] uppercase tracking-[0.14em]"
              >
                {b.label} · {formatPrice(b.basePrice)}
              </button>
            ))}
          </div>
          {isSneaker && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="font-typewriter text-[9px] uppercase tracking-[0.18em] text-ink/70">{t("pages.creator.model")}</span>
              {SHOE_MODELS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  data-active={design.shoeModel === m.key}
                  onClick={() => switchShoe(m.key)}
                  className="chip-ink font-typewriter px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]"
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* 02 colours */}
        <section>
          <StepTitle no="02">{t("pages.creator.step.paint")}</StepTitle>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {parts.map((p) => (
              <button
                key={p.key}
                type="button"
                data-active={activeKey === p.key}
                onClick={() => selectPart(p.key)}
                className="chip-ink font-typewriter inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]"
              >
                <span className="h-3 w-3 rounded-full border border-ink/30" style={{ backgroundColor: p.color }} aria-hidden />
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={t("pages.creator.swatchWall")}>
            {palette.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => paint(c)}
                aria-label={t("pages.creator.paintColor", { color: c })}
                className={cn(
                  "h-7 w-7 rounded-full border transition-transform hover:scale-110 active:scale-95",
                  activeColor === c ? "border-ink ring-2 ring-lime" : "border-ink/25",
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={surprise}
              className="chip-lime font-typewriter px-3.5 py-1.5 text-[9.5px] uppercase tracking-[0.16em]"
            >
              ✶ {t("pages.creator.surprise")}
            </button>
            <label className="font-typewriter flex cursor-pointer items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-ink/70">
              + {t("pages.creator.anyColour")}
              <input
                type="color"
                aria-label={t("pages.creator.customColour")}
                value={activeColor ?? "#cccccc"}
                onChange={(e) => paint(e.target.value)}
                className="h-7 w-9 cursor-pointer rounded border border-ink/25 bg-transparent p-0.5"
              />
            </label>
          </div>
          {design.inspiration && (
            <HandNote rot={-1.5} className="ml-3 inline-block text-[15px]">
              {t("pages.creator.paletteBorrowed", { name: design.inspiration })}
            </HandNote>
          )}
        </section>

        {/* 03 fabric */}
        <section>
          <StepTitle no="03">{t("pages.creator.step.fabric")}</StepTitle>
          <div className="mt-2.5 flex flex-col gap-1.5">
            {def.fabrics.map((f) => (
              <label
                key={f.key}
                className={cn(
                  "font-typewriter flex cursor-pointer items-baseline gap-2.5 border px-3 py-2 text-[10.5px] tracking-[0.04em] transition-colors",
                  design.fabric === f.key ? "border-ink bg-ink/[0.05] text-ink" : "border-ink/20 text-ink/65 hover:border-ink/45",
                )}
              >
                <input
                  type="radio"
                  name="fabric"
                  className="sr-only"
                  checked={design.fabric === f.key}
                  onChange={() => setDesign((d) => ({ ...d, fabric: f.key }))}
                />
                <span aria-hidden>{design.fabric === f.key ? "◉" : "○"}</span>
                <span className="flex-1">{f.label}</span>
                <span className="shrink-0 text-ink/70">
                  {f.premium === 0 ? t("pages.creator.included") : `${f.premium > 0 ? "+" : "−"}${formatPrice(Math.abs(f.premium))}`}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* pattern & graphics */}
        <section>
          <StepTitle no="✦">{t("pages.creator.step.pattern")}</StepTitle>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {PATTERNS.map((p) => (
              <button
                key={p.key}
                type="button"
                data-active={design.pattern.type === p.key}
                onClick={() => setPattern({ type: p.key })}
                className="chip-ink font-typewriter px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]"
              >
                {p.label}
              </button>
            ))}
          </div>
          {design.pattern.type !== "solid" && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5" role="group" aria-label={t("pages.creator.patternColour")}>
                {["#26221a", "#f5f5f0", "#a6db1e", "#c0392b", "#2d6cdf", "#e8731a"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setPattern({ color: c })}
                    aria-label={t("pages.creator.patternColourVal", { color: c })}
                    className={cn(
                      "h-6 w-6 rounded-full border transition-transform hover:scale-110",
                      design.pattern.color === c ? "border-ink ring-2 ring-lime" : "border-ink/25",
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  aria-label={t("pages.creator.customPatternColour")}
                  value={design.pattern.color}
                  onChange={(e) => setPattern({ color: e.target.value })}
                  className="h-6 w-8 cursor-pointer rounded border border-ink/25 bg-transparent p-0.5"
                />
              </div>
              <label className="font-typewriter flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-ink/70">
                {t("pages.creator.scale")}
                <input
                  type="range"
                  min={0.5}
                  max={2.5}
                  step={0.1}
                  value={design.pattern.scale}
                  onChange={(e) => setPattern({ scale: Number(e.target.value) })}
                  className="h-1 w-20 accent-[#26221a]"
                />
              </label>
              <label className="font-typewriter flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-ink/70">
                {t("pages.creator.angle")}
                <input
                  type="range"
                  min={0}
                  max={90}
                  step={5}
                  value={design.pattern.angle}
                  onChange={(e) => setPattern({ angle: Number(e.target.value) })}
                  className="h-1 w-20 accent-[#26221a]"
                />
              </label>
            </div>
          )}
          <HandNote rot={-1.5} className="mt-2 inline-block text-[14px]">
            {t("pages.creator.patternHint")}
          </HandNote>
        </section>

        {/* 04 size */}
        <section>
          <StepTitle no="04">{t("pages.creator.step.size")}</StepTitle>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {def.sizes.map((s) => (
              <button
                key={s}
                type="button"
                data-active={design.size === s}
                onClick={() => setDesign((d) => ({ ...d, size: s }))}
                className="chip-ink font-typewriter px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]"
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        {/* 05 cuts */}
        <section>
          <StepTitle no="05">{t("pages.creator.step.cuts")}</StepTitle>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {def.cuts.map((c) => (
              <button
                key={c.key}
                type="button"
                data-active={design.cuts.includes(c.key)}
                onClick={() => toggleCut(c.key)}
                className="chip-ink font-typewriter px-3 py-1.5 text-[10px] uppercase tracking-[0.1em]"
              >
                {design.cuts.includes(c.key) ? "✕ " : "+ "}
                {c.label} · {formatPrice(c.fee)}
              </button>
            ))}
          </div>
        </section>

        {/* 06 logo */}
        <section>
          <StepTitle no="06">{t("pages.creator.step.logo")}</StepTitle>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {LOGO_STYLES.map((l) => (
              <button
                key={l.key}
                type="button"
                data-active={design.logo.style === l.key}
                onClick={() => setDesign((d) => ({ ...d, logo: { ...d.logo, style: l.key } }))}
                className="chip-ink font-typewriter px-3 py-1.5 text-[10px] uppercase tracking-[0.1em]"
              >
                {l.label}
                {l.fee > 0 && ` +${formatPrice(l.fee)}`}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="flex gap-1.5" role="group" aria-label={t("pages.creator.logoColour")}>
              {["#26221a", "#f5f5f0", "#a6db1e", "#c0392b", "#2d6cdf", "#e8731a"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setDesign((d) => ({ ...d, logo: { ...d.logo, color: c } }))}
                  aria-label={t("pages.creator.logoColourVal", { color: c })}
                  className={cn(
                    "h-6 w-6 rounded-full border transition-transform hover:scale-110",
                    design.logo.color === c ? "border-ink ring-2 ring-lime" : "border-ink/25",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <label className="font-typewriter flex flex-1 items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-ink/70">
              {t("pages.creator.scale")}
              <input
                type="range"
                min={0.25}
                max={2.4}
                step={0.05}
                value={design.logo.scale}
                onChange={(e) => setLogo({ scale: Number(e.target.value) })}
                className="h-1 min-w-0 flex-1 accent-[#26221a]"
              />
            </label>
            <input
              type="color"
              aria-label={t("pages.creator.customLogoColour")}
              value={design.logo.color}
              onChange={(e) => setLogo({ color: e.target.value })}
              className="h-6 w-8 cursor-pointer rounded border border-ink/25 bg-transparent p-0.5"
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <label className="font-typewriter flex flex-col gap-1 text-[8.5px] uppercase tracking-[0.12em] text-ink/70">
              {t("pages.creator.move")}
              <input type="range" min={0.02} max={0.98} step={0.01} value={design.logo.x} onChange={(e) => setLogo({ x: Number(e.target.value) })} className="h-1 accent-[#26221a]" />
            </label>
            <label className="font-typewriter flex flex-col gap-1 text-[8.5px] uppercase tracking-[0.12em] text-ink/70">
              {t("pages.creator.height")}
              <input type="range" min={0.02} max={0.98} step={0.01} value={design.logo.y} onChange={(e) => setLogo({ y: Number(e.target.value) })} className="h-1 accent-[#26221a]" />
            </label>
            <label className="font-typewriter flex flex-col gap-1 text-[8.5px] uppercase tracking-[0.12em] text-ink/70">
              {t("pages.creator.rotate")}
              <input type="range" min={-45} max={45} step={1} value={design.logo.rotation} onChange={(e) => setLogo({ rotation: Number(e.target.value) })} className="h-1 accent-[#26221a]" />
            </label>
          </div>
        </section>

        {/* receipt */}
        <section className="relative bg-paper p-4 shadow-paper">
          <Tape className="-top-2.5 left-1/2 h-5 w-14 -translate-x-1/2 rotate-1" />
          <h3 className="font-typewriter text-[10px] uppercase tracking-[0.24em] text-ink/70">
            {t("pages.creator.priceTitle")}
          </h3>
          <dl className="mt-2.5">
            {lines.map((l) => (
              <div key={l.label} className="flex items-baseline text-[10.5px] leading-[1.9]">
                <dt className="font-typewriter min-w-0 flex-shrink truncate uppercase tracking-[0.06em] text-ink/65">
                  {l.label}
                </dt>
                <span className="leader-dots" aria-hidden />
                <dd className="font-typewriter shrink-0 text-ink">{formatPrice(l.amount)}</dd>
              </div>
            ))}
          </dl>
          <div className="relative mt-3 flex items-baseline justify-between border-t border-ink/20 pt-2.5">
            <span className="font-typewriter text-[10px] uppercase tracking-[0.22em] text-ink/70">{t("pages.creator.estTotal")}</span>
            <span className="relative px-3">
              <CircleDoodle className="absolute -inset-x-1 -inset-y-1.5 h-[calc(100%+12px)] w-[calc(100%+8px)]" />
              <span className="font-typewriter relative text-[22px] tracking-[0.04em] text-ink">{formatPrice(total)}</span>
            </span>
          </div>
          <p className="font-typewriter mt-2 text-[8.5px] uppercase tracking-[0.12em] text-ink/70">
            {t("pages.creator.finalQuote")}
          </p>
        </section>

        <p className="font-typewriter mb-2 text-[8.5px] leading-[1.5] tracking-[0.06em] text-ink/70">
          {t("pages.creator.rights")}
        </p>

        {/* actions */}
        <div className="flex flex-wrap items-center gap-3">
          <a href={mailtoHref} className="chip-lime font-typewriter px-5 py-2.5 text-[10px] uppercase tracking-[0.18em]">
            {t("pages.creator.sendStudio")}
          </a>
          <button
            type="button"
            onClick={downloadSketch}
            className="chip-ink font-typewriter px-5 py-2.5 text-[10px] uppercase tracking-[0.18em]"
          >
            {t("pages.creator.downloadSketch")}
          </button>
          <button
            type="button"
            onClick={() => {
              setDesign(defaultDesign(design.base));
              setActiveZone(0);
            }}
            className="font-typewriter text-[9px] uppercase tracking-[0.16em] text-ink/70 underline-offset-2 hover:text-ink hover:underline"
          >
            {t("pages.creator.startOver")}
          </button>
        </div>
      </div>
    </div>
  );
}

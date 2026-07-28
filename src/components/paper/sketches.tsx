import { cn } from "@/lib/utils";

/* Technical flats — the artist's working drawings that sit beside the shop
 * intro, annotated in handwriting with dashed leader lines, the way a maker
 * notes construction details in their workbook. Static SVG; the strokes
 * draw themselves on once via the .sketch-animate CSS. */

function Label({
  x,
  y,
  children,
  anchor = "start",
}: {
  x: number;
  y: number;
  children: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      className="fill-ink/70"
      style={{ font: "600 11px var(--font-script), cursive" }}
    >
      {children}
    </text>
  );
}

export function SketchHoodie({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 150" className={cn("w-full", className)} aria-hidden="true">
      <g className="sketch-stroke" strokeWidth="1.7">
        {/* hood */}
        <path d="M88 38 C88 18 132 18 132 38 C126 33 94 33 88 38 Z" />
        <path d="M96 36 C98 26 122 26 124 36" />
        {/* shoulders + sleeves */}
        <path d="M88 38 L60 50 L48 102 L66 108 L74 70" />
        <path d="M132 38 L160 50 L172 102 L154 108 L146 70" />
        {/* body */}
        <path d="M74 60 L72 124 C90 130 130 130 148 124 L146 60" />
        {/* kangaroo pocket */}
        <path d="M92 96 L128 96 L124 118 L96 118 Z" />
        {/* drawcords */}
        <path d="M104 40 C103 48 105 54 102 60 M116 40 C117 48 115 54 118 60" />
        {/* ribbed hem */}
        <path d="M76 121 L78 128 M86 123 L87 130 M96 124 L97 131 M108 125 L108 132 M120 124 L121 131 M132 123 L133 130 M142 121 L144 128" strokeWidth="1" />
      </g>
      <g className="sketch-leader" strokeWidth="1">
        <path d="M128 100 C150 96 166 88 186 84" />
        <path d="M64 56 C46 48 40 44 28 40" />
        <path d="M110 28 C112 18 116 14 122 8" />
      </g>
      <Label x={188} y={84}>hand-sewn pocket</Label>
      <Label x={26} y={38} anchor="end">drop shoulder</Label>
      <Label x={124} y={8}>double hood</Label>
    </svg>
  );
}

export function SketchTrackPants({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 150" className={cn("w-full", className)} aria-hidden="true">
      <g className="sketch-stroke" strokeWidth="1.7">
        {/* waistband */}
        <path d="M76 22 L144 22 L142 34 L78 34 Z" />
        <path d="M104 27 C106 30 114 30 116 27" strokeWidth="1.2" />
        {/* legs */}
        <path d="M78 34 L70 118 L92 120 L104 58 L116 120 L138 118 L142 34" />
        {/* cuffs */}
        <path d="M68 118 L94 121 M114 121 L140 118" />
        <path d="M72 124 L90 126 M118 126 L136 124" strokeWidth="1" />
        {/* side stripe */}
        <path d="M82 36 L76 114" strokeDasharray="5 4" strokeWidth="1.2" />
      </g>
      <g className="sketch-leader" strokeWidth="1">
        <path d="M142 28 C160 24 168 22 184 20" />
        <path d="M78 80 C60 84 52 88 38 94" />
      </g>
      <Label x={186} y={20}>elastic + cord</Label>
      <Label x={36} y={96} anchor="end">tapered leg</Label>
    </svg>
  );
}

export function SketchCap({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={cn("w-full", className)} aria-hidden="true">
      <g className="sketch-stroke" strokeWidth="1.7">
        {/* crown */}
        <path d="M62 76 C62 40 158 40 158 76" />
        {/* panels */}
        <path d="M110 44 L110 76 M86 50 C90 58 92 66 92 76 M134 50 C130 58 128 66 128 76" strokeWidth="1.2" />
        {/* button */}
        <path d="M106 42 C108 40 112 40 114 42" />
        {/* brim */}
        <path d="M62 76 C58 78 50 80 44 86 C58 96 96 98 122 92 C140 88 154 82 158 76 C130 70 86 70 62 76 Z" />
        {/* AAA mark on front panel */}
        <path d="M94 64 L100 54 L106 64 L112 54 L118 64" strokeWidth="1.3" />
      </g>
      <g className="sketch-leader" strokeWidth="1">
        <path d="M120 58 C144 50 156 44 174 38" />
        <path d="M52 88 C40 96 34 100 24 104" />
      </g>
      <Label x={176} y={38}>embroidered mark</Label>
      <Label x={22} y={108} anchor="end">painted brim</Label>
    </svg>
  );
}

export function SketchSneaker({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 130" className={cn("w-full", className)} aria-hidden="true">
      <g className="sketch-stroke" strokeWidth="1.7">
        {/* sole */}
        <path d="M28 102 C30 96 38 94 60 94 L182 96 C192 96 196 102 192 108 C160 114 60 114 36 110 C30 109 27 106 28 102 Z" />
        <path d="M36 104 L184 102" strokeWidth="1" strokeDasharray="3 4" />
        {/* hi-top upper */}
        <path d="M60 94 C58 64 62 38 74 30 C88 22 102 28 108 40 C118 58 138 74 168 82 C178 85 184 90 182 96" />
        {/* collar */}
        <path d="M74 30 C82 36 94 38 102 34" />
        {/* toe cap */}
        <path d="M150 96 C158 86 172 84 182 90" strokeWidth="1.3" />
        {/* laces */}
        <path d="M82 42 L104 48 M80 54 L106 60 M80 66 L110 72 M82 78 L116 84" strokeWidth="1.3" />
        {/* AAA waveform on the quarter */}
        <path d="M118 88 L126 78 L132 88 L138 78 L144 88" strokeWidth="1.3" />
      </g>
      <g className="sketch-leader" strokeWidth="1">
        <path d="M130 82 C146 70 154 62 166 52" />
        <path d="M58 80 C44 74 38 70 28 64" />
        <path d="M186 102 C196 100 200 98 208 94" strokeWidth="1" />
      </g>
      <Label x={168} y={50}>hand-painted panel</Label>
      <Label x={26} y={60} anchor="end">sealed + flexed</Label>
      <Label x={208} y={92} anchor="end">stitched sole</Label>
    </svg>
  );
}

export function SketchSwatches({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 120" className={cn("w-full", className)} aria-hidden="true">
      <g className="sketch-stroke" strokeWidth="1.5">
        <rect x="30" y="22" width="34" height="34" />
        <rect x="72" y="22" width="34" height="34" />
        <rect x="30" y="64" width="34" height="34" />
        <rect x="72" y="64" width="34" height="34" />
        {/* hatch fills */}
        <path d="M34 50 L58 26 M40 54 L62 32" strokeWidth="0.9" />
        <path d="M76 26 L102 52 M76 38 L96 56" strokeWidth="0.9" />
        <path d="M34 68 H60 M34 76 H60 M34 84 H60 M34 92 H60" strokeWidth="0.9" />
        <path d="M78 70 C84 66 92 74 98 70 M78 80 C84 76 92 84 98 80 M78 90 C84 86 92 94 98 90" strokeWidth="0.9" />
      </g>
      <g
        className="fill-ink/75"
        style={{ font: "400 9.5px var(--font-typewriter), monospace", letterSpacing: "0.08em" }}
      >
        <text x={126} y={32}>SWATCHES</text>
        <text x={126} y={52}>SIZES</text>
        <text x={126} y={68}>XS S M L XL</text>
        <text x={126} y={82}>US 7 — US 12</text>
        <text x={126} y={102}>52 cm ↔</text>
      </g>
      <g className="sketch-leader" strokeWidth="1">
        <path d="M108 40 L122 30" />
      </g>
    </svg>
  );
}

function SketchBlock({
  no,
  title,
  children,
  className,
}: {
  no: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("flex flex-col", className)}>
      <figcaption className="font-typewriter mb-1 flex items-baseline gap-2 text-[10px] uppercase tracking-[0.16em] text-ink/65">
        <span className="border-b border-ink/40 pb-0.5">{title}</span>
      </figcaption>
      {children}
      <span className="font-typewriter mt-1 self-end text-[9px] uppercase tracking-[0.14em] text-ink/70">
        {no}
      </span>
    </figure>
  );
}

/** The composed board of working drawings for the shop hero. */
export function SketchBoard({ className }: { className?: string }) {
  return (
    <div className={cn("sketch-animate relative", className)} style={{ "--sketch-len": 900 } as React.CSSProperties}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-7">
        <SketchBlock no="Nº 01 — Oversized" title="Studio Hoodie">
          <SketchHoodie />
        </SketchBlock>
        <SketchBlock no="Nº 02 — Tapered" title="Studio Track">
          <SketchTrackPants />
        </SketchBlock>
        <SketchBlock no="Nº 03 — Six-panel" title="The Crew Cap">
          <SketchCap />
        </SketchBlock>
        <SketchBlock no="Nº 04 — Hi-top" title="Custom Hi-Top">
          <SketchSneaker />
        </SketchBlock>
      </div>
      <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-4">
        <SketchSwatches className="max-w-[260px]" />
        <span className="font-script ink-underline pr-2 text-[34px] leading-none text-ink/80">
          Arte
        </span>
      </div>
    </div>
  );
}

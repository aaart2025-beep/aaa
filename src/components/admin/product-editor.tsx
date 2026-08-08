"use client";

import * as React from "react";
import type { ContentProduct } from "@/lib/content/types";
import { priceInfo, defaultSizes, categoryMeta, CATEGORIES, type ProductCategory, type ProductViews, type ViewKey } from "@/lib/products";
import { Field, ImageManager, inputCls, formatUSD, isHex, slugify, uploadImage } from "./admin-ui";

/* The product editor: photos, the five studio views, story, sizing, colours
 * and optional spec-sheet overrides — everything one piece needs, top down in
 * the order you'd fill it in. */

export function ProductRow({
  product,
  open,
  onToggle,
  onChange,
  onRemove,
  hidden = false,
  onToggleHidden,
  reorderable = false,
}: {
  product: ContentProduct;
  open: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<ContentProduct>) => void;
  onRemove: () => void;
  /** product is hidden from the live shop */
  hidden?: boolean;
  onToggleHidden?: () => void;
  /** show the drag handle (reordering enabled) */
  reorderable?: boolean;
}) {
  const isDraft = product.images.length === 0 || !product.price;
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white/[0.02] ${hidden ? "border-white/5 opacity-60" : "border-white/10"}`}
    >
      <div className="flex items-center">
        {reorderable && (
          <span
            aria-hidden
            title="Drag to reorder"
            className="cursor-grab select-none px-1.5 text-[15px] leading-none text-neutral-600 active:cursor-grabbing"
          >
            ⠿
          </span>
        )}
        <button onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 p-2.5 text-left hover:bg-white/[0.03]">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
            {product.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-600">no photo</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-medium">{product.name || "Untitled"}</div>
            <div className="text-[12px] text-neutral-500">
              {product.category} · {formatUSD(product.price)}
            </div>
          </div>
          {hidden && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-neutral-400">Hidden</span>}
          {isDraft && (
            <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] text-amber-300">Add photo &amp; price</span>
          )}
          <span className="text-neutral-500">{open ? "▾" : "▸"}</span>
        </button>
        {onToggleHidden && (
          <button
            onClick={onToggleHidden}
            title={hidden ? "Show in shop" : "Hide from shop"}
            className="mr-2 shrink-0 rounded-md border border-white/10 px-2.5 py-1 text-[11px] text-neutral-300 transition hover:bg-white/5"
          >
            {hidden ? "Show" : "Hide"}
          </button>
        )}
      </div>

      {open && (
        <div className="border-t border-white/10 p-4">
          <ProductEditor product={product} onChange={onChange} onRemove={onRemove} />
        </div>
      )}
    </div>
  );
}

export function ProductEditor({
  product,
  onChange,
  onRemove,
}: {
  product: ContentProduct;
  onChange: (patch: Partial<ContentProduct>) => void;
  onRemove: () => void;
}) {
  // Art / home pieces are measured by dimensions instead of wearable sizes.
  const usesDim = Boolean(categoryMeta(product.category).dimensions);
  return (
    <div className="flex flex-col gap-4">
      <ImageManager
        images={product.images}
        onChange={(images) => onChange({ images })}
        note="Main photos (the primary colour). The FIRST photo is the cover — shown on the shop card and opened first on the product page. Reorder with the arrows; drag the zoom slider under a photo to size it (double-click to reset)."
        scales={product.imageScale}
        onScale={(src, scale) => {
          const next = { ...(product.imageScale ?? {}) };
          if (scale === 1) delete next[src];
          else next[src] = scale;
          onChange({ imageScale: Object.keys(next).length ? next : undefined });
        }}
      />

      <Field label="Product name">
        <input
          value={product.name}
          onChange={(e) => onChange({ name: e.target.value, slug: product.slug || slugify(e.target.value) })}
          className={inputCls}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Web address (slug)" hint={`/shop/${product.slug || "…"}`}>
          <input value={product.slug} onChange={(e) => onChange({ slug: slugify(e.target.value) })} className={inputCls} />
        </Field>
        <Field label="Type">
          <select
            value={product.category}
            onChange={(e) => onChange({ category: e.target.value as ProductCategory })}
            className={`${inputCls} bg-neutral-900`}
          >
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.key}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Price (₪)">
          <input type="number" value={product.price} onChange={(e) => onChange({ price: Number(e.target.value) || 0 })} className={inputCls} />
        </Field>
        <DiscountField product={product} onChange={onChange} />
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/[0.015] px-3 py-2.5 sm:flex-row sm:flex-wrap sm:gap-5">
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-neutral-300">
          <input
            type="checkbox"
            checked={!!product.soldOut}
            onChange={(e) => {
              const on = e.target.checked;
              // Marking sold out auto-marks every size unavailable; clearing it frees them.
              const universe = (product.sizes?.length ? product.sizes : defaultSizes(product.category)).filter(
                (s) => !/^one\b/i.test(s),
              );
              onChange({ soldOut: on || undefined, soldOutSizes: on && universe.length ? universe : undefined });
            }}
            className="h-4 w-4 accent-red-500"
          />
          Sold out <span className="text-neutral-500">— red “sold out” stamp; all sizes marked unavailable; can’t be bought</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-neutral-300">
          <input
            type="checkbox"
            checked={!!product.onePiece}
            onChange={(e) => onChange({ onePiece: e.target.checked || undefined })}
            className="h-4 w-4 accent-amber-400"
          />
          One piece only <span className="text-neutral-500">— shows a “one piece only” mark</span>
        </label>
      </div>

      <Field label="One-line tagline" hint="Shows as the handwritten note under the product title.">
        <input value={product.tagline} onChange={(e) => onChange({ tagline: e.target.value })} className={inputCls} />
      </Field>
      <Field label="Full description">
        <textarea value={product.description} onChange={(e) => onChange({ description: e.target.value })} rows={3} className={inputCls} />
      </Field>
      <Field label="Construction notes (one per line)">
        <textarea
          value={product.details.join("\n")}
          onChange={(e) => onChange({ details: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
          rows={3}
          className={inputCls}
        />
      </Field>

      {usesDim ? (
        <DimensionsEditor product={product} onChange={onChange} />
      ) : (
        <Field label="Sizes (one per line)" hint="Leave blank to use this category's default sizes (set in Site → Size Tables). Set just one line for a single size.">
          <div className="flex flex-col gap-2">
            <textarea
              value={(product.sizes ?? []).join("\n")}
              onChange={(e) => onChange({ sizes: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
              rows={3}
              placeholder={defaultSizes(product.category).join("\n") || "XS\nS\nM\nL\nXL"}
              className={inputCls}
            />
            <SizeStock product={product} onChange={onChange} />
          </div>
        </Field>
      )}

      <ColoursSection product={product} onChange={onChange} />

      <AdvancedSection product={product} onChange={onChange} />

      <button
        onClick={() => {
          if (confirm("Delete this product? It’s removed when you Save.")) onRemove();
        }}
        className="mt-1 self-start rounded-lg border border-red-500/30 px-3 py-1.5 text-[12px] text-red-300 hover:bg-red-500/10"
      >
        Delete product
      </button>
    </div>
  );
}

/* ---------------- discount ---------------- */

function DiscountField({
  product,
  onChange,
}: {
  product: ContentProduct;
  onChange: (patch: Partial<ContentProduct>) => void;
}) {
  const pct = product.discount ?? 0;
  const { price: sale, percent } = priceInfo(product);
  return (
    <Field label="Discount (% off)" hint="0 = full price. Only discount from a genuine list price — the struck price must be one this piece actually sells at. Don't inflate it to fake a bigger % off (FTC deceptive-pricing rule).">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={90}
          value={pct || ""}
          placeholder="0"
          onChange={(e) => {
            const n = Math.max(0, Math.min(90, Math.round(Number(e.target.value) || 0)));
            onChange({ discount: n > 0 ? n : undefined });
          }}
          className={inputCls}
        />
        {percent ? (
          <span className="shrink-0 whitespace-nowrap text-[11px] text-lime-300">
            <s className="text-neutral-500">{formatUSD(product.price)}</s> → {formatUSD(sale)}
          </span>
        ) : (
          <span className="shrink-0 text-[11px] text-neutral-600">no sale</span>
        )}
      </div>
    </Field>
  );
}

/* ---------------- per-size stock (drop individual sizes) ---------------- */

function SizeStock({
  product,
  onChange,
}: {
  product: ContentProduct;
  onChange: (patch: Partial<ContentProduct>) => void;
}) {
  const sizes = product.sizes?.length ? product.sizes : defaultSizes(product.category);
  const real = sizes.filter((s) => !/^one\b/i.test(s));
  if (real.length === 0) return null;
  const off = new Set(product.soldOutSizes ?? []);
  const toggle = (s: string) => {
    const next = new Set(off);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    onChange({ soldOutSizes: next.size ? [...next] : undefined });
  };
  return (
    <div>
      <span className="text-[11px] text-neutral-500">
        Tap a size to mark it sold out — it stays visible on the product but crossed-out and not selectable.
      </span>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {real.map((s) => {
          const gone = off.has(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => toggle(s)}
              title={gone ? "Sold out — tap to restore" : "In stock — tap to mark sold out"}
              className={`rounded-md border px-2.5 py-1 text-[12px] transition ${
                gone ? "border-red-500/40 text-red-300 line-through" : "border-white/15 text-neutral-300 hover:border-white/40"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- the five studio views ---------------- */

const VIEW_SLOTS: { key: ViewKey; label: string; fallback?: string }[] = [
  { key: "front", label: "Front", fallback: "1st photo" },
  { key: "back", label: "Back", fallback: "2nd photo" },
  { key: "sideLeft", label: "Side · L" },
  { key: "sideRight", label: "Side · R" },
  { key: "fabric", label: "Fabric", fallback: "auto close-up" },
];

function FiveViews({
  product,
  onChange,
}: {
  product: ContentProduct;
  onChange: (patch: Partial<ContentProduct>) => void;
}) {
  const views = product.views ?? {};
  const [busyKey, setBusyKey] = React.useState<ViewKey | null>(null);

  const setView = (key: ViewKey, src: string | undefined) => {
    const next: ProductViews = { ...views };
    if (src) next[key] = src;
    else delete next[key];
    onChange({ views: Object.keys(next).length ? next : undefined });
  };

  async function uploadInto(key: ViewKey, files: FileList | null) {
    if (!files?.[0]) return;
    setBusyKey(key);
    const r = await uploadImage(files[0]);
    setBusyKey(null);
    if (r.ok && r.path) setView(key, r.path);
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wider text-neutral-500">The five views</span>
        <span className="text-[11px] text-neutral-600">
          Front · Back · both Sides · a fabric close-up. Empty slots show a tidy “to be photographed” note on the site.
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {VIEW_SLOTS.map((slot) => {
          const src =
            views[slot.key] ??
            (slot.key === "front" ? product.images[0] : slot.key === "back" ? product.images[1] : slot.key === "fabric" ? product.images[0] : undefined);
          const isExplicit = Boolean(views[slot.key]);
          return (
            <div key={slot.key} className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-neutral-500">{slot.label}</span>
              <div className="relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-neutral-800">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="" className={`h-full w-full object-cover ${!isExplicit ? "opacity-55" : ""}`} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-1 text-center text-[9px] leading-tight text-neutral-600">
                    to be photographed
                  </div>
                )}
                {!isExplicit && src && (
                  <span className="absolute inset-x-0 bottom-0 bg-black/65 px-1 py-0.5 text-center text-[8.5px] text-neutral-400">
                    {slot.fallback}
                  </span>
                )}
                {isExplicit && (
                  <button
                    onClick={() => setView(slot.key, undefined)}
                    className="absolute right-1 top-1 rounded bg-black/70 px-1.5 text-[11px] text-red-300"
                    title="Clear — fall back to automatic"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="flex gap-1">
                {product.images.length > 0 && (
                  <select
                    value={views[slot.key] ?? ""}
                    onChange={(e) => setView(slot.key, e.target.value || undefined)}
                    className="min-w-0 flex-1 rounded border border-white/10 bg-neutral-900 px-1 py-1 text-[10px] text-neutral-300 outline-none"
                    title="Pick from this product's photos"
                  >
                    <option value="">{slot.fallback ? `auto (${slot.fallback})` : "— none —"}</option>
                    {product.images.map((img, i) => (
                      <option key={img + i} value={img}>
                        photo {i + 1}
                      </option>
                    ))}
                  </select>
                )}
                <label
                  className="shrink-0 cursor-pointer rounded border border-dashed border-white/20 px-1.5 py-1 text-[10px] text-neutral-400 hover:border-amber-300/50 hover:text-white"
                  title="Upload a photo straight into this view"
                >
                  {busyKey === slot.key ? "…" : "↑"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      uploadInto(slot.key, e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- spec sheet overrides ---------------- */

function SpecOverrides({
  product,
  onChange,
}: {
  product: ContentProduct;
  onChange: (patch: Partial<ContentProduct>) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const set = (key: "garment" | "fit" | "fabric" | "print" | "date", v: string) =>
    onChange({ [key]: v.trim() ? v : undefined });

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.015]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-[12px] text-neutral-400 hover:text-white"
      >
        <span>
          Spec sheet overrides <span className="text-neutral-600">— Garment / Fit / Fabric / Print / Date (auto-filled when blank)</span>
        </span>
        <span>{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="grid gap-3 border-t border-white/10 p-3 sm:grid-cols-5">
          {(["garment", "fit", "fabric", "print", "date"] as const).map((key) => (
            <Field key={key} label={key[0].toUpperCase() + key.slice(1)}>
              <input
                value={product[key] ?? ""}
                placeholder="auto"
                onChange={(e) => set(key, e.target.value)}
                className={inputCls}
              />
            </Field>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- dimensions (art / home pieces) ---------------- */

function DimensionsEditor({
  product,
  onChange,
}: {
  product: ContentProduct;
  onChange: (patch: Partial<ContentProduct>) => void;
}) {
  const d = product.dimensions ?? {};
  const set = (key: "height" | "width" | "depth", v: string) => {
    const next = { ...d };
    const val = v.trim();
    if (val) next[key] = val;
    else delete next[key];
    onChange({ dimensions: Object.keys(next).length ? next : undefined });
  };
  const fields: { key: "height" | "width" | "depth"; label: string; ph: string }[] = [
    { key: "height", label: "Height", ph: "40 cm" },
    { key: "width", label: "Width", ph: "30 cm" },
    { key: "depth", label: "Depth (optional)", ph: "12 cm" },
  ];
  return (
    <Field label="Dimensions" hint="Shown on the product page instead of sizes for this category. Use any unit (e.g. “40 cm”).">
      <div className="grid gap-3 sm:grid-cols-3">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1 block text-[11px] uppercase tracking-wider text-neutral-500">{f.label}</label>
            <input value={d[f.key] ?? ""} placeholder={f.ph} onChange={(e) => set(f.key, e.target.value)} className={inputCls} />
          </div>
        ))}
      </div>
    </Field>
  );
}

/* ---------------- colours (each colour = its own photos, sizes & stock) ---------------- */

function ColoursSection({
  product,
  onChange,
}: {
  product: ContentProduct;
  onChange: (patch: Partial<ContentProduct>) => void;
}) {
  const colors = product.colors ?? [];
  const images = product.colorImages ?? {};
  const sizesMap = product.colorSizes ?? {};
  const soldOutMap = product.colorSoldOut ?? {};
  const usesDim = Boolean(categoryMeta(product.category).dimensions);
  const universe = (product.sizes?.length ? product.sizes : defaultSizes(product.category)).filter((s) => !/^one\b/i.test(s));

  const [hex, setHex] = React.useState("#000000");
  const [name, setName] = React.useState("");

  const setColors = (next: string[]) => onChange({ colors: next.length ? next : undefined });
  const addColor = (c: string) => {
    const v = c.trim();
    if (!v || colors.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    setColors([...colors, v]);
  };
  const removeColor = (color: string) => {
    const nextColors = colors.filter((c) => c !== color);
    const patch: Partial<ContentProduct> = { colors: nextColors.length ? nextColors : undefined };
    if (images[color] !== undefined) {
      const n = { ...images };
      delete n[color];
      patch.colorImages = Object.keys(n).length ? n : undefined;
    }
    if (sizesMap[color] !== undefined) {
      const n = { ...sizesMap };
      delete n[color];
      patch.colorSizes = Object.keys(n).length ? n : undefined;
    }
    if (soldOutMap[color] !== undefined) {
      const n = { ...soldOutMap };
      delete n[color];
      patch.colorSoldOut = Object.keys(n).length ? n : undefined;
    }
    onChange(patch);
  };
  const setImagesFor = (color: string, imgs: string[]) => {
    const n = { ...images };
    if (imgs.length) n[color] = imgs;
    else delete n[color];
    onChange({ colorImages: Object.keys(n).length ? n : undefined });
  };
  const setSoldOutFor = (color: string, v: boolean) => {
    const n = { ...soldOutMap };
    if (v) n[color] = true;
    else delete n[color];
    onChange({ colorSoldOut: Object.keys(n).length ? n : undefined });
  };
  const availFor = (color: string): Set<string> => {
    const entry = sizesMap[color];
    return entry && entry.length ? new Set(entry) : new Set(universe);
  };
  const toggleSize = (color: string, s: string) => {
    const set = availFor(color);
    if (set.has(s)) set.delete(s);
    else set.add(s);
    const list = universe.filter((x) => set.has(x));
    const n = { ...sizesMap };
    if (list.length === 0 || list.length === universe.length) delete n[color];
    else n[color] = list;
    onChange({ colorSizes: Object.keys(n).length ? n : undefined });
  };
  const onScaleImage = (src: string, scale: number) => {
    const next = { ...(product.imageScale ?? {}) };
    if (scale === 1) delete next[src];
    else next[src] = scale;
    onChange({ imageScale: Object.keys(next).length ? next : undefined });
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="mb-1 text-[13px] font-medium text-neutral-200">Colours</div>
      <p className="mb-3 text-[11px] text-neutral-500">
        Each colour is its own version — its photos, available sizes and stock. The first colour is shown on the shop card and
        opens first. Names (e.g. “Black”) read best in the cart. Leave empty for a single-colour piece.
      </p>

      {/* add a colour */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          title="Pick a colour"
          className="h-9 w-12 cursor-pointer rounded border border-white/15 bg-transparent p-0.5"
        />
        <button onClick={() => addColor(hex)} className="rounded-lg border border-white/15 px-3 py-1.5 text-[12px] text-neutral-200 transition hover:bg-white/5">
          Add swatch
        </button>
        <span className="text-[11px] text-neutral-600">or</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addColor(name);
              setName("");
            }
          }}
          placeholder="Named colour (e.g. Black)"
          className={`${inputCls} max-w-[180px]`}
        />
        <button
          onClick={() => {
            addColor(name);
            setName("");
          }}
          className="rounded-lg border border-white/15 px-3 py-1.5 text-[12px] text-neutral-200 transition hover:bg-white/5"
        >
          Add name
        </button>
      </div>

      {colors.length === 0 ? (
        <p className="text-[12px] text-neutral-500">No colours yet — this piece uses its main photos and sizes, with no colour picker.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {colors.map((color, i) => (
            <details key={color} open={i === 0} className="rounded-lg border border-white/10 bg-white/[0.015]">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2">
                {isHex(color) ? (
                  <span className="h-5 w-5 rounded-full border border-white/20" style={{ backgroundColor: color }} />
                ) : (
                  <span className="h-5 w-5 rounded-full border border-dashed border-white/25" />
                )}
                <span className="text-[13px] font-medium text-neutral-200">{color}</span>
                {i === 0 && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-neutral-400">Shown first</span>}
                {soldOutMap[color] && <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-300">Sold out</span>}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeColor(color);
                  }}
                  title="Remove colour"
                  className="ml-auto text-[13px] leading-none text-red-300 transition hover:text-red-200"
                >
                  ✕
                </button>
              </summary>
              <div className="flex flex-col gap-3 border-t border-white/10 p-3">
                {i === 0 ? (
                  <p className="text-[12px] leading-relaxed text-neutral-400">
                    This is the <span className="text-neutral-200">primary</span> colour — its photos, sizes and stock are the
                    product&apos;s main ones, edited in <span className="text-neutral-200">Photos</span>,{" "}
                    <span className="text-neutral-200">Sizes</span> and <span className="text-neutral-200">Sold out</span> above.
                    It&apos;s shown on the shop card and opens first.
                  </p>
                ) : (
                  <>
                    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-neutral-300">
                      <input
                        type="checkbox"
                        checked={!!soldOutMap[color]}
                        onChange={(e) => setSoldOutFor(color, e.target.checked)}
                        className="h-4 w-4 accent-red-500"
                      />
                      Sold out in this colour
                    </label>

                    <div>
                      <div className="mb-1 text-[11px] uppercase tracking-wider text-neutral-500">Photos for this colour</div>
                      <ImageManager
                        images={images[color] ?? []}
                        onChange={(imgs) => setImagesFor(color, imgs)}
                        scales={product.imageScale}
                        onScale={onScaleImage}
                        note="Shown when this colour is selected. Reorder with the arrows; drag the zoom slider under a photo to size it. Leave empty to use the main photos."
                      />
                    </div>

                    {!usesDim && universe.length > 0 && (
                      <div>
                        <div className="mb-1 text-[11px] uppercase tracking-wider text-neutral-500">
                          Available sizes {soldOutMap[color] ? "— sold out, all unavailable" : "— tap to switch off"}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {universe.map((s) => {
                            const cSoldOut = !!soldOutMap[color];
                            const on = !cSoldOut && availFor(color).has(s);
                            return (
                              <button
                                key={s}
                                type="button"
                                disabled={cSoldOut}
                                onClick={() => toggleSize(color, s)}
                                title={cSoldOut ? "Sold out in this colour" : on ? "Available — tap to remove" : "Not available — tap to add"}
                                className={`rounded-md border px-2.5 py-1 text-[12px] transition ${
                                  cSoldOut
                                    ? "cursor-not-allowed border-white/10 text-neutral-600 line-through"
                                    : on
                                      ? "border-amber-400/60 bg-amber-400/10 text-amber-200"
                                      : "border-white/15 text-neutral-500 line-through hover:border-white/40"
                                }`}
                              >
                                {s}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- advanced (tucked away to keep the editor tidy) ---------------- */

function AdvancedSection({
  product,
  onChange,
}: {
  product: ContentProduct;
  onChange: (patch: Partial<ContentProduct>) => void;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.015]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-[12px] text-neutral-400 hover:text-white"
      >
        <span>
          Advanced <span className="text-neutral-600">— extra photo angles, spec-sheet overrides, this piece&apos;s own size table</span>
        </span>
        <span>{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="flex flex-col gap-4 border-t border-white/10 p-3">
          <FiveViews product={product} onChange={onChange} />
          <SpecOverrides product={product} onChange={onChange} />
          <SizeGuideOverride product={product} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

/* ---------------- per-product size guide ---------------- */

function SizeGuideOverride({
  product,
  onChange,
}: {
  product: ContentProduct;
  onChange: (patch: Partial<ContentProduct>) => void;
}) {
  const guide = product.sizeGuide ?? { intro: "", rows: [] };
  const rows = guide.rows ?? [];
  const [open, setOpen] = React.useState(rows.length > 0);

  // Write back, keeping in-progress rows so typing/adding works, but dropping
  // the field entirely once there are no rows and no intro — then the product
  // falls back to the site-wide guide. (Blank rows read as "no guide" too.)
  const commit = (next: { intro?: string; rows: { size: string; measure: string }[] }) => {
    const hasRows = next.rows.length > 0;
    const hasIntro = (next.intro ?? "").trim().length > 0;
    onChange({ sizeGuide: hasRows || hasIntro ? { intro: next.intro, rows: next.rows } : undefined });
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.015]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-[12px] text-neutral-400 hover:text-white"
      >
        <span>
          Size guide for this piece{" "}
          <span className="text-neutral-600">— its own measurements pop-up (falls back to the site-wide guide when empty)</span>
        </span>
        <span>{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="flex flex-col gap-3 border-t border-white/10 p-3">
          <Field label="Intro (optional)" hint="A short line shown above this piece's table.">
            <textarea
              value={guide.intro ?? ""}
              onChange={(e) => commit({ ...guide, intro: e.target.value, rows })}
              rows={2}
              className={inputCls}
            />
          </Field>

          <div className="flex flex-col gap-2">
            <div className="hidden grid-cols-[6rem_1fr_2.25rem] gap-2 px-1 text-[11px] uppercase tracking-wider text-neutral-500 sm:grid">
              <span>Size</span>
              <span>Measurements</span>
              <span />
            </div>
            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-[5rem_1fr_2.25rem] items-center gap-2 sm:grid-cols-[6rem_1fr_2.25rem]">
                <input
                  value={r.size}
                  placeholder="M"
                  onChange={(e) => {
                    const rr = rows.map((x, k) => (k === i ? { ...x, size: e.target.value } : x));
                    commit({ ...guide, rows: rr });
                  }}
                  className={inputCls}
                />
                <input
                  value={r.measure}
                  placeholder="Chest 54cm · Length 72cm · Sleeve 63cm"
                  onChange={(e) => {
                    const rr = rows.map((x, k) => (k === i ? { ...x, measure: e.target.value } : x));
                    commit({ ...guide, rows: rr });
                  }}
                  className={inputCls}
                />
                <button
                  onClick={() => commit({ ...guide, rows: rows.filter((_, k) => k !== i) })}
                  title="Remove row"
                  className="rounded-md border border-red-500/30 py-2 text-[12px] text-red-300 transition hover:bg-red-500/10"
                >
                  ✕
                </button>
              </div>
            ))}
            {rows.length === 0 && (
              <p className="text-[13px] text-neutral-500">No custom sizes — this piece uses the site-wide size guide.</p>
            )}
          </div>

          <button
            onClick={() => commit({ ...guide, rows: [...rows, { size: "", measure: "" }] })}
            className="self-start rounded-lg bg-amber-400 px-4 py-2 text-[13px] font-medium text-neutral-900 transition hover:bg-amber-300"
          >
            + Add size
          </button>
        </div>
      )}
    </div>
  );
}

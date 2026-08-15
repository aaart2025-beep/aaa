"use client";

import * as React from "react";

/* Shared primitives for the admin console — inputs, field wrappers, upload. */

export const inputCls =
  "w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] outline-none transition-colors focus:border-white/40";

export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item";
}

export const formatUSD = (n: number) =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(n || 0);

export const isHex = (c: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c.trim());

/* Re-encode + downscale an image to a web-friendly file in the browser. This
 * (a) shrinks huge phone photos so uploads are fast, and (b) converts odd
 * formats (incl. HEIC on Safari) so they actually display.
 *
 * Transparency is preserved: JPEG has no alpha channel, so a see-through PNG
 * saved as JPEG turns its transparent areas BLACK. So anything that isn't
 * already a JPEG is re-encoded to WebP (keeps alpha, still small); photos that
 * were JPEGs (never transparent) stay JPEG. If the browser can't encode WebP,
 * toBlob falls back to PNG — also alpha-safe. Throws if the browser can't decode
 * the file (e.g. HEIC on Chrome) — the caller then uploads the original. */
async function toDisplayableImage(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const MAX = 1600;
  let w = bmp.width;
  let h = bmp.height;
  if (Math.max(w, h) > MAX) {
    const s = MAX / Math.max(w, h);
    w = Math.round(w * s);
    h = Math.round(h * s);
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bmp.close();
    throw new Error("Canvas unavailable");
  }
  // No background fill — leave the canvas transparent so cut-out photos keep it.
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();

  const keepAlpha = file.type !== "image/jpeg" && file.type !== "image/jpg";
  const encode = (type: string, q?: number) =>
    new Promise<Blob | null>((res) => canvas.toBlob(res, type, q));

  let blob = keepAlpha ? await encode("image/webp", 0.92) : await encode("image/jpeg", 0.86);
  // Older Safari can return null for an unsupported type instead of falling back.
  if (!blob && keepAlpha) blob = await encode("image/png");
  if (!blob) blob = await encode("image/jpeg", 0.86);
  if (!blob) throw new Error("Could not encode image");
  return blob;
}

/* Re-encodes the image to a compact JPEG in the browser, then uploads that small
 * file to the server (which stores it on Vercel Blob). Because the JPEG is small
 * (~a few hundred KB) it stays well under Vercel's request limit, so the upload
 * is fast and reliable. Returns the public Blob URL to store on the product. */
export async function uploadImage(file: File): Promise<{ ok: boolean; path?: string; error?: string }> {
  let img: Blob;
  try {
    img = await toDisplayableImage(file);
  } catch {
    return {
      ok: false,
      error: "Couldn't process this image. Please use a JPG, PNG or WEBP (on iPhone: Camera → Formats → Most Compatible).",
    };
  }

  const ext = img.type === "image/webp" ? "webp" : img.type === "image/png" ? "png" : "jpg";
  const fd = new FormData();
  fd.append("file", img, `image.${ext}`);
  try {
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = (await res.json().catch(() => ({}))) as { path?: string; error?: string };
    if (!res.ok || !json.path) return { ok: false, error: json.error ?? "Upload failed" };
    return { ok: true, path: json.path };
  } catch {
    return { ok: false, error: "Upload failed — please check your connection and try again." };
  }
}

export function SectionHeading({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-0.5 text-[13px] text-neutral-400">{desc}</p>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-neutral-300">{label}</span>
      {hint && <span className="-mt-0.5 text-[11px] text-neutral-500">{hint}</span>}
      {children}
    </label>
  );
}

/* ---------------- cross-list drag (collections) ---------------- */

export type ImageDragRef =
  | { kind: "collection"; groupId: string; index: number }
  | { kind: "bank"; src: string };
export interface CollectionDnd {
  /** the image currently being dragged (ref, so dragging doesn't re-render) */
  drag: React.MutableRefObject<ImageDragRef | null>;
  /** drop into a collection: move it from its source, or add it from the bank */
  onCrossDrop: (from: ImageDragRef, toGroupId: string, toIndex: number) => void;
}
export const CollectionDndContext = React.createContext<CollectionDnd | null>(null);

/* ---------------- image manager (products + collections) ---------------- */

export function ImageManager({
  images,
  onChange,
  note,
  groupId,
  scales,
  onScale,
}: {
  images: string[];
  onChange: (images: string[]) => void;
  note?: string;
  /** when set (collections), enables dragging photos between collections */
  groupId?: string;
  /** per-photo display zoom keyed by image src (products only) */
  scales?: Record<string, number>;
  /** setter for a photo's zoom; presence shows the zoom slider on each tile */
  onScale?: (src: string, scale: number) => void;
}) {
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [dragIdx, setDragIdx] = React.useState<number | null>(null);
  const [overIdx, setOverIdx] = React.useState<number | null>(null);

  const dnd = React.useContext(CollectionDndContext);
  const crossEnabled = Boolean(dnd && groupId);

  const move = (from: number, to: number) => {
    if (from === to || from < 0 || from >= images.length) return;
    const arr = [...images];
    const [x] = arr.splice(from, 1);
    arr.splice(Math.max(0, Math.min(to, arr.length)), 0, x);
    onChange(arr);
  };

  /* drag-and-drop reordering (and, for collections, moving between rows / from the bank) */
  const source = (): ImageDragRef | null =>
    crossEnabled
      ? dnd!.drag.current
      : dragIdx != null
        ? { kind: "collection", groupId: groupId ?? "", index: dragIdx }
        : null;

  const onDragStartTile = (e: React.DragEvent, idx: number) => {
    setDragIdx(idx);
    if (crossEnabled) dnd!.drag.current = { kind: "collection", groupId: groupId!, index: idx };
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", String(idx));
    } catch {
      /* some browsers require setData; ignore if it throws */
    }
  };
  const onDragOverTile = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    try {
      e.dataTransfer.dropEffect = "move";
    } catch {
      /* noop */
    }
    if (overIdx !== idx) setOverIdx(idx);
  };
  const dropOnto = (toIndex: number) => {
    const from = source();
    if (from) {
      if (from.kind === "bank") {
        if (crossEnabled) dnd!.onCrossDrop(from, groupId!, toIndex);
      } else if (crossEnabled && from.groupId !== groupId) {
        dnd!.onCrossDrop(from, groupId!, toIndex);
      } else {
        move(from.index, toIndex);
      }
    }
    endDrag();
  };
  const endDrag = () => {
    setDragIdx(null);
    setOverIdx(null);
    if (crossEnabled) dnd!.drag.current = null;
  };

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setErr(null);
    const added: string[] = [];
    const list = Array.from(files);
    for (let i = 0; i < list.length; i++) {
      setProgress(`Uploading ${i + 1} of ${list.length}…`);
      const r = await uploadImage(list[i]);
      if (r.ok && r.path) added.push(r.path);
      else {
        setErr(r.error ?? "Upload failed");
        break;
      }
    }
    setBusy(false);
    setProgress(null);
    if (added.length) onChange([...images, ...added]);
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wider text-neutral-500">Photos</span>
        {note && <span className="text-[11px] text-neutral-600">{note}</span>}
        <span className="text-[11px] text-neutral-600">
          · Drag to reorder{crossEnabled ? " · drag onto another collection to move it" : ""} · first photo shows first (left)
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {images.map((src, idx) => {
          const sc = scales?.[src] ?? 1;
          return (
          <div key={idx} className="flex flex-col gap-1">
            <div
              draggable
              onDragStart={(e) => onDragStartTile(e, idx)}
              onDragOver={(e) => onDragOverTile(e, idx)}
              onDrop={(e) => { e.preventDefault(); dropOnto(idx); }}
              onDragEnd={endDrag}
              className={`group relative aspect-square cursor-grab overflow-hidden rounded-lg border bg-neutral-800 transition-shadow active:cursor-grabbing ${
                overIdx === idx ? "border-amber-300 ring-2 ring-amber-300/70" : "border-white/10"
              } ${dragIdx === idx ? "opacity-40" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                draggable={false}
                style={sc !== 1 ? { transform: `scale(${sc})` } : undefined}
                className="pointer-events-none h-full w-full object-cover transition-transform"
              />
              {idx === 0 && (
                <span className="absolute left-1 top-1 rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-medium text-neutral-900">★ Cover</span>
              )}
              {sc !== 1 && (
                <span className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-amber-200">
                  {Math.round(sc * 100)}%
                </span>
              )}
              {/* Controls stay visible (not hover-only) so delete/reorder work on touch (iPad/phone). */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/60 p-1">
                <div className="flex gap-0.5">
                  <button onClick={() => move(idx, idx - 1)} disabled={idx === 0} className="rounded bg-white/10 px-1.5 text-[12px] text-white disabled:opacity-30" title="Move left">◀</button>
                  <button onClick={() => move(idx, idx + 1)} disabled={idx === images.length - 1} className="rounded bg-white/10 px-1.5 text-[12px] text-white disabled:opacity-30" title="Move right">▶</button>
                </div>
                {idx !== 0 && (
                  <button onClick={() => move(idx, 0)} className="rounded bg-white/10 px-1.5 text-[10px] text-amber-300" title="Make cover">★</button>
                )}
                <button onClick={() => onChange(images.filter((_, k) => k !== idx))} className="rounded bg-white/10 px-1.5 text-[12px] text-red-300" title="Remove">✕</button>
              </div>
            </div>
            {onScale && (
              <div className="flex items-center gap-1.5 px-0.5" title="Zoom this photo on the site (double-click the slider to reset)">
                <span aria-hidden className="text-[10px] leading-none text-neutral-500">🔍</span>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.05}
                  value={sc}
                  onChange={(e) => onScale(src, Number(e.target.value))}
                  onDoubleClick={() => onScale(src, 1)}
                  aria-label="Photo zoom"
                  className="h-1 min-w-0 flex-1 cursor-pointer accent-amber-400"
                />
                <span className="w-9 shrink-0 text-right text-[10px] tabular-nums text-neutral-400">{Math.round(sc * 100)}%</span>
              </div>
            )}
          </div>
          );
        })}

        <label
          onDragOver={(e) => { if (source()) { e.preventDefault(); setOverIdx(images.length); } }}
          onDrop={(e) => { e.preventDefault(); dropOnto(images.length); }}
          className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-center text-[11px] text-neutral-400 transition-colors hover:border-amber-300/50 hover:bg-white/5 ${
            overIdx === images.length ? "border-amber-300 bg-amber-300/10" : "border-white/20"
          }`}
        >
          {busy ? (progress ?? "Uploading…") : <><span className="text-lg">+</span>Add photos</>}
          <input type="file" accept="image/*" multiple onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} className="hidden" />
        </label>
      </div>
      {err && <p className="mt-2 text-[12px] text-red-400">{err}</p>}
    </div>
  );
}

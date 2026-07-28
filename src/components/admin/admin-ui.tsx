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

export async function uploadImage(file: File): Promise<{ ok: boolean; path?: string; error?: string }> {
  const fd = new FormData();
  fd.append("file", file);
  try {
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = (await res.json().catch(() => ({}))) as { path?: string; error?: string };
    if (!res.ok) return { ok: false, error: json.error ?? "Upload failed" };
    return { ok: true, path: json.path };
  } catch {
    return { ok: false, error: "Upload failed" };
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
}: {
  images: string[];
  onChange: (images: string[]) => void;
  note?: string;
  /** when set (collections), enables dragging photos between collections */
  groupId?: string;
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
        {images.map((src, idx) => (
          <div
            key={idx}
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
            <img src={src} alt="" draggable={false} className="pointer-events-none h-full w-full object-cover" />
            {idx === 0 && (
              <span className="absolute left-1 top-1 rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-medium text-neutral-900">★ Cover</span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100">
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
        ))}

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

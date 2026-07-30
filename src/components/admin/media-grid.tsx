"use client";

import * as React from "react";

/* Media library — every image uploaded to the shop, read from the Blob store
 * via /api/admin/media and shown through the same-origin /api/media proxy. */

interface MediaItem {
  pathname: string;
  src: string;
  size: number;
  uploadedAt: string;
}

function fmtSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1000) return `${Math.round(bytes / 1000)} KB`;
  return `${bytes} B`;
}
function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString();
}

export function MediaGrid() {
  const [items, setItems] = React.useState<MediaItem[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((j: { ok?: boolean; media?: MediaItem[]; error?: string }) => {
        if (!alive) return;
        if (j.ok && Array.isArray(j.media)) setItems(j.media);
        else setError(j.error ?? "Could not load media.");
      })
      .catch(() => alive && setError("Could not load media."));
    return () => {
      alive = false;
    };
  }, []);

  const copyLink = async (src: string) => {
    const url = typeof window !== "undefined" ? new URL(src, window.location.origin).toString() : src;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(src);
      window.setTimeout(() => setCopied((c) => (c === src ? null : c)), 1500);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  if (error) return <p className="font-typewriter text-[12px] text-red-700">{error}</p>;
  if (!items) return <p className="font-typewriter text-[12px] text-ink/60">Loading media…</p>;
  if (items.length === 0) return <p className="font-typewriter text-[12px] text-ink/60">No images uploaded yet.</p>;

  const totalSize = items.reduce((n, m) => n + m.size, 0);

  return (
    <div>
      <p className="font-typewriter mb-4 text-[11px] uppercase tracking-[0.14em] text-ink/60">
        {items.length} {items.length === 1 ? "file" : "files"} · {fmtSize(totalSize)}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((m) => (
          <div key={m.pathname} className="flex flex-col border border-ink/20 bg-paper shadow-paper">
            <a href={m.src} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden bg-white/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.src} alt={m.pathname} loading="lazy" className="h-full w-full object-contain p-2" />
            </a>
            <div className="flex flex-1 flex-col gap-1 border-t border-ink/15 px-2 py-2">
              <p className="font-typewriter truncate text-[10px] text-ink/70" title={m.pathname}>
                {m.pathname.replace(/^products\//, "")}
              </p>
              <p className="font-typewriter text-[9px] uppercase tracking-[0.1em] text-ink/45">
                {fmtSize(m.size)} · {fmtDate(m.uploadedAt)}
              </p>
              <button
                onClick={() => copyLink(m.src)}
                className="font-archivo mt-auto rounded-full border border-ink/30 px-2 py-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-ink/70 transition-colors hover:border-ink/60 hover:text-ink"
              >
                {copied === m.src ? "Copied ✓" : "Copy link"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

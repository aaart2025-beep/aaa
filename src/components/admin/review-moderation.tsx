"use client";

import * as React from "react";
import type { Review, ReviewStatus } from "@/lib/reviews/types";

/* Studio moderation for customer reviews: approve (publish), unapprove, delete. */

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

type Filter = "pending" | "approved" | "all";

export function ReviewModeration({ initial }: { initial: Review[] }) {
  const [reviews, setReviews] = React.useState<Review[]>(initial);
  const [filter, setFilter] = React.useState<Filter>("pending");
  const [busy, setBusy] = React.useState<string | null>(null);

  const patch = async (id: string, payload: Record<string, unknown>) => {
    setBusy(id);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...payload }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; deleted?: string };
      if (!json.ok) return;
      if (json.deleted) setReviews((m) => m.filter((x) => x.id !== id));
      else if (typeof payload.status === "string") {
        setReviews((m) => m.map((x) => (x.id === id ? { ...x, status: payload.status as ReviewStatus } : x)));
      }
    } finally {
      setBusy(null);
    }
  };

  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const visible = reviews.filter((r) => (filter === "all" ? true : r.status === filter));
  const filters: { id: Filter; label: string }[] = [
    { id: "pending", label: `Pending${pendingCount ? ` (${pendingCount})` : ""}` },
    { id: "approved", label: "Approved" },
    { id: "all", label: "All" },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`font-archivo rounded-full px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] transition-colors ${
              filter === f.id ? "bg-ink text-paper" : "border border-ink/30 text-ink/70 hover:border-ink/60 hover:text-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="font-typewriter text-[12px] text-ink/60">No reviews here.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((r) => (
            <div key={r.id} className="flex gap-3 border border-ink/20 bg-paper p-3 shadow-paper">
              {r.photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.photo} alt="" className="h-20 w-20 shrink-0 rounded object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] leading-none text-amber-500">{"★".repeat(Math.max(1, Math.min(5, r.rating)))}</span>
                  <span className="font-typewriter text-[12px] font-bold text-ink">{r.name}</span>
                  {r.status === "pending" && (
                    <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] uppercase tracking-wider text-amber-700">pending</span>
                  )}
                </div>
                {r.title && <p className="font-archivo mt-1 text-[12px] font-bold uppercase text-ink">{r.title}</p>}
                <p className="font-typewriter mt-1 whitespace-pre-wrap text-[12px] leading-[1.6] text-ink/80">{r.body}</p>
                <p className="font-typewriter mt-1 text-[9px] uppercase tracking-[0.1em] text-ink/45">
                  {fmtDate(r.createdAt)}{r.productSlug ? ` · ${r.productSlug}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    disabled={busy === r.id}
                    onClick={() => patch(r.id, { status: r.status === "approved" ? "pending" : "approved" })}
                    className="font-archivo rounded-full bg-ink px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-paper disabled:opacity-40"
                  >
                    {r.status === "approved" ? "Unpublish" : "Approve"}
                  </button>
                  <button
                    disabled={busy === r.id}
                    onClick={() => {
                      if (confirm("Delete this review permanently?")) void patch(r.id, { action: "delete" });
                    }}
                    className="font-archivo rounded-full border border-red-500/40 px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-red-700 transition-colors hover:bg-red-500/10 disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

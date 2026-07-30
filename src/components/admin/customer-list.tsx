"use client";

import * as React from "react";
import { formatPrice } from "@/lib/products";
import type { Customer } from "@/lib/customers/types";

/* The customer book — one row per email, built from order history. Expand a row
 * to see the totals and write a private note (saved to the studio's store). */

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function CustomerCard({ c }: { c: Customer }) {
  const [open, setOpen] = React.useState(false);
  const [note, setNote] = React.useState(c.note ?? "");
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: c.email, note }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (json.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-ink/20 bg-paper shadow-paper">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 px-4 py-3 text-start">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-ink">
            {c.name} {c.note ? <span aria-hidden title="Has a note">📝</span> : null}
          </span>
          <span className="font-typewriter block truncate text-[11px] text-ink/60">
            {c.email}
            {c.phone ? ` · ${c.phone}` : ""}
          </span>
        </span>
        <span className="shrink-0 text-end">
          <span className="font-archivo block text-[13px] font-extrabold text-ink">{formatPrice(c.totalSpent)}</span>
          <span className="font-typewriter block text-[10px] uppercase tracking-[0.1em] text-ink/50">
            {c.orders} {c.orders === 1 ? "order" : "orders"}
          </span>
        </span>
        <span aria-hidden className="shrink-0 text-ink/40">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="border-t border-ink/15 px-4 py-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
            <Field label="Orders" value={String(c.orders)} />
            <Field label="Total" value={formatPrice(c.totalSpent)} />
            <Field label="Paid" value={formatPrice(c.paidSpent)} />
            <Field label="Awaiting" value={formatPrice(c.totalSpent - c.paidSpent)} />
            <Field label="First order" value={fmtDate(c.firstOrder)} />
            <Field label="Last order" value={fmtDate(c.lastOrder)} />
            {c.phone ? <Field label="Phone" value={c.phone} /> : null}
          </div>

          <label className="mt-4 block">
            <span className="font-typewriter text-[10px] uppercase tracking-[0.14em] text-ink/60">Private note</span>
            <textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setSaved(false);
              }}
              rows={2}
              placeholder="e.g. prefers oversized fits · repeat commission client"
              className="mt-1 w-full resize-y rounded border border-ink/25 bg-white/60 px-2.5 py-1.5 font-typewriter text-[12px] text-ink outline-none focus:border-ink/60"
            />
          </label>
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="font-archivo rounded-full bg-ink px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-paper disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save note"}
            </button>
            {saved && <span className="font-typewriter text-[11px] text-emerald-700">Saved ✓</span>}
            <a
              href={`mailto:${c.email}`}
              className="font-archivo rounded-full border border-ink/30 px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink/70 transition-colors hover:border-ink/60 hover:text-ink"
            >
              Email
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-typewriter text-[9px] uppercase tracking-[0.14em] text-ink/55">{label}</p>
      <p className="font-archivo text-[13px] font-bold text-ink">{value}</p>
    </div>
  );
}

export function CustomerList({ initial }: { initial: Customer[] }) {
  const [q, setQ] = React.useState("");
  const query = q.trim().toLowerCase();
  const rows = query
    ? initial.filter((c) => c.name.toLowerCase().includes(query) || c.email.includes(query) || (c.phone ?? "").includes(query))
    : initial;

  const totalRevenue = initial.reduce((n, c) => n + c.totalSpent, 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-typewriter text-[11px] uppercase tracking-[0.14em] text-ink/60">
          {initial.length} {initial.length === 1 ? "customer" : "customers"} · {formatPrice(totalRevenue)} lifetime
        </p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, phone…"
          className="min-w-0 flex-1 rounded border border-ink/25 bg-white/60 px-3 py-2 font-typewriter text-[12px] text-ink outline-none focus:border-ink/60 sm:max-w-xs"
        />
      </div>

      {rows.length === 0 ? (
        <p className="font-typewriter text-[12px] text-ink/60">No customers {query ? "match your search" : "yet"}.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((c) => (
            <CustomerCard key={c.email} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}

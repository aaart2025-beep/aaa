"use client";

import * as React from "react";
import type { Subscriber } from "@/lib/subscribers/store";

/* Studio view of email subscribers: see the list, copy all addresses for an
 * external campaign, remove someone, or send a quick announcement/discount to
 * everyone (goes out through Resend once the domain is verified). */

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}

export function SubscriberList({ initial }: { initial: Subscriber[] }) {
  const [subs, setSubs] = React.useState<Subscriber[]>(initial);
  const [copied, setCopied] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [result, setResult] = React.useState<string | null>(null);

  const copyAll = async () => {
    const text = subs.map((s) => s.email).join(", ");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — ignore */
    }
  };

  const remove = async (email: string) => {
    if (!confirm(`Remove ${email}?`)) return;
    const res = await fetch("/api/admin/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", email }),
    });
    const j = (await res.json().catch(() => ({}))) as { ok?: boolean };
    if (j.ok) setSubs((m) => m.filter((s) => s.email !== email));
  };

  const broadcast = async () => {
    if (!subject.trim() || !message.trim()) return;
    if (!confirm(`Send this to all ${subs.length} subscribers?`)) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "broadcast", subject, message }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; sent?: number; total?: number; error?: string };
      setResult(j.ok ? `Sent to ${j.sent} of ${j.total}.` : j.error ?? "Could not send.");
      if (j.ok) {
        setSubject("");
        setMessage("");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-typewriter text-[12px] text-ink/70">{subs.length} subscriber{subs.length === 1 ? "" : "s"}</span>
        <button
          onClick={copyAll}
          disabled={subs.length === 0}
          className="font-archivo rounded-full border border-ink/30 px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink/75 transition-colors hover:border-ink/60 hover:text-ink disabled:opacity-40"
        >
          {copied ? "Copied ✓" : "Copy all emails"}
        </button>
      </div>

      {/* list */}
      {subs.length === 0 ? (
        <p className="font-typewriter text-[12px] text-ink/60">No subscribers yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-ink/10 border border-ink/15 bg-paper">
          {subs.map((s) => (
            <div key={s.email} className="flex items-center justify-between gap-3 px-3 py-2">
              <div className="min-w-0">
                <p className="font-typewriter truncate text-[12.5px] text-ink">{s.email}</p>
                <p className="font-typewriter text-[9.5px] uppercase tracking-[0.12em] text-ink/45">
                  {fmtDate(s.createdAt)}{s.source ? ` · ${s.source}` : ""}
                </p>
              </div>
              <button
                onClick={() => remove(s.email)}
                title="Remove"
                className="font-archivo shrink-0 rounded-full border border-red-500/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700 transition-colors hover:bg-red-500/10"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* broadcast composer */}
      <div className="border-t border-ink/15 pt-5">
        <h2 className="font-archivo text-[13px] font-bold uppercase tracking-[0.14em] text-ink">Send an announcement / discount</h2>
        <p className="font-typewriter mt-1 text-[11px] leading-[1.6] text-ink/55">
          Goes to all subscribers. Requires email to be configured (Resend + verified domain).
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (e.g. 15% off this weekend)"
            className="w-full rounded border border-ink/25 bg-white/60 px-3 py-2.5 font-typewriter text-[13px] text-ink outline-none focus:border-ink/60"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Your message… (include the coupon code, dates, a link, etc.)"
            className="w-full rounded border border-ink/25 bg-white/60 px-3 py-2.5 font-typewriter text-[13px] leading-[1.6] text-ink outline-none focus:border-ink/60"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={broadcast}
              disabled={busy || !subject.trim() || !message.trim() || subs.length === 0}
              className="chip-lime font-archivo self-start px-6 py-2.5 text-[12px] font-bold uppercase tracking-[0.16em] disabled:opacity-50"
            >
              {busy ? "Sending…" : "Send to all"}
            </button>
            {result && <span className="font-typewriter text-[12px] text-ink/70">{result}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

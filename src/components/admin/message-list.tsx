"use client";

import * as React from "react";
import type { Message, MessageStatus } from "@/lib/messages/types";

/* The studio inbox. Messages come from the site's contact form. Click one to
 * read it (auto-marks read), reply by email, archive, or delete. */

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

type Filter = "all" | "unread" | "archived";

export function MessageList({ initial }: { initial: Message[] }) {
  const [messages, setMessages] = React.useState<Message[]>(initial);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [busy, setBusy] = React.useState<string | null>(null);

  const patch = React.useCallback(async (id: string, payload: Record<string, unknown>) => {
    setBusy(id);
    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...payload }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; deleted?: string };
      if (!json.ok) return false;
      if (json.deleted) setMessages((m) => m.filter((x) => x.id !== id));
      else if (typeof payload.status === "string") {
        setMessages((m) => m.map((x) => (x.id === id ? { ...x, status: payload.status as MessageStatus } : x)));
      }
      return true;
    } finally {
      setBusy(null);
    }
  }, []);

  const openMessage = (m: Message) => {
    const next = openId === m.id ? null : m.id;
    setOpenId(next);
    if (next && m.status === "unread") void patch(m.id, { status: "read" });
  };

  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const visible = messages.filter((m) =>
    filter === "all" ? m.status !== "archived" : filter === "unread" ? m.status === "unread" : m.status === "archived",
  );

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: `Inbox${unreadCount ? ` (${unreadCount})` : ""}` },
    { id: "unread", label: "Unread" },
    { id: "archived", label: "Archived" },
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
        <p className="font-typewriter text-[12px] text-ink/60">No messages here.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((m) => {
            const open = openId === m.id;
            return (
              <div key={m.id} className="border border-ink/20 bg-paper shadow-paper">
                <button
                  onClick={() => openMessage(m)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-start"
                >
                  <span
                    aria-hidden
                    className={`h-2 w-2 shrink-0 rounded-full ${m.status === "unread" ? "bg-red-600" : "bg-ink/20"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[13px] text-ink ${m.status === "unread" ? "font-bold" : "font-medium"}`}>
                      {m.subject}
                    </span>
                    <span className="font-typewriter block truncate text-[11px] text-ink/60">
                      {m.name} · {m.email}
                    </span>
                  </span>
                  <span className="font-typewriter shrink-0 text-[10px] uppercase tracking-[0.1em] text-ink/50">
                    {fmtDate(m.createdAt)}
                  </span>
                  <span aria-hidden className="shrink-0 text-ink/40">{open ? "▾" : "▸"}</span>
                </button>

                {open && (
                  <div className="border-t border-ink/15 px-4 py-3">
                    <p className="font-typewriter whitespace-pre-wrap text-[12px] leading-[1.7] text-ink/85">{m.body}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <a
                        href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject)}`}
                        className="font-archivo rounded-full bg-ink px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-paper"
                      >
                        Reply by email
                      </a>
                      {m.phone && (
                        <span className="font-typewriter text-[11px] text-ink/70">☎ {m.phone}</span>
                      )}
                      <button
                        disabled={busy === m.id}
                        onClick={() => patch(m.id, { status: m.status === "archived" ? "read" : "archived" })}
                        className="font-archivo rounded-full border border-ink/30 px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink/70 transition-colors hover:border-ink/60 hover:text-ink disabled:opacity-40"
                      >
                        {m.status === "archived" ? "Move to inbox" : "Archive"}
                      </button>
                      <button
                        disabled={busy === m.id}
                        onClick={() => {
                          if (confirm("Delete this message permanently?")) void patch(m.id, { action: "delete" });
                        }}
                        className="font-archivo rounded-full border border-red-500/40 px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-red-700 transition-colors hover:bg-red-500/10 disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

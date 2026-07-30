"use client";

import * as React from "react";
import { useT } from "@/lib/i18n/context";

/* On-site contact form. Posts to /api/contact, which saves the message to the
 * studio inbox and emails it. Includes a hidden honeypot ("company") for bots. */

export function ContactForm() {
  const t = useT();
  const [state, setState] = React.useState<"idle" | "sending" | "sent" | "error">("idle");
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", subject: "", message: "", company: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (json.ok) {
        setState("sent");
        setForm({ name: "", email: "", phone: "", subject: "", message: "", company: "" });
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  const field =
    "w-full rounded border border-ink/25 bg-white/60 px-3 py-2.5 font-typewriter text-[13px] text-ink outline-none transition-colors focus:border-ink/60";

  if (state === "sent") {
    return (
      <div className="rounded border border-ink/25 bg-paper px-5 py-6 text-center shadow-paper">
        <p className="font-typewriter text-[13px] leading-[1.8] text-ink/80">{t("contactForm.sent")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 text-start">
      {/* honeypot — hidden from people, tempting to bots */}
      <input
        type="text"
        name="company"
        value={form.company}
        onChange={set("company")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="font-typewriter text-[10px] uppercase tracking-[0.14em] text-ink/60">{t("contactForm.name")}</span>
          <input required value={form.name} onChange={set("name")} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-typewriter text-[10px] uppercase tracking-[0.14em] text-ink/60">{t("contactForm.email")}</span>
          <input required type="email" value={form.email} onChange={set("email")} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-typewriter text-[10px] uppercase tracking-[0.14em] text-ink/60">{t("contactForm.phone")}</span>
          <input value={form.phone} onChange={set("phone")} className={field} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-typewriter text-[10px] uppercase tracking-[0.14em] text-ink/60">{t("contactForm.subject")}</span>
          <input value={form.subject} onChange={set("subject")} className={field} />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="font-typewriter text-[10px] uppercase tracking-[0.14em] text-ink/60">{t("contactForm.message")}</span>
        <textarea required rows={5} value={form.message} onChange={set("message")} className={`${field} resize-y`} />
      </label>

      {state === "error" && (
        <p className="font-typewriter text-[12px] text-red-700">{t("contactForm.error")}</p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="chip-lime font-archivo mt-1 self-start px-7 py-3 text-[12px] font-bold uppercase tracking-[0.18em] disabled:opacity-50"
      >
        {state === "sending" ? t("contactForm.sending") : t("contactForm.send")}
      </button>
    </form>
  );
}

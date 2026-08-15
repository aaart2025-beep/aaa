"use client";

import * as React from "react";

/* Footer email signup — collects an address (no account/password) for offers,
 * news and discounts. Posts to /api/subscribe; shows a thank-you on success.
 * Strings are passed in already-translated so this stays a tiny client island. */
export function NewsletterSignup({
  label,
  placeholder,
  cta,
  sending,
  thanks,
  error,
}: {
  label: string;
  placeholder: string;
  cta: string;
  sending: string;
  thanks: string;
  error: string;
}) {
  const [email, setEmail] = React.useState("");
  const [company, setCompany] = React.useState(""); // honeypot
  const [state, setState] = React.useState<"idle" | "sending" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, source: "footer" }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean };
      setState(j.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <p className="font-typewriter max-w-[280px] justify-self-center text-[11px] leading-[1.7] tracking-[0.04em] text-ink/75 sm:justify-self-end sm:text-right">
        {thanks}
      </p>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex w-full max-w-[280px] flex-col items-center gap-2 justify-self-center sm:items-end sm:justify-self-end"
    >
      <label htmlFor="footer-email" className="font-typewriter text-[10px] uppercase tracking-[0.22em] text-ink/70">
        {label}
      </label>
      <div className="flex w-full items-stretch gap-2">
        <input
          type="text"
          name="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />
        <input
          id="footer-email"
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="font-typewriter w-full min-w-0 border-b border-ink/40 bg-transparent px-1 pb-1 text-[16px] tracking-[0.06em] text-ink placeholder:text-ink/70 focus:border-ink focus:outline-none sm:text-[11.5px]"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="chip-lime font-typewriter shrink-0 px-3.5 py-2.5 text-[10px] uppercase tracking-[0.16em] disabled:opacity-50 sm:py-1.5"
        >
          {state === "sending" ? sending : cta}
        </button>
      </div>
      {state === "error" && (
        <span className="font-typewriter text-[10px] tracking-[0.04em] text-red-600">{error}</span>
      )}
    </form>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/context";

const inputCls =
  "font-typewriter w-full border-b border-ink/40 bg-transparent px-1 pb-1.5 pt-0.5 text-[16px] tracking-[0.03em] text-ink outline-none placeholder:text-ink/70 focus:border-ink sm:text-[13px]";

export function LoginForm() {
  const router = useRouter();
  const t = useT();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const username = String(data.get("username") ?? "").trim();
    const password = String(data.get("password") ?? "");

    if (!username || !password) {
      setError(t("pages.loginForm.errEmpty"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        setError(t("pages.loginForm.errInvalid"));
        setSubmitting(false);
        return;
      }
      // Land in the admin console; refresh so server components see the cookie.
      router.push("/admin");
      router.refresh();
    } catch {
      setError(t("pages.loginForm.errGeneric"));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <label className="flex flex-col gap-1.5">
        <span className="font-typewriter text-[9.5px] uppercase tracking-[0.2em] text-ink/70">{t("pages.loginForm.username")}</span>
        <input name="username" type="text" autoComplete="username" placeholder={t("pages.loginForm.usernamePlaceholder")} className={inputCls} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-typewriter text-[9.5px] uppercase tracking-[0.2em] text-ink/70">{t("pages.loginForm.password")}</span>
        <input name="password" type="password" autoComplete="current-password" placeholder="••••••••" className={inputCls} />
      </label>

      {error ? (
        <p className="font-typewriter -mt-1 text-[10.5px] uppercase tracking-[0.14em] text-red-600">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="chip-lime font-archivo mt-1 w-full px-6 py-3 text-center text-[12.5px] font-bold uppercase tracking-[0.18em] disabled:opacity-60"
      >
        {submitting ? t("pages.loginForm.opening") : t("pages.loginForm.signIn")}
      </button>
    </form>
  );
}

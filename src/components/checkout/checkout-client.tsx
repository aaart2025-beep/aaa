"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCart, cartSubtotal } from "@/lib/cart/store";
import { formatPrice } from "@/lib/products";
import { TransitionLink } from "@/components/transition/page-transition";
import { PolicyDialog } from "@/components/policy/policy-dialog";
import { ReturnsPolicyContent, CarePolicyContent } from "@/lib/policies";
import { useT } from "@/lib/i18n/context";

/* The checkout page: review the bag, fill in contact + shipping details, agree
 * to the policy, then place the order. Payment is arranged offline for now (no
 * Stripe) — the order is saved as "unpaid" and the studio confirms payment from
 * the admin. The order POSTs to the Vercel API (works from the static build too
 * via apiBase); if that's unreachable it falls back to an email to the studio. */

// 16px on phones so iOS Safari doesn't zoom the page when a field is focused.
const inputCls =
  "font-typewriter w-full border-b border-ink/40 bg-transparent px-1 pb-1 pt-0.5 text-[16px] font-bold tracking-[0.03em] text-ink placeholder:font-normal placeholder:text-ink/60 focus:border-ink focus:outline-none sm:text-[12.5px]";

function LineField({
  label,
  value,
  onChange,
  type = "text",
  area = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  area?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-typewriter text-[10px] font-bold uppercase tracking-[0.16em] text-ink">{label}</span>
      {area ? (
        <textarea value={value} onChange={onChange} rows={2} placeholder={placeholder} className={`${inputCls} resize-none`} />
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={inputCls} />
      )}
    </label>
  );
}

export function CheckoutClient({ email, apiBase = "" }: { email: string; apiBase?: string }) {
  const items = useCart((s) => s.items);
  const router = useRouter();
  const t = useT();
  const [mounted, setMounted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [fallback, setFallback] = React.useState(false);
  const [agreed, setAgreed] = React.useState(false);
  const [showAgreeHint, setShowAgreeHint] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", email: "", phone: "", address: "", note: "" });
  const [error, setError] = React.useState<string | null>(null);
  // Honeypot — hidden from people, tempting for bots; the API discards
  // any submission where this is filled.
  const [company, setCompany] = React.useState("");
  React.useEffect(() => setMounted(true), []);

  const subtotal = mounted ? cartSubtotal(items) : 0;
  const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const placeOrder = async () => {
    setError(null);
    if (!form.name.trim() || !isEmail(form.email.trim())) {
      setError(t("checkout.errNameEmail"));
      return;
    }
    if (!agreed) {
      setShowAgreeHint(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.slug, variant: i.variant, qty: i.qty })),
          company,
          customer: {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            note: form.note.trim(),
          },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; id?: string; error?: string };
      if (res.ok && data.ok && data.id) {
        // success page clears the bag on mount
        router.push(`/checkout/success?ref=${encodeURIComponent(data.id)}`);
        return;
      }
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      setFallback(true);
    } catch {
      // API unreachable (e.g. static build with no endpoint) → offer email
      setFallback(true);
    } finally {
      setLoading(false);
    }
  };

  const emailOrder = () => {
    if (!agreed) {
      setShowAgreeHint(true);
      return;
    }
    const lines = items
      .map((i) => `  • ${i.name}${i.variant ? ` (${i.variant})` : ""} × ${i.qty} — ${formatPrice(i.price * i.qty)}`)
      .join("\n");
    const body = [
      "Hi AAA — I'd like to place this order:",
      "",
      lines,
      "",
      `Subtotal: ${formatPrice(subtotal)}`,
      "",
      "My details:",
      `  Name: ${form.name || "—"}`,
      `  Email: ${form.email || "—"}`,
      `  Phone: ${form.phone || "—"}`,
      `  Address: ${form.address || "—"}`,
      form.note ? `  Note: ${form.note}` : "",
      "",
      "Please confirm availability, the final quote and how to pay.",
    ]
      .filter(Boolean)
      .join("\n");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent("Order from AAA")}&body=${encodeURIComponent(body)}`;
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <span className="font-script text-[26px] text-ink/70">{t("checkout.emptyBag")}</span>
        <TransitionLink href="/shop" className="chip-lime font-archivo px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em]">
          {t("checkout.backToShop")}
        </TransitionLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <header className="border-b border-ink/60 pb-3">
        <p className="font-typewriter text-[10px] uppercase tracking-[0.3em] text-ink/70">{t("checkout.kicker")}</p>
        <h1 className="font-archivo mt-1 text-[clamp(1.6rem,5vw,2.6rem)] font-extrabold uppercase leading-none tracking-tight text-ink">
          {t("checkout.title")}
        </h1>
      </header>

      <ul className="flex flex-col">
        {items.map((i) => (
          <li key={`${i.slug}:${i.variant ?? ""}`} className="flex items-center gap-3 border-b border-dashed border-ink/25 py-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-ink/15 bg-paper-dark/30">
              {i.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={i.image} alt="" className="h-full w-full object-contain p-1" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-archivo truncate text-[12.5px] font-bold uppercase tracking-tight text-ink">{i.name}</p>
              {i.variant && <p className="font-typewriter text-[10px] uppercase tracking-[0.14em] text-ink/70">{t("checkout.sizeLabel", { size: i.variant })}</p>}
              <p className="font-typewriter mt-0.5 text-[10.5px] uppercase tracking-[0.12em] text-ink/70">{t("checkout.qty", { qty: i.qty })}</p>
            </div>
            <span className="font-typewriter shrink-0 text-[12px] text-ink">{formatPrice(i.price * i.qty)}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-baseline justify-between border-t border-ink/60 pt-3">
        <span className="font-typewriter text-[10px] uppercase tracking-[0.22em] text-ink/70">{t("checkout.subtotal")}</span>
        <span className="font-archivo text-[22px] font-extrabold text-ink">{formatPrice(subtotal)}</span>
      </div>
      <p className="font-typewriter -mt-4 text-right text-[9.5px] uppercase tracking-[0.14em] text-ink/70">
        {t("checkout.studioConfirms")}
      </p>

      {/* contact + shipping */}
      <div className="flex flex-col gap-3.5 border-t border-ink/60 pt-4">
        <p className="font-typewriter text-[9px] uppercase tracking-[0.2em] text-ink/70">{t("checkout.yourDetails")}</p>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <LineField label={t("checkout.fullName")} value={form.name} onChange={set("name")} placeholder={t("checkout.namePlaceholder")} />
          <LineField label={t("checkout.email")} type="email" value={form.email} onChange={set("email")} placeholder={t("checkout.emailPlaceholder")} />
          <LineField label={t("checkout.phone")} value={form.phone} onChange={set("phone")} placeholder={t("checkout.phonePlaceholder")} />
          <LineField label={t("checkout.address")} value={form.address} onChange={set("address")} placeholder={t("checkout.addressPlaceholder")} />
        </div>
        <LineField label={t("checkout.note")} area value={form.note} onChange={set("note")} placeholder={t("checkout.notePlaceholder")} />
        <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
          <label>
            Company
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </label>
        </div>
      </div>

      {/* care instructions — pressable, no checkbox */}
      <div className="flex items-center justify-between gap-3 border-t border-ink/60 pt-4">
        <span className="font-typewriter text-[9px] uppercase tracking-[0.2em] text-ink/70">{t("checkout.beforeOrder")}</span>
        <PolicyDialog
          title={t("checkout.careTitle")}
          triggerLabel={t("checkout.careLink")}
          triggerClassName="font-archivo text-[10px] font-bold uppercase tracking-[0.12em] text-ink/70 underline decoration-ink/30 underline-offset-4 transition-colors hover:text-ink"
        >
          <CarePolicyContent />
        </PolicyDialog>
      </div>

      {/* required agreement — must tick before checkout */}
      <div
        className={`border p-3.5 transition-colors ${
          showAgreeHint && !agreed ? "border-red-500/70 bg-red-500/[0.06]" : "border-ink/30 bg-paper-dark/15"
        }`}
      >
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              if (e.target.checked) setShowAgreeHint(false);
            }}
            className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-lime"
          />
          <span className="font-typewriter text-[10.5px] leading-[1.7] tracking-[0.03em] text-ink/80">
            {t("checkout.agreePrefix")}<span className="font-bold text-ink">{t("checkout.agreePolicy")}</span>{t("checkout.agreeMid")}
            <a href="/terms" target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="font-bold text-ink underline decoration-ink/40 underline-offset-2">{t("checkout.agreeTerms")}</a>{t("checkout.agreeSuffix")}
          </span>
        </label>
        <PolicyDialog
          title={t("checkout.returnsTitle")}
          triggerLabel={t("checkout.readFullPolicy")}
          triggerClassName="font-archivo ml-[30px] mt-2 block text-[9.5px] font-bold uppercase tracking-[0.12em] text-ink/70 underline decoration-ink/30 underline-offset-4 transition-colors hover:text-ink"
        >
          <ReturnsPolicyContent />
        </PolicyDialog>
      </div>
      {showAgreeHint && !agreed && (
        <p className="font-typewriter -mt-4 text-[9px] uppercase tracking-[0.16em] text-red-600">
          {t("checkout.pleaseAgree")}
        </p>
      )}
      {error && (
        <p className="font-typewriter -mt-4 text-[9.5px] uppercase tracking-[0.14em] text-red-600">{error}</p>
      )}

      {!fallback ? (
        <div className="flex flex-col gap-2 pb-[max(0px,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={placeOrder}
            disabled={loading}
            aria-disabled={!agreed}
            className={`chip-lime font-archivo w-full px-6 py-3.5 text-center text-[13px] font-bold uppercase tracking-[0.18em] disabled:opacity-60 ${
              !agreed ? "opacity-60" : ""
            }`}
          >
            {loading ? t("checkout.placing") : t("checkout.placeOrder")}
          </button>
          <p className="font-typewriter text-center text-[9.5px] uppercase tracking-[0.14em] text-ink/70">
            {t("checkout.noCard")}
          </p>
        </div>
      ) : (
        <div className="border border-ink/30 bg-paper-dark/20 p-4">
          <p className="font-typewriter text-[10px] uppercase tracking-[0.16em] text-ink/65">
            {t("checkout.unreachable")}
          </p>
          <p className="font-typewriter mt-1.5 text-[10px] leading-[1.7] tracking-[0.04em] text-ink/70">
            {t("checkout.sendInstead")}
          </p>
          <button
            type="button"
            onClick={emailOrder}
            className="chip-ink font-archivo mt-3 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em]"
          >
            {t("checkout.sendToStudio")}
          </button>
        </div>
      )}

      <TransitionLink
        href="/shop"
        className="font-typewriter text-center text-[9px] uppercase tracking-[0.18em] text-ink/70 underline-offset-2 hover:text-ink hover:underline"
      >
        {t("checkout.keepShopping")}
      </TransitionLink>
    </div>
  );
}

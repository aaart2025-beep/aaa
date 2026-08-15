"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, RotateCcw, Sparkles, MessageCircle } from "lucide-react";
import { useCart, cartSubtotal } from "@/lib/cart/store";
import { formatPrice } from "@/lib/products";
import { TransitionLink } from "@/components/transition/page-transition";
import { PolicyDialog } from "@/components/policy/policy-dialog";
import { ReturnsPolicyContent, CarePolicyContent } from "@/lib/policies";
import { useT } from "@/lib/i18n/context";
import type { Coupon, ShippingConfig } from "@/lib/content/types";

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
  onBlur,
  type = "text",
  area = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  type?: string;
  area?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-typewriter text-[10px] font-bold uppercase tracking-[0.16em] text-ink">{label}</span>
      {area ? (
        <textarea value={value} onChange={onChange} onBlur={onBlur} rows={2} placeholder={placeholder} className={`${inputCls} resize-none`} />
      ) : (
        <input type={type} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} className={inputCls} />
      )}
    </label>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="font-typewriter text-[10px] uppercase tracking-[0.16em] text-ink/70">{label}</span>
      <span className={`font-typewriter text-[13px] ${accent ? "font-bold text-lime-700" : "text-ink"}`}>{value}</span>
    </div>
  );
}

export function CheckoutClient({
  email,
  apiBase = "",
  coupons = [],
  shipping,
}: {
  email: string;
  apiBase?: string;
  coupons?: Coupon[];
  shipping?: ShippingConfig;
}) {
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

  // coupon + shipping
  const [couponInput, setCouponInput] = React.useState("");
  const [applied, setApplied] = React.useState<Coupon | null>(null);
  const [couponErr, setCouponErr] = React.useState(false);
  const options = shipping?.options ?? [];
  const [shippingId, setShippingId] = React.useState(options[0]?.id ?? "");

  const subtotal = mounted ? cartSubtotal(items) : 0;
  const rawDiscount = applied
    ? applied.kind === "percent"
      ? Math.round((subtotal * applied.value) / 100)
      : Math.round(applied.value)
    : 0;
  const discount = Math.max(0, Math.min(rawDiscount, subtotal));
  const freeShip = Boolean(shipping?.freeOver && subtotal - discount >= shipping.freeOver);
  const selectedOpt = options.find((o) => o.id === shippingId);
  const shippingCost = selectedOpt ? (freeShip ? 0 : selectedOpt.price) : 0;
  const total = Math.max(0, subtotal - discount) + shippingCost;

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    const found = coupons.find((cp) => cp.code.trim().toUpperCase() === code && cp.active !== false);
    if (found) {
      setApplied(found);
      setCouponErr(false);
    } else {
      setApplied(null);
      setCouponErr(true);
    }
  };

  const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // Abandoned-cart capture: once the shopper has typed a valid email and has
  // items, quietly save the cart so the studio can send a reminder if they
  // never finish. Fire-and-forget; deduped so we don't re-post an identical
  // state. Never blocks or surfaces anything to the shopper.
  const lastSent = React.useRef("");
  const capturePending = React.useCallback(() => {
    const em = form.email.trim();
    if (!isEmail(em) || items.length === 0) return;
    const lines = items.map((i) => ({ slug: i.slug, variant: i.variant, qty: i.qty }));
    const sig = em.toLowerCase() + "#" + lines.map((l) => `${l.slug}:${l.variant ?? ""}:${l.qty}`).sort().join(",");
    if (sig === lastSent.current) return;
    lastSent.current = sig;
    fetch(`${apiBase}/api/cart/pending`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: em, name: form.name.trim() || undefined, items: lines, company, source: "checkout" }),
      keepalive: true,
    }).catch(() => {
      // best-effort — allow a later change to retry
      lastSent.current = "";
    });
  }, [apiBase, form.email, form.name, items, company]);

  // Also refresh the saved cart shortly after the items change (e.g. quantity
  // tweaks) once an email is on file — debounced so we don't spam the endpoint.
  React.useEffect(() => {
    if (!isEmail(form.email.trim()) || items.length === 0) return;
    const t = setTimeout(capturePending, 900);
    return () => clearTimeout(t);
  }, [items, form.email, capturePending]);

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
          couponCode: applied?.code,
          shippingId: selectedOpt?.id,
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
        // If HYP online payment is configured, hand off to its hosted page;
        // otherwise go to the confirmation page (studio arranges payment).
        try {
          const payRes = await fetch(`${apiBase}/api/pay/hyp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.id }),
          });
          const pay = (await payRes.json().catch(() => ({}))) as { ok?: boolean; url?: string };
          if (pay.ok && pay.url) {
            window.location.href = pay.url;
            return;
          }
        } catch {
          /* payment init unreachable → fall through to the confirmation page */
        }
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
      applied ? `Discount (${applied.code}): -${formatPrice(discount)}` : "",
      selectedOpt ? `Shipping (${selectedOpt.label}): ${shippingCost === 0 ? "Free" : formatPrice(shippingCost)}` : "",
      `Total: ${formatPrice(total)}`,
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

      {/* order summary (subtotal → coupon → shipping → total) lives below,
          after the contact details */}

      {/* contact + shipping */}
      <div className="flex flex-col gap-3.5 border-t border-ink/60 pt-4">
        <p className="font-typewriter text-[9px] uppercase tracking-[0.2em] text-ink/70">{t("checkout.yourDetails")}</p>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <LineField label={t("checkout.fullName")} value={form.name} onChange={set("name")} placeholder={t("checkout.namePlaceholder")} />
          <LineField label={t("checkout.email")} type="email" value={form.email} onChange={set("email")} onBlur={capturePending} placeholder={t("checkout.emailPlaceholder")} />
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

      {/* shipping method */}
      {options.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-ink/60 pt-4">
          <p className="font-typewriter text-[9px] uppercase tracking-[0.2em] text-ink/70">{t("checkout.shippingHeading")}</p>
          <div className="flex flex-col gap-2">
            {options.map((o) => {
              const cost = freeShip ? 0 : o.price;
              const active = shippingId === o.id;
              return (
                <label
                  key={o.id}
                  className={`flex cursor-pointer items-center justify-between gap-3 border px-3 py-2.5 transition-colors ${
                    active ? "border-ink bg-paper-dark/15" : "border-ink/25 hover:border-ink/50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <input type="radio" name="shipping" checked={active} onChange={() => setShippingId(o.id)} className="h-4 w-4 accent-ink" />
                    <span className="font-typewriter text-[12px] text-ink">{o.label}</span>
                  </span>
                  <span className="font-typewriter text-[12px] font-bold text-ink">
                    {cost === 0 ? t("checkout.free") : formatPrice(cost)}
                  </span>
                </label>
              );
            })}
          </div>
          {shipping?.freeOver ? (
            <p className="font-typewriter text-[9px] uppercase tracking-[0.14em] text-ink/60">
              {t("checkout.freeOverNote", { amount: formatPrice(shipping.freeOver) })}
            </p>
          ) : null}
        </div>
      )}

      {/* coupon code */}
      <div className="flex flex-col gap-2 border-t border-ink/60 pt-4">
        <p className="font-typewriter text-[9px] uppercase tracking-[0.2em] text-ink/70">{t("checkout.couponLabel")}</p>
        {applied ? (
          <div className="flex items-center justify-between gap-3">
            <span className="font-typewriter text-[12px] text-ink">✓ {applied.code} — {t("checkout.couponApplied")}</span>
            <button
              type="button"
              onClick={() => {
                setApplied(null);
                setCouponInput("");
                setCouponErr(false);
              }}
              className="font-typewriter text-[10px] uppercase tracking-[0.12em] text-ink/60 underline underline-offset-2 hover:text-ink"
            >
              {t("checkout.couponRemove")}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value);
                setCouponErr(false);
              }}
              placeholder={t("checkout.couponPlaceholder")}
              className={`${inputCls} flex-1`}
            />
            <button type="button" onClick={applyCoupon} className="chip-ink font-archivo shrink-0 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em]">
              {t("checkout.couponApply")}
            </button>
          </div>
        )}
        {couponErr && (
          <p className="font-typewriter text-[9px] uppercase tracking-[0.14em] text-red-600">{t("checkout.couponInvalid")}</p>
        )}
      </div>

      {/* totals */}
      <div className="flex flex-col gap-1.5 border-t border-ink/60 pt-4">
        <Row label={t("checkout.subtotal")} value={formatPrice(subtotal)} />
        {discount > 0 && (
          <Row label={`${t("checkout.discount")}${applied ? ` (${applied.code})` : ""}`} value={`− ${formatPrice(discount)}`} accent />
        )}
        {selectedOpt && (
          <Row label={t("checkout.shippingHeading")} value={shippingCost === 0 ? t("checkout.free") : formatPrice(shippingCost)} />
        )}
        <div className="mt-1 flex items-baseline justify-between border-t border-ink/30 pt-2">
          <span className="font-typewriter text-[11px] uppercase tracking-[0.18em] text-ink">{t("checkout.total")}</span>
          <span className="font-archivo text-[24px] font-extrabold text-ink">{formatPrice(total)}</span>
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
            {loading ? t("checkout.placing") : t("checkout.toPayment")}
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

      {/* trust signals — reassurance right by the order button */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-ink/20 pt-5 sm:grid-cols-4">
        {[
          { icon: <ShieldCheck className="h-4 w-4" strokeWidth={1.6} />, label: t("checkout.trustSecure") },
          { icon: <Sparkles className="h-4 w-4" strokeWidth={1.6} />, label: t("checkout.trustHandmade") },
          { icon: <RotateCcw className="h-4 w-4" strokeWidth={1.6} />, label: t("checkout.trustReturns") },
          { icon: <MessageCircle className="h-4 w-4" strokeWidth={1.6} />, label: t("checkout.trustSupport") },
        ].map((it, i) => (
          <div key={i} className="flex items-center gap-2 text-ink/70">
            <span className="shrink-0 text-ink/55">{it.icon}</span>
            <span className="font-typewriter text-[9.5px] uppercase leading-tight tracking-[0.1em]">{it.label}</span>
          </div>
        ))}
      </div>

      <TransitionLink
        href="/shop"
        className="font-typewriter text-center text-[9px] uppercase tracking-[0.18em] text-ink/70 underline-offset-2 hover:text-ink hover:underline"
      >
        {t("checkout.keepShopping")}
      </TransitionLink>
    </div>
  );
}

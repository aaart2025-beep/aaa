"use client";

import * as React from "react";
import { formatPrice } from "@/lib/products";
import {
  type Order,
  type PaymentStatus,
  type FulfillmentStatus,
  PAYMENT_STATUSES,
  FULFILLMENT_STATUSES,
  FULFILLMENT_LABELS,
  orderTotal,
} from "@/lib/orders/types";

const PAYMENT_LABEL: Record<PaymentStatus, string> = { unpaid: "Unpaid", paid: "Paid", refunded: "Refunded" };
const PAYMENT_TONE: Record<PaymentStatus, string> = {
  unpaid: "bg-amber-500/15 text-amber-700 border-amber-600/40",
  paid: "bg-emerald-500/15 text-emerald-700 border-emerald-600/40",
  refunded: "bg-ink/10 text-ink/70 border-ink/30",
};

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function OrderList({ initial }: { initial: Order[] }) {
  const [orders, setOrders] = React.useState<Order[]>(initial);
  const [savingId, setSavingId] = React.useState<string | null>(null);

  const patch = React.useCallback(
    async (id: string, body: Partial<Pick<Order, "paymentStatus" | "paymentMethod" | "fulfillmentStatus">>) => {
      setSavingId(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...body } : o))); // optimistic
      try {
        const res = await fetch("/api/admin/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...body }),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; order?: Order };
        if (data.ok && data.order) setOrders((prev) => prev.map((o) => (o.id === id ? data.order! : o)));
      } catch {
        /* keep optimistic value; a refresh will reconcile */
      } finally {
        setSavingId(null);
      }
    },
    [],
  );

  if (orders.length === 0) {
    return (
      <p className="font-typewriter mt-10 text-center text-[12px] uppercase tracking-[0.2em] text-ink/70">
        No orders yet. They&apos;ll appear here the moment a customer checks out.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {orders.map((o) => (
        <article key={o.id} className="border border-ink/20 bg-paper p-4 shadow-paper sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/15 pb-3">
            <div className="flex items-center gap-3">
              <span className="font-archivo text-[14px] font-extrabold tracking-[0.1em] text-ink">{o.id}</span>
              <span className="font-typewriter text-[10px] uppercase tracking-[0.14em] text-ink/70">{fmtDate(o.createdAt)}</span>
            </div>
            <span className={`font-archivo border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${PAYMENT_TONE[o.paymentStatus]}`}>
              {PAYMENT_LABEL[o.paymentStatus]}
            </span>
          </div>

          <div className="grid gap-5 pt-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {/* items + total */}
            <div>
              <ul className="flex flex-col gap-1.5">
                {o.items.map((it, idx) => (
                  <li key={idx} className="flex items-baseline justify-between gap-3">
                    <span className="font-typewriter text-[11px] text-ink/80">
                      {it.name}
                      {it.variant ? <span className="text-ink/70"> · {it.variant}</span> : null}
                      <span className="text-ink/70"> × {it.qty}</span>
                    </span>
                    <span className="font-typewriter shrink-0 text-[11px] text-ink">{formatPrice(it.price * it.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-col gap-1 border-t border-dashed border-ink/25 pt-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-typewriter text-[9px] uppercase tracking-[0.2em] text-ink/70">Subtotal</span>
                  <span className="font-typewriter text-[12px] text-ink">{formatPrice(o.subtotal)}</span>
                </div>
                {o.discount ? (
                  <div className="flex items-baseline justify-between">
                    <span className="font-typewriter text-[9px] uppercase tracking-[0.2em] text-ink/70">
                      Discount{o.couponCode ? ` (${o.couponCode})` : ""}
                    </span>
                    <span className="font-typewriter text-[12px] text-lime-700">− {formatPrice(o.discount)}</span>
                  </div>
                ) : null}
                {typeof o.shippingCost === "number" ? (
                  <div className="flex items-baseline justify-between">
                    <span className="font-typewriter text-[9px] uppercase tracking-[0.2em] text-ink/70">
                      Shipping{o.shippingLabel ? ` · ${o.shippingLabel}` : ""}
                    </span>
                    <span className="font-typewriter text-[12px] text-ink">
                      {o.shippingCost === 0 ? "Free" : formatPrice(o.shippingCost)}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-baseline justify-between border-t border-ink/20 pt-1">
                  <span className="font-typewriter text-[9px] uppercase tracking-[0.2em] text-ink">Total</span>
                  <span className="font-archivo text-[15px] font-extrabold text-ink">{formatPrice(orderTotal(o))}</span>
                </div>
              </div>
            </div>

            {/* customer */}
            <div className="font-typewriter text-[11px] leading-[1.7] text-ink/75">
              <p className="text-[9px] uppercase tracking-[0.2em] text-ink/70">Customer</p>
              <p className="mt-1 font-bold text-ink">{o.customer.name}</p>
              <p>
                <a href={`mailto:${o.customer.email}`} className="underline decoration-ink/30 underline-offset-2 hover:text-ink">
                  {o.customer.email}
                </a>
              </p>
              {o.customer.phone && <p>{o.customer.phone}</p>}
              {o.customer.address && <p className="text-ink/65">{o.customer.address}</p>}
              {o.customer.note && <p className="mt-1 italic text-ink/70">“{o.customer.note}”</p>}
            </div>
          </div>

          {/* controls */}
          <div className="mt-4 flex flex-wrap items-end gap-x-5 gap-y-3 border-t border-ink/15 pt-3.5">
            <div className="flex flex-col gap-1">
              <span className="font-typewriter text-[8.5px] uppercase tracking-[0.18em] text-ink/70">Payment</span>
              <div className="flex items-center">
                {PAYMENT_STATUSES.map((ps) => (
                  <button
                    key={ps}
                    type="button"
                    onClick={() => patch(o.id, { paymentStatus: ps })}
                    aria-pressed={o.paymentStatus === ps}
                    className={`font-typewriter border px-2.5 py-1 text-[9.5px] uppercase tracking-[0.1em] transition-colors ${
                      o.paymentStatus === ps ? "border-ink bg-ink text-paper" : "border-ink/30 text-ink/70 hover:border-ink"
                    } ${ps !== "unpaid" ? "-ml-px" : ""}`}
                  >
                    {PAYMENT_LABEL[ps]}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-1">
              <span className="font-typewriter text-[8.5px] uppercase tracking-[0.18em] text-ink/70">Paid via</span>
              <input
                type="text"
                defaultValue={o.paymentMethod ?? ""}
                placeholder="Bank / Cash / Bit…"
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v !== (o.paymentMethod ?? "")) patch(o.id, { paymentMethod: v });
                }}
                className="font-typewriter w-[130px] border-b border-ink/40 bg-transparent px-1 pb-1 text-[11px] text-ink placeholder:text-ink/70 focus:border-ink focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-typewriter text-[8.5px] uppercase tracking-[0.18em] text-ink/70">Fulfillment</span>
              <select
                value={o.fulfillmentStatus}
                onChange={(e) => patch(o.id, { fulfillmentStatus: e.target.value as FulfillmentStatus })}
                className="font-typewriter border border-ink/30 bg-paper px-2 py-1 text-[11px] text-ink focus:border-ink focus:outline-none"
              >
                {FULFILLMENT_STATUSES.map((fs) => (
                  <option key={fs} value={fs}>
                    {FULFILLMENT_LABELS[fs]}
                  </option>
                ))}
              </select>
            </label>

            {savingId === o.id && (
              <span className="font-typewriter ml-auto text-[9px] uppercase tracking-[0.16em] text-ink/70">saving…</span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

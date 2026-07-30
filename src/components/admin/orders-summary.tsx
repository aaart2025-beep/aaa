"use client";

import * as React from "react";
import { formatPrice } from "@/lib/products";
import { FULFILLMENT_LABELS, FULFILLMENT_STATUSES, type Order } from "@/lib/orders/types";

/* Period summary over the orders the studio already has: order count, revenue,
 * paid vs awaiting, and a fulfillment-status breakdown — for Today, this week,
 * month, year, or all time. Pure client math over the full order list. */

type Period = "today" | "week" | "month" | "year" | "all";
const PERIODS: { id: Period; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "year", label: "This year" },
  { id: "all", label: "All time" },
];

function inPeriod(iso: string, period: Period, now: Date): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  if (period === "all") return true;
  if (period === "today") return d.toDateString() === now.toDateString();
  if (period === "week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return d >= weekAgo;
  }
  if (period === "month") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  if (period === "year") return d.getFullYear() === now.getFullYear();
  return true;
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="border border-ink/20 bg-paper px-4 py-3 shadow-paper">
      <p className="font-typewriter text-[8.5px] uppercase tracking-[0.18em] text-ink/70">{label}</p>
      <p className={`font-archivo mt-1 text-[18px] font-extrabold tracking-tight ${accent ?? "text-ink"}`}>{value}</p>
    </div>
  );
}

export function OrdersSummary({ orders }: { orders: Order[] }) {
  const [period, setPeriod] = React.useState<Period>("month");
  // Read the clock once on mount (client only) to keep the math stable.
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => setNow(new Date()), []);

  const rows = React.useMemo(() => {
    if (!now) return orders;
    return orders.filter((o) => inPeriod(o.createdAt, period, now));
  }, [orders, period, now]);

  const total = rows.reduce((n, o) => n + o.subtotal, 0);
  const paid = rows.filter((o) => o.paymentStatus === "paid").reduce((n, o) => n + o.subtotal, 0);
  const awaiting = rows.filter((o) => o.paymentStatus === "unpaid").reduce((n, o) => n + o.subtotal, 0);
  const statusCounts = FULFILLMENT_STATUSES.map((s) => ({
    status: s,
    count: rows.filter((o) => o.fulfillmentStatus === s).length,
  }));

  return (
    <section aria-label="Order summary">
      <div className="flex flex-wrap gap-1.5">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPeriod(p.id)}
            aria-pressed={period === p.id}
            className={`font-archivo rounded-full px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] transition-colors ${
              period === p.id ? "bg-ink text-paper" : "border border-ink/30 text-ink/70 hover:border-ink/60 hover:text-ink"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Orders" value={String(rows.length)} />
        <Stat label="Total" value={formatPrice(total)} />
        <Stat label="Paid" value={formatPrice(paid)} accent="text-emerald-700" />
        <Stat label="Awaiting payment" value={formatPrice(awaiting)} accent="text-red-700" />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {statusCounts.map(({ status, count }) => (
          <span
            key={status}
            className="font-typewriter inline-flex items-center gap-1.5 border border-ink/20 bg-paper px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-ink/75"
          >
            {FULFILLMENT_LABELS[status]}
            <span className="font-archivo font-bold text-ink">{count}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { readOrders } from "@/lib/orders/store";
import { formatPrice } from "@/lib/products";
import { OrderList } from "@/components/admin/order-list";
import { PaperShell } from "@/components/paper/paper-shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Orders — AAA Admin",
  robots: { index: false, follow: false },
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/20 bg-paper px-4 py-3 shadow-paper">
      <p className="font-typewriter text-[8.5px] uppercase tracking-[0.18em] text-ink/70">{label}</p>
      <p className="font-archivo mt-1 text-[18px] font-extrabold tracking-tight text-ink">{value}</p>
    </div>
  );
}

export default async function AdminOrdersPage() {
  if (!(await isAdmin())) redirect("/login");

  const orders = (await readOrders()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const paidRevenue = orders.filter((o) => o.paymentStatus === "paid").reduce((n, o) => n + o.subtotal, 0);
  const unpaidRevenue = orders.filter((o) => o.paymentStatus === "unpaid").reduce((n, o) => n + o.subtotal, 0);

  return (
    <PaperShell>
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-ink/60 pb-4">
          <div>
            <p className="font-typewriter text-[10px] uppercase tracking-[0.3em] text-ink/70">AAA — Admin</p>
            <h1 className="font-archivo mt-1 text-[clamp(1.8rem,5vw,2.6rem)] font-extrabold uppercase leading-none tracking-tight text-ink">
              Orders &amp; Payments
            </h1>
          </div>
          <Link
            href="/admin"
            className="font-typewriter inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-ink"
          >
            <span aria-hidden>←</span> Back to console
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="Orders" value={String(orders.length)} />
          <Stat label="Paid" value={formatPrice(paidRevenue)} />
          <Stat label="Awaiting payment" value={formatPrice(unpaidRevenue)} />
        </div>

        <div className="mt-8">
          <OrderList initial={orders} />
        </div>
      </div>
    </PaperShell>
  );
}

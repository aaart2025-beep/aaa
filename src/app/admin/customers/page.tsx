import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { readOrders } from "@/lib/orders/store";
import { readCustomerNotes, deriveCustomers } from "@/lib/customers/store";
import { CustomerList } from "@/components/admin/customer-list";
import { AdminNav } from "@/components/admin/admin-nav";
import { PaperShell } from "@/components/paper/paper-shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Customers — AAA Admin",
  robots: { index: false, follow: false },
};

export default async function AdminCustomersPage() {
  if (!(await isAdmin())) redirect("/login");

  const [orders, notes] = await Promise.all([readOrders(), readCustomerNotes()]);
  const customers = deriveCustomers(orders, notes);

  return (
    <PaperShell>
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
        <AdminNav active="customers" title="Customers" />
        <p className="font-typewriter mt-4 text-[11px] leading-[1.7] text-ink/55">
          Built from order history. Real accounts with sign-up &amp; login dates arrive with customer logins (Phase C).
        </p>
        <div className="mt-6">
          <CustomerList initial={customers} />
        </div>
      </div>
    </PaperShell>
  );
}

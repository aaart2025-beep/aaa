import Link from "next/link";

/* Shared top bar for the back-office pages (orders, messages, customers,
 * media). Rendered on the paper surface; the active tab is inked solid. */

export type AdminTab = "console" | "orders" | "messages" | "customers" | "subscribers" | "reviews" | "media";

const TABS: { id: AdminTab; label: string; href: string }[] = [
  { id: "console", label: "Edit site", href: "/admin" },
  { id: "orders", label: "Orders", href: "/admin/orders" },
  { id: "messages", label: "Messages", href: "/admin/messages" },
  { id: "customers", label: "Customers", href: "/admin/customers" },
  { id: "subscribers", label: "Subscribers", href: "/admin/subscribers" },
  { id: "reviews", label: "Reviews", href: "/admin/reviews" },
  { id: "media", label: "Media", href: "/admin/media" },
];

export function AdminNav({ active, title }: { active: AdminTab; title: string }) {
  return (
    <div className="border-b border-ink/60 pb-4">
      <p className="font-typewriter text-[10px] uppercase tracking-[0.3em] text-ink/70">AAA — Admin</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-archivo text-[clamp(1.8rem,5vw,2.6rem)] font-extrabold uppercase leading-none tracking-tight text-ink">
          {title}
        </h1>
      </div>
      <nav className="mt-4 flex flex-wrap gap-1.5">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={tab.id === active ? "page" : undefined}
            className={`font-archivo rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
              tab.id === active
                ? "bg-ink text-paper"
                : "border border-ink/30 text-ink/70 hover:border-ink/60 hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

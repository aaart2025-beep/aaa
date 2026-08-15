import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { readSubscribers } from "@/lib/subscribers/store";
import { SubscriberList } from "@/components/admin/subscriber-list";
import { AdminNav } from "@/components/admin/admin-nav";
import { PaperShell } from "@/components/paper/paper-shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Subscribers — AAA Admin",
  robots: { index: false, follow: false },
};

export default async function AdminSubscribersPage() {
  if (!(await isAdmin())) redirect("/login");
  const subscribers = (await readSubscribers()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <PaperShell>
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
        <AdminNav active="subscribers" title="Subscribers" />
        <p className="font-typewriter mt-4 text-[11px] leading-[1.7] text-ink/55">
          People who signed up for offers &amp; news. Copy the list to send a campaign, or send an announcement to everyone
          below. (Emails send once your domain is verified in Resend.)
        </p>
        <div className="mt-6">
          <SubscriberList initial={subscribers} />
        </div>
      </div>
    </PaperShell>
  );
}

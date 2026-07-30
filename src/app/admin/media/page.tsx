import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { MediaGrid } from "@/components/admin/media-grid";
import { AdminNav } from "@/components/admin/admin-nav";
import { PaperShell } from "@/components/paper/paper-shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Media — AAA Admin",
  robots: { index: false, follow: false },
};

export default async function AdminMediaPage() {
  if (!(await isAdmin())) redirect("/login");

  return (
    <PaperShell>
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
        <AdminNav active="media" title="Media Library" />
        <p className="font-typewriter mt-4 text-[11px] leading-[1.7] text-ink/55">
          Every image uploaded through the product editor. Open one in a new tab, or copy its link.
        </p>
        <div className="mt-6">
          <MediaGrid />
        </div>
      </div>
    </PaperShell>
  );
}

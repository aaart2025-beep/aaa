import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { readReviews } from "@/lib/reviews/store";
import { ReviewModeration } from "@/components/admin/review-moderation";
import { AdminNav } from "@/components/admin/admin-nav";
import { PaperShell } from "@/components/paper/paper-shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Reviews — AAA Admin",
  robots: { index: false, follow: false },
};

export default async function AdminReviewsPage() {
  if (!(await isAdmin())) redirect("/login");
  const reviews = (await readReviews()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <PaperShell>
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
        <AdminNav active="reviews" title="Reviews" />
        <p className="font-typewriter mt-4 text-[11px] leading-[1.7] text-ink/55">
          Customer reviews land here as “pending”. Approve to publish them on the Reviews page.
        </p>
        <div className="mt-6">
          <ReviewModeration initial={reviews} />
        </div>
      </div>
    </PaperShell>
  );
}

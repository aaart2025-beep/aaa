import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { readMessages } from "@/lib/messages/store";
import { MessageList } from "@/components/admin/message-list";
import { AdminNav } from "@/components/admin/admin-nav";
import { PaperShell } from "@/components/paper/paper-shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Messages — AAA Admin",
  robots: { index: false, follow: false },
};

export default async function AdminMessagesPage() {
  if (!(await isAdmin())) redirect("/login");

  const messages = (await readMessages()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <PaperShell>
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
        <AdminNav active="messages" title="Messages" />
        <div className="mt-6">
          <MessageList initial={messages} />
        </div>
      </div>
    </PaperShell>
  );
}

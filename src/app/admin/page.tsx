import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { readContent } from "@/lib/content/store";
import { AdminConsole } from "@/components/admin/admin-console";
import { DEFAULT_TEXTS } from "@/lib/content/defaults";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Console — AAA",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/login");
  const content = await readContent();
  return <AdminConsole initialContent={content} textKeys={Object.keys(DEFAULT_TEXTS)} />;
}

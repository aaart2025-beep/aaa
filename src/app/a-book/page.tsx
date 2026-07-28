import type { Metadata } from "next";
import Link from "next/link";
import { BookExperience } from "@/components/book/book-experience";
import { readContent } from "@/lib/content/store";
import { navTextKey, visibleNavItems } from "@/lib/nav";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: translate(lang, "home.bookMetaTitle"),
    description: translate(lang, "home.bookMetaDescription"),
  };
}

export default async function ABookPage() {
  const content = await readContent();
  const lang = await getLang();
  const t = (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars);
  const text = (key: string, fallback: string) => content.texts[key] ?? fallback;
  const navItems = visibleNavItems(content.navVisible).map((n) => ({
    href: n.href,
    label: text(navTextKey(n.key), n.fallback),
  }));

  return (
    <main className="book-theme relative min-h-screen">
      <BookExperience navItems={navItems} />
      <Link
        href="/"
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-50 inline-flex min-h-11 items-center rounded-full border border-ink/20 bg-paper/70 px-4 py-2 text-[12px] text-ink/70 backdrop-blur transition-colors hover:text-ink"
      >
        {t("home.backToAaa")}
      </Link>
    </main>
  );
}

import { ScrollVideoHero } from "@/components/hero/scroll-video-hero";
import { PaperHeader } from "@/components/paper/paper-header";
import { readContent } from "@/lib/content/store";
import { LanguageProvider } from "@/lib/i18n/context";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await readContent();
  // The entrance stays in English (LTR) regardless of the saved language —
  // translation begins once the visitor enters the shop. A nested provider
  // pins the cover's client components to English, and the header is forced
  // English with no language switch.
  return (
    <LanguageProvider initial="en">
      <div dir="ltr">
        <ScrollVideoHero
          texts={content.texts}
          header={<PaperHeader forceLang="en" showLangToggle={false} showMobileMenu={false} />}
        />
      </div>
    </LanguageProvider>
  );
}

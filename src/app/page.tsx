import { ScrollVideoHero } from "@/components/hero/scroll-video-hero";
import { PaperHeader } from "@/components/paper/paper-header";
import { readContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const content = await readContent();
  // The cover hands over to the same workbook nav used on every inside page.
  return <ScrollVideoHero texts={content.texts} header={<PaperHeader />} />;
}

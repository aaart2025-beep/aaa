import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TransitionLink } from "@/components/transition/page-transition";
import { readContent } from "@/lib/content/store";
import { CategoryGallery } from "@/components/collection/category-gallery";
import type { ContentProduct } from "@/lib/content/types";
import { defaultSizes } from "@/lib/products";
import { getLang } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/dictionary";
import { localizeProduct } from "@/lib/i18n/products-he";
import { PaperShell } from "@/components/paper/paper-shell";
import { PaperHeader } from "@/components/paper/paper-header";
import { PaperFooter } from "@/components/paper/paper-footer";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ category: string }>;
}


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const { collections } = await readContent();
  const col = collections.find((c) => c.id === category);
  if (!col) return { title: "Not found — AAA" };
  return { title: `${col.title} — AAA`, description: col.subtitle };
}

export default async function CollectionCategoryPage({ params }: PageProps) {
  const { category } = await params;
  const content = await readContent();
  const lang = await getLang();
  const t = (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars);
  const collection = content.collections.find((c) => c.id === category);
  if (!collection) notFound();

  // Map each image back to its product for the card title/description.
  const productByImage = new Map<string, ContentProduct>();
  for (const p of content.products) {
    for (const img of p.images) {
      if (!productByImage.has(img)) productByImage.set(img, p);
    }
  }

  const seen = new Set<string>();
  const items = collection.images
    .filter((url) => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    })
    .map((url, i) => {
      const product = productByImage.get(url);
      const localized = product ? localizeProduct(product, lang) : undefined;
      return {
        id: product?.slug ?? `img-${i}`,
        title: product?.name ?? collection.title,
        desc: localized?.tagline ?? collection.subtitle,
        url,
        span: "", // uniform portrait cards
        product: product
          ? {
              slug: product.slug,
              price: product.price,
              discount: product.discount,
              images: product.images,
              sizes: product.sizes?.length ? product.sizes : defaultSizes(product.category),
              colors: product.colors ?? [],
            }
          : undefined,
      };
    });

  return (
    <PaperShell>
      <PaperHeader />

      <div className="px-5 pt-8 sm:px-8">
        <TransitionLink
          href="/collection"
          className="font-typewriter inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-ink/70 transition-colors hover:text-ink"
        >
          <span aria-hidden>←</span> {t("shop.backToCollection")}
        </TransitionLink>
      </div>

      <CategoryGallery
        imageItems={items}
        title={collection.title}
        description={collection.subtitle}
      />

      <PaperFooter />
    </PaperShell>
  );
}

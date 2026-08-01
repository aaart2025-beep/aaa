"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SiteContent, ContentProduct, ContentCollection, SizeGuide, Coupon, ShippingConfig, ShippingOption } from "@/lib/content/types";
import { LivePreview, type PreviewPage } from "@/components/admin/live-preview";
import { ProductRow } from "@/components/admin/product-editor";
import { Field, ImageManager, SectionHeading, inputCls, slugify, CollectionDndContext, type ImageDragRef } from "@/components/admin/admin-ui";
import { NAV_ITEMS, navTextKey } from "@/lib/nav";

/* ----------------------------- config ----------------------------- */

type SectionId = string;
interface TextSection {
  id: SectionId;
  label: string;
  desc: string;
  previewHref: string;
  prefixes: string[];
}

interface NavGroup {
  label: string;
  ids: SectionId[];
}

const TEXT_SECTIONS: TextSection[] = [
  { id: "home", label: "Home Page", desc: "The hero headline, subtitle and buttons", previewHref: "/#enter", prefixes: ["hero."] },
  { id: "shop", label: "Shop Page", desc: "The “Our Shop” heading, intro & custom-design section", previewHref: "/shop", prefixes: ["shop."] },
  { id: "create", label: "Create Page", desc: "The design-it-yourself studio copy", previewHref: "/create", prefixes: ["create."] },
  { id: "collection", label: "Collection Page", desc: "The “Our Collection” heading and intro", previewHref: "/collection", prefixes: ["collection."] },
  { id: "about", label: "About Page", desc: "The artist's story, quote and process steps", previewHref: "/about", prefixes: ["about."] },
  { id: "contact", label: "Contact Page", desc: "Contact copy, the studio e-mail and notes", previewHref: "/contact", prefixes: ["contact."] },
  { id: "login", label: "Login Screen", desc: "Login title and subtitle", previewHref: "/login", prefixes: ["login."] },
  { id: "brand", label: "Brand & Menu", desc: "Your logo text and the top menu links", previewHref: "/", prefixes: ["brand.", "nav."] },
  { id: "product-page", label: "Product Page", desc: "Labels and buttons on every product page", previewHref: "/shop", prefixes: ["product."] },
  { id: "footer", label: "Footer", desc: "The footer on every workbook page", previewHref: "/shop", prefixes: ["footer."] },
];

const NAV_GROUPS: NavGroup[] = [
  { label: "Catalog", ids: ["products", "collections"] },
  { label: "Pages", ids: ["home", "shop", "create", "collection", "about", "contact", "login"] },
  { label: "Site", ids: ["menu", "brand", "product-page", "sizeGuide", "checkout", "footer", "other"] },
];

const LABELS: Record<string, { label: string; hint?: string }> = {
  "brand.wordmark": { label: "Brand name (logo text)", hint: "Shown top-left on every page. Keep it short." },
  "nav.home": { label: "Menu — “Home” link" },
  "nav.shop": { label: "Menu — “Shop” link" },
  "nav.create": { label: "Menu — “Create” link" },
  "nav.collections": { label: "Menu — “Collections” link" },
  "nav.reviews": { label: "Menu — “Reviews” link" },
  "nav.about": { label: "Menu — “About” link" },
  "nav.contact": { label: "Menu — “Contact” link" },
  "hero.headlineA": { label: "Hero headline — line 1", hint: "Big text shown at the end of the home video." },
  "hero.headlineB": { label: "Hero headline — line 2" },
  "hero.subtitle": { label: "Hero subtitle", hint: "One sentence under the headline." },
  "hero.cta": { label: "Main button label" },
  "hero.ctaHover": { label: "Main button — hover text", hint: "Shown when a visitor hovers the button." },
  "hero.shopCta": { label: "“Enter the shop” button" },
  "hero.introCta": { label: "Scroll prompt", hint: "Tiny hint on the first screen." },
  "shop.eyebrow": { label: "Small label above the title" },
  "shop.title": { label: "Page title", hint: "The big handwritten heading (e.g. “Our Shop”)." },
  "shop.intro": { label: "Intro paragraph", hint: "Typed text under the title." },
  "shop.cta": { label: "“Shop collection” button" },
  "shop.toCollections": { label: "“View collections” button" },
  "shop.customTitle": { label: "Custom design — title" },
  "shop.customBody": { label: "Custom design — paragraph" },
  "shop.customCta": { label: "Custom design — upload label" },
  "create.eyebrow": { label: "Small label above the title" },
  "create.title": { label: "Page title" },
  "create.intro": { label: "Intro paragraph" },
  "create.note": { label: "Handwritten margin note" },
  "collection.eyebrow": { label: "Small label above the title" },
  "collection.title": { label: "Page title" },
  "collection.intro": { label: "Intro paragraph" },
  "about.eyebrow": { label: "Small label above the title" },
  "about.title": { label: "Title — line 1" },
  "about.title2": { label: "Title — line 2 (underlined)" },
  "about.opening": { label: "Handwritten opening", hint: "e.g. “Hi — I'm Amit.”" },
  "about.body1": { label: "Story — paragraph 1" },
  "about.body2": { label: "Story — paragraph 2" },
  "about.body3": { label: "Story — paragraph 3" },
  "about.quote": { label: "Pull quote" },
  "about.cta": { label: "“See the pieces” button" },
  "about.ctaCreate": { label: "“Design your own” button" },
  "about.processTitle": { label: "Process — heading" },
  "about.process1": { label: "Process — step 1" },
  "about.process2": { label: "Process — step 2" },
  "about.process3": { label: "Process — step 3" },
  "about.process4": { label: "Process — step 4" },
  "about.photoAlt": { label: "Studio photo — alt text", hint: "Describes the photo for screen readers." },
  "about.photoNote": { label: "Studio photo — handwritten caption" },
  "contact.eyebrow": { label: "Small label above the title" },
  "contact.title": { label: "Page title" },
  "contact.body": { label: "Intro paragraph" },
  "contact.email": { label: "Studio e-mail address", hint: "Used for the contact button, inquiries and the newsletter." },
  "contact.cardLabel": { label: "Card — small label" },
  "contact.note": { label: "Card — handwritten note" },
  "contact.socialLabel": { label: "Card — socials label" },
  "product.back": { label: "“Back to the shop” link" },
  "product.notes": { label: "“Construction notes” heading" },
  "product.buy": { label: "“Buy now” button" },
  "footer.follow": { label: "“Follow the studio” label" },
  "footer.tagline": { label: "Tagline under the logo" },
  "footer.newsletter": { label: "Newsletter label" },
  "footer.credit": { label: "Credit line" },
  "footer.backToCover": { label: "“Back to cover” link" },
  "login.heading": { label: "Login title" },
  "login.subtitle": { label: "Login subtitle" },
};

function prettyKey(key: string): string {
  return key
    .split(".")
    .map((p) => p.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^\w/, (c) => c.toUpperCase()))
    .join(" — ");
}

const PREVIEW_PAGES = [
  { label: "Home", href: "/#enter" },
  { label: "Shop", href: "/shop" },
  { label: "Collection", href: "/collection" },
  { label: "Login", href: "/login" },
];

function useWidth<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [w, setW] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setW(e.contentRect.width);
    });
    ro.observe(el);
    setW(el.offsetWidth);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/* ============================== main ============================== */

interface AdminConsoleProps {
  initialContent: SiteContent;
  textKeys: string[];
}

export function AdminConsole({ initialContent, textKeys }: AdminConsoleProps) {
  const router = useRouter();
  const [content, setContent] = React.useState<SiteContent>(initialContent);
  const [section, setSection] = React.useState<SectionId>("products");
  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [status, setStatus] = React.useState<string | null>(null);
  const [previewHref, setPreviewHref] = React.useState("/shop");
  const [productSearch, setProductSearch] = React.useState("");
  const [openSlug, setOpenSlug] = React.useState<string | null>(null);
  const prodDrag = React.useRef<number | null>(null);
  const [prodOver, setProdOver] = React.useState<number | null>(null);

  const mutate = React.useCallback((updater: (c: SiteContent) => SiteContent) => {
    setContent((prev) => updater(structuredClone(prev)));
    setDirty(true);
    setStatus(null);
  }, []);

  // Warn before leaving with unsaved edits.
  React.useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  // Catch-all section for any text key not matched by a defined section.
  const matchedPrefixes = TEXT_SECTIONS.flatMap((s) => s.prefixes);
  const otherKeys = textKeys.filter((k) => !matchedPrefixes.some((p) => k.startsWith(p)));

  const sectionMeta = React.useMemo(() => {
    const m = new Map<SectionId, { label: string; href: string }>();
    for (const s of TEXT_SECTIONS) m.set(s.id, { label: s.label, href: s.previewHref });
    m.set("products", { label: "Products", href: "/shop" });
    m.set("collections", { label: "Collections", href: "/collection" });
    m.set("menu", { label: "Navigation", href: "/shop" });
    m.set("sizeGuide", { label: "Size Guide", href: "/policies/sizes" });
    m.set("checkout", { label: "Checkout", href: "/checkout" });
    m.set("other", { label: "Other text", href: "/" });
    return m;
  }, []);

  function goSection(id: SectionId) {
    setSection(id);
    const href = sectionMeta.get(id)?.href;
    if (href) setPreviewHref(href);
  }

  const save = React.useCallback(async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string; conflict?: boolean };
        setStatus(j.error ?? "Save failed");
        if (j.conflict) {
          // Another tab/device saved after this console loaded. Reload the
          // authoritative copy so the next save is based on it.
          const fresh = (await fetch("/api/content", { cache: "no-store" })
            .then((r) => (r.ok ? (r.json() as Promise<SiteContent>) : null))
            .catch(() => null));
          if (fresh) {
            setContent(fresh);
            setDirty(false);
          }
        }
        return;
      }
      const ok = (await res.json().catch(() => ({}))) as { updatedAt?: string };
      if (ok.updatedAt) setContent((c) => ({ ...c, updatedAt: ok.updatedAt }));
      setDirty(false);
      setStatus("Saved ✓ — live on the site");
      router.refresh();
    } catch {
      setStatus("Save failed");
    } finally {
      setSaving(false);
    }
  }, [content, router]);

  // ⌘S / Ctrl+S saves from anywhere in the console.
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty && !saving) void save();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [dirty, saving, save]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  /* ---- helpers ---- */
  const setText = (key: string, value: string) =>
    mutate((c) => ({ ...c, texts: { ...c.texts, [key]: value } }));
  const setProduct = (i: number, patch: Partial<ContentProduct>) =>
    mutate((c) => {
      c.products[i] = { ...c.products[i], ...patch };
      return c;
    });
  const addProduct = () => {
    const slug = `new-product-${Date.now().toString(36)}`;
    mutate((c) => {
      c.products.unshift({
        slug,
        name: "New product",
        category: "Clothing",
        price: 0,
        tagline: "",
        description: "",
        details: [],
        images: [],
      });
      return c;
    });
    setOpenSlug(slug);
    setProductSearch("");
  };
  const removeProduct = (i: number) =>
    mutate((c) => {
      c.products.splice(i, 1);
      return c;
    });
  /* reorder products → sets their order on the Shop page (top-left first) */
  const moveProduct = (from: number, to: number) =>
    mutate((c) => {
      if (from === to || from < 0 || from >= c.products.length) return c;
      const [m] = c.products.splice(from, 1);
      c.products.splice(Math.max(0, Math.min(to, c.products.length)), 0, m);
      return c;
    });
  const setCollection = (i: number, patch: Partial<ContentCollection>) =>
    mutate((c) => {
      c.collections[i] = { ...c.collections[i], ...patch };
      return c;
    });
  const setNavVisible = (key: string, visible: boolean) =>
    mutate((c) => ({ ...c, navVisible: { ...(c.navVisible ?? {}), [key]: visible } }));
  const setSizeGuide = (updater: (sg: SizeGuide) => SizeGuide) =>
    mutate((c) => ({ ...c, sizeGuide: updater(c.sizeGuide ?? { intro: "", rows: [] }) }));
  const setCoupons = (updater: (list: Coupon[]) => Coupon[]) =>
    mutate((c) => ({ ...c, coupons: updater(c.coupons ?? []) }));
  const setShipping = (updater: (s: ShippingConfig) => ShippingConfig) =>
    mutate((c) => ({ ...c, shipping: updater(c.shipping ?? { options: [] }) }));
  const addCollection = () =>
    mutate((c) => {
      c.collections.push({
        id: `new-collection-${Date.now().toString(36)}`,
        title: "New collection",
        subtitle: "",
        images: [],
        reverse: false,
      });
      return c;
    });
  const removeCollection = (i: number) =>
    mutate((c) => {
      c.collections.splice(i, 1);
      return c;
    });

  /* drop into a collection: add a product from the bank, or move a photo
     from another collection (cross-section reorder) */
  const dndDrag = React.useRef<ImageDragRef | null>(null);
  const onCollectionDrop = React.useCallback(
    (from: ImageDragRef, toGroupId: string, toIndex: number) =>
      mutate((c) => {
        const ti = c.collections.findIndex((col) => col.id === toGroupId);
        if (ti < 0) return c;
        const dest = c.collections[ti].images;

        if (from.kind === "bank") {
          if (dest.includes(from.src)) return c; // already in this collection
          const at = Math.max(0, Math.min(toIndex, dest.length));
          dest.splice(at, 0, from.src);
          return c;
        }

        const fi = c.collections.findIndex((col) => col.id === from.groupId);
        if (fi < 0 || fi === ti) return c;
        const [moved] = c.collections[fi].images.splice(from.index, 1);
        if (moved === undefined) return c;
        const at = Math.max(0, Math.min(toIndex, dest.length));
        dest.splice(at, 0, moved);
        return c;
      }),
    [mutate],
  );

  const visibleGroups = NAV_GROUPS.map((g) => ({
    ...g,
    ids: g.ids.filter((id) => id !== "other" || otherKeys.length > 0),
  }));

  const activeTextSection = TEXT_SECTIONS.find((s) => s.id === section);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-neutral-950 text-neutral-100">
      {/* Top bar */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-y-2 border-b border-white/10 bg-neutral-950 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] font-semibold tracking-[0.3em]">{content.texts["brand.wordmark"] ?? "AAA"}</span>
          <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-amber-300">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {dirty ? (
            <span className="flex items-center gap-1.5 text-[12px] text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" /> Unsaved
            </span>
          ) : status ? (
            <span className="text-[12px] text-neutral-400">{status}</span>
          ) : null}
          <nav className="flex flex-wrap items-center gap-1">
            {[
              { href: "/admin/orders", label: "Orders" },
              { href: "/admin/messages", label: "Messages" },
              { href: "/admin/customers", label: "Customers" },
              { href: "/admin/reviews", label: "Reviews" },
              { href: "/admin/media", label: "Media" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-2.5 py-1.5 text-[12px] font-medium text-amber-200 transition hover:bg-amber-400/20"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/" className="hidden text-[13px] text-neutral-400 hover:text-white sm:inline">
            View site
          </Link>
          <button onClick={logout} className="rounded-lg border border-white/15 px-3 py-1.5 text-[13px] text-neutral-300 hover:bg-white/5">
            Log out
          </button>
          <button
            onClick={save}
            disabled={saving || !dirty}
            title="⌘S"
            className="rounded-lg bg-white px-4 py-1.5 text-[13px] font-medium text-neutral-900 transition disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_minmax(340px,36%)]">
        {/* Editor pane: sidebar + content */}
        <div className="flex min-h-0 min-w-0">
          {/* Sidebar (≥md) */}
          <nav className="hidden w-[200px] shrink-0 overflow-y-auto border-r border-white/10 px-3 py-4 md:block">
            {visibleGroups.map((g) => (
              <div key={g.label} className="mb-5">
                <div className="mb-1.5 px-2 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-600">
                  {g.label}
                </div>
                <div className="flex flex-col gap-0.5">
                  {g.ids.map((id) => {
                    const meta = sectionMeta.get(id);
                    if (!meta) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => goSection(id)}
                        className={`rounded-lg px-2.5 py-1.5 text-left text-[13px] transition ${
                          section === id
                            ? "bg-white text-neutral-900"
                            : "text-neutral-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Mobile section chips */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="shrink-0 overflow-x-auto border-b border-white/10 px-4 py-3 md:hidden">
              <div className="flex gap-1.5">
                {visibleGroups.flatMap((g) => g.ids).map((id) => {
                  const meta = sectionMeta.get(id);
                  if (!meta) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => goSection(id)}
                      className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] transition ${
                        section === id ? "bg-white text-neutral-900" : "text-neutral-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              {/* TEXT SECTIONS */}
              {activeTextSection && (
                <div className="mx-auto flex max-w-2xl flex-col gap-5">
                  <SectionHeading title={activeTextSection.label} desc={activeTextSection.desc} />
                  {textKeys
                    .filter((k) => activeTextSection.prefixes.some((p) => k.startsWith(p)))
                    .map((key) => (
                      <TextField key={key} k={key} value={content.texts[key] ?? ""} onChange={(v) => setText(key, v)} />
                    ))}
                </div>
              )}

              {section === "other" && (
                <div className="mx-auto flex max-w-2xl flex-col gap-5">
                  <SectionHeading title="Other text" desc="Any remaining editable copy on the site." />
                  {otherKeys.map((key) => (
                    <TextField key={key} k={key} value={content.texts[key] ?? ""} onChange={(v) => setText(key, v)} />
                  ))}
                </div>
              )}

              {/* PRODUCTS */}
              {section === "products" && (
                <div className="mx-auto flex max-w-3xl flex-col gap-4">
                  <SectionHeading
                    title="Products"
                    desc="Everything in the shop — photos, the five studio views, story and specs. Drag a row to set the order on the Shop page (top of the list = first/top-left). Use Hide to keep a piece off the shop without deleting it."
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={addProduct}
                      className="rounded-lg bg-amber-400 px-4 py-2 text-[13px] font-medium text-neutral-900 transition hover:bg-amber-300"
                    >
                      + New product
                    </button>
                    <input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products…"
                      className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] outline-none focus:border-white/40"
                    />
                  </div>
                  {productSearch.trim() !== "" && (
                    <p className="-mt-1 text-[11px] text-neutral-500">Clear the search to drag-reorder products.</p>
                  )}
                  <div className="flex flex-col gap-2.5">
                    {content.products
                      .map((p, i) => ({ p, i }))
                      .filter(({ p }) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                      .map(({ p, i }) => {
                        const canReorder = productSearch.trim() === "";
                        const draggable = canReorder && openSlug !== p.slug;
                        return (
                          <div
                            key={p.slug + i}
                            draggable={draggable}
                            onDragStart={(e) => {
                              prodDrag.current = i;
                              e.dataTransfer.effectAllowed = "move";
                              try {
                                e.dataTransfer.setData("text/plain", String(i));
                              } catch {
                                /* noop */
                              }
                            }}
                            onDragOver={(e) => {
                              if (!canReorder || prodDrag.current === null) return;
                              e.preventDefault();
                              if (prodOver !== i) setProdOver(i);
                            }}
                            onDrop={(e) => {
                              if (!canReorder || prodDrag.current === null) return;
                              e.preventDefault();
                              moveProduct(prodDrag.current, i);
                              prodDrag.current = null;
                              setProdOver(null);
                            }}
                            onDragEnd={() => {
                              prodDrag.current = null;
                              setProdOver(null);
                            }}
                            className={`rounded-xl transition-shadow ${prodOver === i ? "ring-2 ring-amber-300/70" : ""}`}
                          >
                            <ProductRow
                              product={p}
                              open={openSlug === p.slug}
                              reorderable={canReorder}
                              hidden={!!p.hidden}
                              onToggleHidden={() => setProduct(i, { hidden: !p.hidden })}
                              onToggle={() => setOpenSlug(openSlug === p.slug ? null : p.slug)}
                              onChange={(patch) => setProduct(i, patch)}
                              onRemove={() => {
                                removeProduct(i);
                                if (openSlug === p.slug) setOpenSlug(null);
                              }}
                            />
                          </div>
                        );
                      })}
                    {content.products.length === 0 && (
                      <p className="text-[13px] text-neutral-500">No products yet — click “New product”.</p>
                    )}
                  </div>
                </div>
              )}

              {/* COLLECTIONS */}
              {section === "collections" && (
                <CollectionDndContext.Provider value={{ drag: dndDrag, onCrossDrop: onCollectionDrop }}>
                  <div className="flex gap-5">
                    <div className="flex min-w-0 flex-1 flex-col gap-4">
                      <SectionHeading
                        title="Collections"
                        desc="The photo strips on the Collection page. Drag photos to reorder, drag between collections, or drag a product from the bank →"
                      />
                      <button
                        onClick={addCollection}
                        className="self-start rounded-lg bg-amber-400 px-4 py-2 text-[13px] font-medium text-neutral-900 transition hover:bg-amber-300"
                      >
                        + New collection
                      </button>
                      {content.collections.map((col, i) => (
                        <CollectionEditor
                          key={i}
                          collection={col}
                          onChange={(patch) => setCollection(i, patch)}
                          onRemove={() => removeCollection(i)}
                        />
                      ))}
                    </div>
                    <ProductBank products={content.products} />
                  </div>
                </CollectionDndContext.Provider>
              )}

              {/* NAVIGATION — show / hide menu pages */}
              {section === "menu" && (
                <div className="mx-auto flex max-w-2xl flex-col gap-4">
                  <SectionHeading
                    title="Navigation"
                    desc="Choose which pages appear in the menu (top bar, mobile menu and the home end-screen). Hidden pages still work directly by their web address."
                  />
                  <div className="overflow-hidden rounded-xl border border-white/10">
                    {NAV_ITEMS.map((item) => {
                      const visible = content.navVisible?.[item.key] !== false;
                      const label = content.texts[navTextKey(item.key)] ?? item.fallback;
                      return (
                        <label
                          key={item.key}
                          className="flex cursor-pointer items-center justify-between gap-4 border-b border-white/10 px-4 py-3 last:border-b-0 hover:bg-white/[0.03]"
                        >
                          <span className="flex flex-col">
                            <span className="text-[14px] font-medium">{label}</span>
                            <span className="text-[11px] text-neutral-500">{item.href}</span>
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={visible}
                            onClick={() => setNavVisible(item.key, !visible)}
                            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                              visible ? "bg-amber-400" : "bg-white/15"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                visible ? "translate-x-[22px]" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-[12px] text-neutral-500">
                    Order is fixed: Shop · Collections · Create, then About · Contact.
                  </p>
                </div>
              )}

              {/* SIZE GUIDE — the editable measurements table */}
              {section === "sizeGuide" && (
                <SizeGuideEditor guide={content.sizeGuide ?? { intro: "", rows: [] }} onChange={setSizeGuide} />
              )}

              {/* CHECKOUT — coupons + shipping */}
              {section === "checkout" && (
                <CheckoutEditor
                  coupons={content.coupons ?? []}
                  shipping={content.shipping ?? { options: [] }}
                  onCoupons={setCoupons}
                  onShipping={setShipping}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sticky device preview — renders live from the draft you're editing */}
        <div className="sticky top-0 hidden h-[calc(100vh-57px)] border-l border-white/10 lg:block">
          <DevicePreview content={content} href={previewHref} onHref={setPreviewHref} />
        </div>
      </div>
    </div>
  );
}

/* ============================ preview ============================ */

function hrefToPage(href: string): PreviewPage {
  if (href.startsWith("/collection")) return "collection";
  if (href.startsWith("/shop")) return "shop";
  if (href.startsWith("/login")) return "login";
  return "home";
}

function DevicePreview({
  content,
  href,
  onHref,
}: {
  content: SiteContent;
  href: string;
  onHref: (href: string) => void;
}) {
  const [device, setDevice] = React.useState<"desktop" | "phone">("desktop");
  const [areaRef, areaW] = useWidth<HTMLDivElement>();
  const page = hrefToPage(href);

  const logicalW = device === "phone" ? 390 : 1366;
  const logicalH = device === "phone" ? 844 : 854;
  const avail = Math.max(120, areaW - 28);
  const scale = Math.min(1, avail / logicalW);
  const w = Math.round(logicalW * scale);
  const h = Math.round(logicalH * scale);

  const scaled = (
    <div className="overflow-hidden bg-black" style={{ width: w, height: h }}>
      <div style={{ width: logicalW, height: logicalH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <LivePreview content={content} page={page} device={device} />
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2.5">
        <div className="inline-flex rounded-lg border border-white/10 p-0.5">
          {(["desktop", "phone"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`rounded-md px-2.5 py-1 text-[12px] capitalize transition ${
                device === d ? "bg-white text-neutral-900" : "text-neutral-300 hover:text-white"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-0.5">
          {PREVIEW_PAGES.map((pg) => (
            <button
              key={pg.href}
              onClick={() => onHref(pg.href)}
              className={`rounded px-2 py-1 text-[12px] transition ${
                href === pg.href ? "bg-white/15 text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              {pg.label}
            </button>
          ))}
        </div>
        <a href={href} target="_blank" rel="noreferrer" className="rounded px-2 py-1 text-[12px] text-neutral-400 hover:text-white" title="Open the real site">
          ↗
        </a>
      </div>

      {/* Frame */}
      <div ref={areaRef} className="flex min-h-0 flex-1 items-start justify-center overflow-auto p-3">
        {device === "desktop" ? (
          <div className="overflow-hidden rounded-xl border border-white/15 bg-neutral-900 shadow-2xl" style={{ width: w }}>
            <div className="flex h-7 items-center gap-1.5 border-b border-white/10 px-3">
              <span className="h-2 w-2 rounded-full bg-red-400/70" />
              <span className="h-2 w-2 rounded-full bg-amber-400/70" />
              <span className="h-2 w-2 rounded-full bg-green-400/70" />
              <span className="ml-2 truncate text-[10px] text-neutral-500">aaa{href === "/#enter" ? "/" : href}</span>
            </div>
            {scaled}
          </div>
        ) : (
          <div className="rounded-[2.2rem] border-[7px] border-neutral-800 bg-black shadow-2xl" style={{ width: w + 14 }}>
            <div className="mx-auto mt-1 mb-1 h-4 w-20 rounded-b-xl bg-neutral-800" />
            <div className="overflow-hidden rounded-[1.6rem]">{scaled}</div>
          </div>
        )}
      </div>
      <p className="shrink-0 px-3 pb-2 text-center text-[11px] text-neutral-500">
        Updates <span className="text-amber-300">live</span> as you edit · Save to publish (⌘S) · ↗ opens the real site
      </p>
    </div>
  );
}

/* ============================ collections ============================ */

/** Right-hand palette of every product — drag a tile into any collection. */
function ProductBank({ products }: { products: ContentProduct[] }) {
  const dnd = React.useContext(CollectionDndContext);
  const [q, setQ] = React.useState("");
  const items = products.filter((p) => p.images?.[0] && p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <aside className="sticky top-0 hidden h-[calc(100vh-120px)] w-96 shrink-0 flex-col rounded-xl border border-white/10 bg-white/[0.02] p-3 lg:flex">
      <p className="text-[12px] font-semibold text-neutral-200">Product bank</p>
      <p className="mt-0.5 text-[11px] text-neutral-500">Drag a product into any collection.</p>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products…"
        className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[12px] outline-none focus:border-white/40"
      />
      <div className="mt-2 grid min-h-0 flex-1 grid-cols-2 content-start gap-2 overflow-y-auto pr-0.5 [grid-auto-rows:10rem]">
        {items.map((p) => (
          <div
            key={p.slug}
            draggable
            title={`${p.name} — drag into a collection`}
            onDragStart={(e) => {
              if (dnd) dnd.drag.current = { kind: "bank", src: p.images[0] };
              e.dataTransfer.effectAllowed = "copy";
              try {
                e.dataTransfer.setData("text/plain", p.slug);
              } catch {
                /* noop */
              }
            }}
            onDragEnd={() => {
              if (dnd) dnd.drag.current = null;
            }}
            className="group relative cursor-grab overflow-hidden rounded-lg border border-white/10 bg-neutral-800 active:cursor-grabbing hover:border-amber-300/60"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.images[0]} alt={p.name} draggable={false} className="pointer-events-none block h-40 w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-1.5 pb-1 pt-5">
              <p className="truncate text-[10px] font-medium text-neutral-100">{p.name}</p>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="col-span-2 mt-4 text-center text-[11px] text-neutral-600">No products match.</p>}
      </div>
    </aside>
  );
}

function CollectionEditor({
  collection,
  onChange,
  onRemove,
}: {
  collection: ContentCollection;
  onChange: (patch: Partial<ContentCollection>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title">
          <input value={collection.title} onChange={(e) => onChange({ title: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Subtitle">
          <input value={collection.subtitle} onChange={(e) => onChange({ subtitle: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Web address (id)" hint={`/collection/${collection.id || "…"}`}>
          <input value={collection.id} onChange={(e) => onChange({ id: slugify(e.target.value) })} className={inputCls} />
        </Field>
        <label className="flex items-end gap-2 pb-1.5 text-[13px] text-neutral-300">
          <input type="checkbox" checked={!!collection.reverse} onChange={(e) => onChange({ reverse: e.target.checked })} />
          Scroll this row in reverse
        </label>
      </div>
      <div className="mt-3">
        <ImageManager
          images={collection.images}
          onChange={(images) => onChange({ images })}
          note="Photos that scroll in this collection row."
          groupId={collection.id}
        />
      </div>
      <button
        onClick={() => {
          if (confirm("Delete this collection?")) onRemove();
        }}
        className="mt-3 rounded-lg border border-red-500/30 px-3 py-1.5 text-[12px] text-red-300 hover:bg-red-500/10"
      >
        Delete collection
      </button>
    </div>
  );
}

/* ============================ size guide ============================ */

function SizeGuideEditor({
  guide,
  onChange,
}: {
  guide: SizeGuide;
  onChange: (updater: (sg: SizeGuide) => SizeGuide) => void;
}) {
  const rows = guide.rows ?? [];
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <SectionHeading
        title="Size Guide"
        desc="The measurements table on the Size Guide page (linked in the footer and on every product page). Add a row per size and type the exact numbers."
      />
      <Field label="Intro (optional)" hint="A short line shown above the table.">
        <textarea
          value={guide.intro ?? ""}
          onChange={(e) => onChange((sg) => ({ ...sg, intro: e.target.value }))}
          rows={2}
          className={inputCls}
        />
      </Field>

      <div className="flex flex-col gap-2">
        <div className="hidden grid-cols-[7rem_1fr_2.25rem] gap-2 px-1 text-[11px] uppercase tracking-wider text-neutral-500 sm:grid">
          <span>Size</span>
          <span>Measurements</span>
          <span />
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[6rem_1fr_2.25rem] items-center gap-2 sm:grid-cols-[7rem_1fr_2.25rem]">
            <input
              value={r.size}
              placeholder="M"
              onChange={(e) =>
                onChange((sg) => {
                  const rr = [...sg.rows];
                  rr[i] = { ...rr[i], size: e.target.value };
                  return { ...sg, rows: rr };
                })
              }
              className={inputCls}
            />
            <input
              value={r.measure}
              placeholder="Chest 54cm · Length 72cm · Sleeve 63cm"
              onChange={(e) =>
                onChange((sg) => {
                  const rr = [...sg.rows];
                  rr[i] = { ...rr[i], measure: e.target.value };
                  return { ...sg, rows: rr };
                })
              }
              className={inputCls}
            />
            <button
              onClick={() => onChange((sg) => ({ ...sg, rows: sg.rows.filter((_, k) => k !== i) }))}
              title="Remove row"
              className="rounded-md border border-red-500/30 py-2 text-[12px] text-red-300 transition hover:bg-red-500/10"
            >
              ✕
            </button>
          </div>
        ))}
        {rows.length === 0 && <p className="text-[13px] text-neutral-500">No sizes yet — add your first row.</p>}
      </div>

      <button
        onClick={() => onChange((sg) => ({ ...sg, rows: [...(sg.rows ?? []), { size: "", measure: "" }] }))}
        className="self-start rounded-lg bg-amber-400 px-4 py-2 text-[13px] font-medium text-neutral-900 transition hover:bg-amber-300"
      >
        + Add size
      </button>
    </div>
  );
}

/* ============================ checkout ============================ */

function CheckoutEditor({
  coupons,
  shipping,
  onCoupons,
  onShipping,
}: {
  coupons: Coupon[];
  shipping: ShippingConfig;
  onCoupons: (updater: (list: Coupon[]) => Coupon[]) => void;
  onShipping: (updater: (s: ShippingConfig) => ShippingConfig) => void;
}) {
  const options = shipping.options ?? [];
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-7">
      {/* coupons */}
      <div className="flex flex-col gap-3">
        <SectionHeading title="Coupon codes" desc="Discount codes customers can enter at checkout. Percent = % off; Amount = ₪ off." />
        <div className="flex flex-col gap-2">
          {coupons.map((cp, i) => (
            <div key={i} className="grid grid-cols-[1fr_6rem_5rem_auto_2rem] items-center gap-2">
              <input
                value={cp.code}
                placeholder="WELCOME10"
                onChange={(e) => onCoupons((l) => l.map((x, k) => (k === i ? { ...x, code: e.target.value.toUpperCase() } : x)))}
                className={inputCls}
              />
              <select
                value={cp.kind}
                onChange={(e) => onCoupons((l) => l.map((x, k) => (k === i ? { ...x, kind: e.target.value as Coupon["kind"] } : x)))}
                className={`${inputCls} bg-neutral-900`}
              >
                <option value="percent">% off</option>
                <option value="amount">₪ off</option>
              </select>
              <input
                type="number"
                value={cp.value || ""}
                onChange={(e) => onCoupons((l) => l.map((x, k) => (k === i ? { ...x, value: Number(e.target.value) || 0 } : x)))}
                className={inputCls}
              />
              <label className="flex items-center gap-1.5 text-[12px] text-neutral-300">
                <input
                  type="checkbox"
                  checked={cp.active !== false}
                  onChange={(e) => onCoupons((l) => l.map((x, k) => (k === i ? { ...x, active: e.target.checked } : x)))}
                  className="h-4 w-4 accent-amber-400"
                />
                on
              </label>
              <button
                onClick={() => onCoupons((l) => l.filter((_, k) => k !== i))}
                title="Remove"
                className="rounded-md border border-red-500/30 py-2 text-[12px] text-red-300 transition hover:bg-red-500/10"
              >
                ✕
              </button>
            </div>
          ))}
          {coupons.length === 0 && <p className="text-[13px] text-neutral-500">No coupon codes yet.</p>}
        </div>
        <button
          onClick={() => onCoupons((l) => [...l, { code: "", kind: "percent", value: 10, active: true }])}
          className="self-start rounded-lg bg-amber-400 px-4 py-2 text-[13px] font-medium text-neutral-900 transition hover:bg-amber-300"
        >
          + Add coupon
        </button>
      </div>

      {/* shipping */}
      <div className="flex flex-col gap-3">
        <SectionHeading title="Shipping" desc="Options shown at checkout, with their price in ₪." />
        <Field label="Free shipping over (₪)" hint="0 or blank = no free-shipping threshold.">
          <input
            type="number"
            value={shipping.freeOver ?? ""}
            onChange={(e) => {
              const n = Number(e.target.value) || 0;
              onShipping((s) => ({ ...s, freeOver: n > 0 ? n : undefined }));
            }}
            className={inputCls}
          />
        </Field>
        <div className="flex flex-col gap-2">
          <div className="hidden grid-cols-[1fr_6rem_2rem] gap-2 px-1 text-[11px] uppercase tracking-wider text-neutral-500 sm:grid">
            <span>Label</span>
            <span>Price ₪</span>
            <span />
          </div>
          {options.map((o, i) => (
            <div key={i} className="grid grid-cols-[1fr_6rem_2rem] items-center gap-2">
              <input
                value={o.label}
                placeholder="Home delivery"
                onChange={(e) =>
                  onShipping((s) => ({ ...s, options: s.options.map((x, k) => (k === i ? { ...x, label: e.target.value } : x)) }))
                }
                className={inputCls}
              />
              <input
                type="number"
                value={o.price || 0}
                onChange={(e) =>
                  onShipping((s) => ({ ...s, options: s.options.map((x, k) => (k === i ? { ...x, price: Number(e.target.value) || 0 } : x)) }))
                }
                className={inputCls}
              />
              <button
                onClick={() => onShipping((s) => ({ ...s, options: s.options.filter((_, k) => k !== i) }))}
                title="Remove"
                className="rounded-md border border-red-500/30 py-2 text-[12px] text-red-300 transition hover:bg-red-500/10"
              >
                ✕
              </button>
            </div>
          ))}
          {options.length === 0 && <p className="text-[13px] text-neutral-500">No shipping options yet.</p>}
        </div>
        <button
          onClick={() =>
            onShipping((s) => ({
              ...s,
              options: [...(s.options ?? []), { id: `ship-${(s.options?.length ?? 0) + 1}`, label: "", price: 0 } as ShippingOption],
            }))
          }
          className="self-start rounded-lg bg-amber-400 px-4 py-2 text-[13px] font-medium text-neutral-900 transition hover:bg-amber-300"
        >
          + Add shipping option
        </button>
      </div>
    </div>
  );
}

/* ============================ shared ============================ */

function TextField({ k, value, onChange }: { k: string; value: string; onChange: (v: string) => void }) {
  const meta = LABELS[k] ?? { label: prettyKey(k) };
  const long = value.length > 60;
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[13px] font-medium text-neutral-200">{meta.label}</span>
      {meta.hint && <span className="-mt-0.5 text-[11px] text-neutral-500">{meta.hint}</span>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={long ? 3 : 1}
        className={inputCls}
      />
      <span className="font-mono text-[10px] text-neutral-600">{k}</span>
    </label>
  );
}

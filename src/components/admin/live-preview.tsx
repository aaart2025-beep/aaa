"use client";

import type { SiteContent } from "@/lib/content/types";

export type PreviewPage = "home" | "collection" | "shop" | "login";

const formatUSD = (n: number) =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(n || 0);

/**
 * A faithful, real-time mock of the site rendered straight from the draft
 * content — so edits appear instantly (no save, no iframe reload). It mirrors
 * the real layout/copy (minus the video & animations). `device` switches the
 * desktop / phone composition.
 */
export function LivePreview({
  content,
  page,
  device,
}: {
  content: SiteContent;
  page: PreviewPage;
  device: "desktop" | "phone";
}) {
  const t = (k: string, f: string) => content.texts[k] ?? f;
  const phone = device === "phone";

  const navLinks = [
    t("nav.home", "Home"),
    t("nav.shop", "Shop"),
    t("nav.collections", "Collections"),
    t("nav.about", "About"),
    t("nav.contact", "Contact"),
  ];

  const Nav = ({ light = false }: { light?: boolean }) => (
    <div
      className={`absolute inset-x-0 top-0 z-10 flex h-12 items-center justify-between px-5 ${
        light ? "border-b border-black/10 bg-white/70 text-neutral-900" : "border-b border-white/10 bg-black/40 text-white"
      }`}
    >
      <span className="text-[13px] font-semibold tracking-[0.3em]">{t("brand.wordmark", "AAA")}</span>
      {phone ? (
        <span className="text-lg">☰</span>
      ) : (
        <nav className="flex gap-5 text-[13px] opacity-85">
          {navLinks.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </nav>
      )}
      <span className={`rounded-full border px-3 py-1 text-[11px] ${light ? "border-black/20" : "border-white/25"}`}>
        {t("nav.login", "Log in")}
      </span>
    </div>
  );

  if (page === "home") {
    return (
      <div className="relative h-full w-full bg-night text-white">
        <Nav />
        <div className="flex h-full flex-col items-center justify-center px-8 text-center">
          <h1 className={`font-semibold leading-[1.02] tracking-tight ${phone ? "text-[34px]" : "text-[64px]"}`}>
            {t("hero.headlineA", "Wearable art")}
          </h1>
          <h1 className={`font-semibold leading-[1.02] tracking-tight ${phone ? "text-[34px]" : "text-[64px]"}`}>
            {t("hero.headlineB", "made by hand")}
          </h1>
          <p className={`mt-6 text-white/80 ${phone ? "text-[15px]" : "text-[20px]"}`}>{t("hero.subtitle", "")}</p>
          <div className={`mt-9 rounded-2xl bg-black/80 font-mono uppercase tracking-widest ${phone ? "px-5 py-3 text-[13px]" : "px-7 py-4 text-[18px]"}`}>
            {t("hero.cta", "Our Collection")}
          </div>
          <div className={`mt-5 rounded-full bg-black/80 font-medium uppercase tracking-[0.25em] ${phone ? "px-5 py-2.5 text-[11px]" : "px-6 py-3 text-[12px]"}`}>
            {t("hero.shopCta", "Enter the shop")} ↓
          </div>
        </div>
      </div>
    );
  }

  if (page === "collection") {
    return (
      <div className="relative h-full w-full overflow-hidden bg-black text-white">
        <Nav />
        <div className="px-8 pt-20 text-center">
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">{t("collection.eyebrow", "")}</p>
          <h1 className={`mt-4 font-semibold tracking-tight ${phone ? "text-[34px]" : "text-[56px]"}`}>{t("collection.title", "Our Collection")}</h1>
          <p className={`mx-auto mt-4 max-w-xl text-white/65 ${phone ? "text-[13px]" : "text-[15px]"}`}>{t("collection.intro", "")}</p>
        </div>
        <div className="mt-8 flex flex-col gap-2">
          {content.collections.map((c, i) => (
            <div key={i} className="relative h-40 overflow-hidden bg-black">
              <div className="flex h-full items-center gap-3 px-3">
                {c.images.slice(0, 8).map((src, k) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={k} src={src} alt="" className="h-32 w-24 shrink-0 rounded-lg object-cover" />
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/85 via-black/45 to-black/65 text-center">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/55">{c.subtitle}</p>
                <h2 className={`mt-1 font-semibold tracking-tight ${phone ? "text-[26px]" : "text-[40px]"}`}>{c.title}</h2>
                <span className="mt-3 rounded-full border border-white/20 bg-black/80 px-4 py-1.5 text-[12px]">Shop {c.title} →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (page === "shop") {
    const tiles = content.products.filter((p) => p.images[0]).slice(0, phone ? 6 : 8);
    return (
      <div className="relative h-full w-full overflow-hidden bg-[#FAFAFA] text-neutral-900">
        <Nav light />
        <div className="flex h-full flex-col items-center justify-center px-8">
          <h1 className={`font-medium tracking-tight text-neutral-800 ${phone ? "text-[18px]" : "text-[26px]"}`}>Wearable art, one of one.</h1>
          <div className={`mt-8 grid w-full max-w-3xl gap-3 ${phone ? "grid-cols-2" : "grid-cols-4"}`}>
            {tiles.map((p, i) => (
              <div key={i} className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="aspect-[3/4] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                </div>
                <div className="px-2 py-1.5 text-[11px]">
                  <div className="truncate font-medium">{p.name}</div>
                  <div className="text-neutral-500">{formatUSD(p.price)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-full border border-black/15 bg-black/85 px-5 py-2 text-[12px] text-white">
            {t("shop.toCollections", "View collections")} →
          </div>
        </div>
      </div>
    );
  }

  // login
  return (
    <div className="relative h-full w-full bg-night text-white">
      <div className="flex h-full items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="text-[15px] font-semibold tracking-[0.42em]">{t("brand.wordmark", "AAA")}</div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">{t("login.heading", "Welcome back")}</h1>
          <p className="mt-2 text-[14px] text-neutral-400">{t("login.subtitle", "Sign in to continue to the collection.")}</p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-left">
            <div className="mb-2 text-[11px] uppercase tracking-wider text-neutral-400">Username</div>
            <div className="mb-4 h-11 rounded-xl border border-white/12 bg-white/[0.03]" />
            <div className="mb-2 text-[11px] uppercase tracking-wider text-neutral-400">Password</div>
            <div className="mb-5 h-11 rounded-xl border border-white/12 bg-white/[0.03]" />
            <div className="flex h-11 items-center justify-center rounded-full bg-white/90 text-[14px] font-medium text-neutral-900">
              Sign in
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

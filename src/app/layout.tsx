import type { Metadata, Viewport } from "next";
import { Geist, Jost, Special_Elite, Caveat, Archivo } from "next/font/google";
import "./globals.css";
import { PageTransition } from "@/components/transition/page-transition";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { AccessibilityMenu, A11Y_BOOTSTRAP } from "@/components/a11y/accessibility-menu";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import { LanguageProvider } from "@/lib/i18n/context";
import { getLang } from "@/lib/i18n/server";
import { dir } from "@/lib/i18n/config";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Body sans for the paper pages (.book-theme). Cormorant (the flipbook's
// display serif) loads only inside /a-book — see src/app/a-book/layout.tsx.
const bookSans = Jost({
  variable: "--font-sans-custom",
  subsets: ["latin"],
  display: "swap",
});

// Workbook voices: typewriter for spec labels, handwriting for margin notes.
const typewriter = Special_Elite({
  variable: "--font-typewriter",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
const script = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

// Bold grotesque for the product spec-sheet (title + labels).
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aaa-teal-theta.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AAA — Wearable Art",
  description: "Original clothing, custom footwear and one-off art objects, made by hand.",
  openGraph: {
    siteName: "AAA — Wearable Art",
    type: "website",
    description: "Original clothing, custom footwear and one-off art objects, made by hand.",
  },
};

const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AAA — Amit Amar Art",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo-aaa-ink.png`,
  description: "Original clothing, custom footwear and one-off art objects, made by hand.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLang();
  return (
    <html
      lang={lang}
      dir={dir(lang)}
      className={`dark ${geistSans.variable} ${bookSans.variable} ${typewriter.variable} ${script.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-night text-neutral-100">
        {/* Apply saved accessibility prefs before paint so choices don't flash. */}
        <script dangerouslySetInnerHTML={{ __html: A11Y_BOOTSTRAP }} />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }} />
        <LanguageProvider initial={lang}>
          <PageTransition>{children}</PageTransition>
          <CartDrawer />
          <WhatsAppFloat />
          <AccessibilityMenu />
        </LanguageProvider>
      </body>
    </html>
  );
}

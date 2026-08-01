import type { Metadata } from "next";
import { PaperShell } from "@/components/paper/paper-shell";
import { PaperHeader } from "@/components/paper/paper-header";
import { PaperFooter } from "@/components/paper/paper-footer";
import { CheckoutClient } from "@/components/checkout/checkout-client";
import { SketchDoodle } from "@/components/paper/sketch-doodle";
import { readContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout — AAA" };

export default async function CheckoutPage() {
  const content = await readContent();
  const email = content.texts["contact.email"] ?? "hello@example.com";
  // static export can point checkout at the live API origin; "" = same origin
  const apiBase = process.env.NEXT_PUBLIC_CHECKOUT_API_BASE ?? "";

  return (
    <PaperShell>
      <PaperHeader />
      <div className="mx-auto w-full max-w-[680px] flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <CheckoutClient email={email} apiBase={apiBase} coupons={content.coupons ?? []} shipping={content.shipping} />
        <div className="mt-12 flex justify-center">
          <SketchDoodle complexity="simple" caption className="w-20 sm:w-24" />
        </div>
      </div>
      <PaperFooter />
    </PaperShell>
  );
}

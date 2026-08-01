"use client";

/* Store policies — bilingual (English + Hebrew) via the i18n dictionary.
 * Rendered by <Section>, so the same text powers the checkout agreement, the
 * product "Care & washing" button, and the standalone policy pages. Content
 * components are Client Components (they call useT()); they can still be
 * rendered inside Server policy pages. The title constants below stay plain
 * strings for any importer that still needs them. */

import { useT } from "@/lib/i18n/context";

export interface PolicyBlock {
  h?: string;
  p?: string[];
  ul?: string[];
}

/* Legacy title constants kept for backwards compatibility with importers that
 * reference them by name. The policy pages now translate titles via t(). */
export const RETURNS_TITLE = "Return, Exchange & Cancellation Policy";
export const CARE_TITLE = "Product Care & Washing Instructions";
export const PRIVACY_TITLE = "Privacy Policy";
export const TERMS_TITLE = "Terms of Sale";
export const SHIPPING_TITLE = "Shipping Policy";
export const ACCESSIBILITY_TITLE = "Accessibility Statement";

function Section({ blocks }: { blocks: PolicyBlock[] }) {
  return (
    <div>
      {blocks.map((b, i) => (
        <div key={i} className="mb-4">
          {b.h && <h3 className="font-archivo mb-1.5 text-[12px] font-extrabold uppercase tracking-tight text-ink">{b.h}</h3>}
          {b.p?.map((para, j) => (
            <p key={j} className="font-typewriter mb-1.5 text-[11px] leading-[1.8] tracking-[0.02em] text-ink/75">
              {para}
            </p>
          ))}
          {b.ul && (
            <ul className="mb-1 ps-4 list-disc">
              {b.ul.map((li, j) => (
                <li key={j} className="font-typewriter mb-1 text-[11px] leading-[1.7] tracking-[0.02em] text-ink/75 marker:text-ink/70">
                  {li}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

/* Bilingual legal notice shown atop the privacy / terms / shipping /
 * accessibility content. Reads in the current language; the English version
 * governs in case of conflict. */
function LegalNote() {
  const t = useT();
  return (
    <div className="mb-5 rounded-md border border-ink/15 bg-paper-dark/10 px-3 py-2">
      <p className="font-typewriter text-[11px] leading-[1.8] tracking-[0.01em] text-ink/75">{t("policies.legalNote")}</p>
    </div>
  );
}

export function ReturnsPolicyContent() {
  const t = useT();
  const blocks: PolicyBlock[] = [
    { p: [t("policies.returns.intro")] },
    { h: t("policies.returns.handmade.h"), p: [t("policies.returns.handmade.p")] },
    {
      h: t("policies.returns.custom.h"),
      p: [t("policies.returns.custom.p1"), t("policies.returns.custom.p2"), t("policies.returns.custom.p3")],
    },
    { h: t("policies.returns.cancel.h"), ul: [t("policies.returns.cancel.li1"), t("policies.returns.cancel.li2")] },
    {
      h: t("policies.returns.exchanges.h"),
      p: [t("policies.returns.exchanges.p1")],
      ul: [t("policies.returns.exchanges.li1"), t("policies.returns.exchanges.li2"), t("policies.returns.exchanges.li3")],
    },
    { p: [t("policies.returns.window")] },
    {
      h: t("policies.returns.notDefect.h"),
      p: [t("policies.returns.notDefect.p1")],
      ul: [
        t("policies.returns.notDefect.li1"),
        t("policies.returns.notDefect.li2"),
        t("policies.returns.notDefect.li3"),
        t("policies.returns.notDefect.li4"),
        t("policies.returns.notDefect.li5"),
        t("policies.returns.notDefect.li6"),
      ],
    },
    {
      h: t("policies.returns.refunds.h"),
      p: [t("policies.returns.refunds.p1")],
      ul: [
        t("policies.returns.refunds.li1"),
        t("policies.returns.refunds.li2"),
        t("policies.returns.refunds.li3"),
        t("policies.returns.refunds.li4"),
      ],
    },
    { h: t("policies.returns.shippingCosts.h"), p: [t("policies.returns.shippingCosts.p1"), t("policies.returns.shippingCosts.p2")] },
    { h: t("policies.returns.unique.h"), p: [t("policies.returns.unique.p1")] },
  ];
  return <Section blocks={blocks} />;
}

export function CarePolicyContent() {
  const t = useT();
  const blocks: PolicyBlock[] = [
    { p: [t("policies.care.intro")] },
    {
      h: t("policies.care.general.h"),
      ul: [
        t("policies.care.general.li1"),
        t("policies.care.general.li2"),
        t("policies.care.general.li3"),
        t("policies.care.general.li4"),
        t("policies.care.general.li5"),
        t("policies.care.general.li6"),
        t("policies.care.general.li7"),
        t("policies.care.general.li8"),
        t("policies.care.general.li9"),
      ],
    },
    { h: t("policies.care.handmade.h"), p: [t("policies.care.handmade.p")] },
    {
      h: t("policies.care.disclaimer.h"),
      p: [t("policies.care.disclaimer.p1")],
      ul: [
        t("policies.care.disclaimer.li1"),
        t("policies.care.disclaimer.li2"),
        t("policies.care.disclaimer.li3"),
        t("policies.care.disclaimer.li4"),
        t("policies.care.disclaimer.li5"),
        t("policies.care.disclaimer.li6"),
        t("policies.care.disclaimer.li7"),
        t("policies.care.disclaimer.li8"),
      ],
    },
    { p: [t("policies.care.damage")] },
    { h: t("policies.care.specific.h"), p: [t("policies.care.specific.p")] },
  ];
  return <Section blocks={blocks} />;
}

/* ------------------------------------------------------------------ *
 * Privacy Policy, Terms of Sale, Shipping, Accessibility Statement.
 * Plain-language drafts with real default clauses (governing law, LoL,
 * indemnity, GDPR/CCPA rights). Not legal advice — have a licensed
 * attorney confirm for your jurisdiction. Effective date: 7 July 2026.
 * ------------------------------------------------------------------ */

export function PrivacyPolicyContent() {
  const t = useT();
  const blocks: PolicyBlock[] = [
    { p: [t("policies.privacy.intro")] },
    { h: t("policies.privacy.who.h"), p: [t("policies.privacy.who.p")] },
    {
      h: t("policies.privacy.collect.h"),
      p: [t("policies.privacy.collect.p1")],
      ul: [
        t("policies.privacy.collect.li1"),
        t("policies.privacy.collect.li2"),
        t("policies.privacy.collect.li3"),
        t("policies.privacy.collect.li4"),
        t("policies.privacy.collect.li5"),
      ],
    },
    { h: t("policies.privacy.payment.h"), p: [t("policies.privacy.payment.p")] },
    {
      h: t("policies.privacy.use.h"),
      ul: [
        t("policies.privacy.use.li1"),
        t("policies.privacy.use.li2"),
        t("policies.privacy.use.li3"),
        t("policies.privacy.use.li4"),
      ],
    },
    { h: t("policies.privacy.legalBases.h"), p: [t("policies.privacy.legalBases.p")] },
    {
      h: t("policies.privacy.share.h"),
      p: [t("policies.privacy.share.p1")],
      ul: [
        t("policies.privacy.share.li1"),
        t("policies.privacy.share.li2"),
        t("policies.privacy.share.li3"),
        t("policies.privacy.share.li4"),
      ],
    },
    { h: t("policies.privacy.transfers.h"), p: [t("policies.privacy.transfers.p")] },
    { h: t("policies.privacy.retention.h"), p: [t("policies.privacy.retention.p")] },
    {
      h: t("policies.privacy.rights.h"),
      p: [t("policies.privacy.rights.p1")],
      ul: [
        t("policies.privacy.rights.li1"),
        t("policies.privacy.rights.li2"),
        t("policies.privacy.rights.li3"),
        t("policies.privacy.rights.li4"),
        t("policies.privacy.rights.li5"),
      ],
    },
    { p: [t("policies.privacy.request")] },
    { h: t("policies.privacy.cookies.h"), p: [t("policies.privacy.cookies.p")] },
    { h: t("policies.privacy.children.h"), p: [t("policies.privacy.children.p")] },
    { h: t("policies.privacy.changes.h"), p: [t("policies.privacy.changes.p")] },
  ];
  return (
    <>
      <LegalNote />
      <Section blocks={blocks} />
    </>
  );
}

export function TermsOfSaleContent() {
  const t = useT();
  const blocks: PolicyBlock[] = [
    { p: [t("policies.terms.intro")] },
    { h: t("policies.terms.handmade.h"), p: [t("policies.terms.handmade.p")] },
    { h: t("policies.terms.prices.h"), p: [t("policies.terms.prices.p")] },
    {
      h: t("policies.terms.custom.h"),
      p: [t("policies.terms.custom.p1")],
      ul: [t("policies.terms.custom.li1"), t("policies.terms.custom.li2")],
    },
    {
      h: t("policies.terms.content.h"),
      p: [t("policies.terms.content.p1")],
      ul: [
        t("policies.terms.content.li1"),
        t("policies.terms.content.li2"),
        t("policies.terms.content.li3"),
        t("policies.terms.content.li4"),
        t("policies.terms.content.li5"),
      ],
    },
    { h: t("policies.terms.trademarks.h"), p: [t("policies.terms.trademarks.p")] },
    { h: t("policies.terms.ip.h"), p: [t("policies.terms.ip.p")] },
    { h: t("policies.terms.dmca.h"), p: [t("policies.terms.dmca.p")] },
    { h: t("policies.terms.liability.h"), p: [t("policies.terms.liability.p")] },
    { h: t("policies.terms.law.h"), p: [t("policies.terms.law.p")] },
    { h: t("policies.terms.changes.h"), p: [t("policies.terms.changes.p")] },
  ];
  return (
    <>
      <LegalNote />
      <Section blocks={blocks} />
    </>
  );
}

export function ShippingPolicyContent() {
  const t = useT();
  const blocks: PolicyBlock[] = [
    { p: [t("policies.shipping.intro")] },
    { h: t("policies.shipping.processing.h"), p: [t("policies.shipping.processing.p")] },
    { h: t("policies.shipping.where.h"), p: [t("policies.shipping.where.p")] },
    { h: t("policies.shipping.estimates.h"), p: [t("policies.shipping.estimates.p")] },
    { h: t("policies.shipping.customs.h"), p: [t("policies.shipping.customs.p")] },
    { h: t("policies.shipping.lost.h"), p: [t("policies.shipping.lost.p")] },
  ];
  return (
    <>
      <LegalNote />
      <Section blocks={blocks} />
    </>
  );
}

export function AccessibilityStatementContent() {
  const t = useT();
  const blocks: PolicyBlock[] = [
    { p: [t("policies.accessibility.intro")] },
    {
      h: t("policies.accessibility.done.h"),
      ul: [
        t("policies.accessibility.done.li1"),
        t("policies.accessibility.done.li2"),
        t("policies.accessibility.done.li3"),
        t("policies.accessibility.done.li4"),
        t("policies.accessibility.done.li5"),
        t("policies.accessibility.done.li6"),
      ],
    },
    { h: t("policies.accessibility.limitations.h"), p: [t("policies.accessibility.limitations.p")] },
    { h: t("policies.accessibility.tell.h"), p: [t("policies.accessibility.tell.p")] },
    { h: t("policies.accessibility.coordinator.h"), p: [t("policies.accessibility.coordinator.p")] },
    { p: [t("policies.accessibility.reviewed")] },
  ];
  return (
    <>
      <LegalNote />
      <Section blocks={blocks} />
    </>
  );
}

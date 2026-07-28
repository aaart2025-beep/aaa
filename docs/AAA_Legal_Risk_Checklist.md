# AAA (Amit Amar Art) — Website Legal-Risk Checklist & Fix Plan

> **Not legal advice.** I'm not a lawyer. This is a plain-language summary of the main
> ways a **direct-to-consumer clothing / streetwear store** like AAA can draw complaints or
> lawsuits, based on current (2025–2026) rules, plus concrete fixes. AAA sells physical goods
> (and AI-assisted custom "one-of-one" pieces) and ships internationally, so it faces
> **e-commerce + accessibility + privacy** exposure — a different mix than a SaaS app. Because
> web-accessibility and deceptive-pricing suits are surging, have a real attorney review the
> site, the store terms, and the return/refund flow before you rely on any of this.

---

## What AAA actually is (scoping the risk)

- **Storefront:** `/`, `/shop`, `/shop/[slug]`, `/collection`, `/collection/[category]`, product cards with **discounted / struck-through "sale" prices**.
- **Custom design tool:** `/create` — an AI + 3D configurator that lets a customer design a
  "one-of-one" garment/shoe (pick base, paint parts, place a mark, choose fabric). User-generated
  content → its own IP/liability layer.
- **Checkout:** collects **name, email, phone, shipping address**; order posts to a Stripe-backed
  API with a `mailto` fallback. Real personal + payment data.
- **Marketing surfaces:** home, about, contact, the "a-book" experience, footer newsletter, and
  social links (Instagram, WhatsApp).
- **Heavy motion:** WebGL hero, page-flip "book", autoplay scrubbing, "breathing" product images.

Because it's a **store**, the two biggest real-world risks are **(1) website accessibility** and
**(2) deceptive pricing / marketing** — not the AI-calling / TCPA stuff from the SaaS version of
this checklist. Those SaaS sections are removed; e-commerce sections are added.

---

## The 6 real exposure areas (ranked by how likely they are to bite you)

### 1. Website accessibility (ADA Title III / WCAG) ← the #1 lawsuit magnet for online stores
Retail e-commerce is the single most-sued category for web accessibility. A store that can't be
used with a keyboard/screen reader, has low-contrast text, or forces motion is a textbook target.
These suits are surging (~3,100+ federal web cases in 2025, many now AI-drafted by pro-se filers),
and **California's Unruh Act** adds **$4,000 statutory damages per visit** on top of ADA.

- **Standard courts use:** **WCAG 2.1 / 2.2 Level AA.**
- **Typical settlement:** $2,000–$50,000+ plus remediation cost.
- **AAA-specific hot spots:** the light-grey caption/price text (contrast), the WebGL hero +
  page-flip book + autoplay + "breathing" images (motion), custom `/create` configurator
  (keyboard/AT operability of a canvas tool), icon-only buttons (cart, social), product images.
- **Fixes (must be real code fixes — overlay "accessibility widgets" are themselves getting sued):**
  - Text zoom to 200% without breaking layout; use `rem/em`, never block pinch-zoom
    (no `user-scalable=no` / `maximum-scale`).
  - Color contrast ≥ 4.5:1 (normal text), 3:1 (large text / UI); fix the grey captions/prices;
    never signal state (sale, selected size, error) by color alone — add text/icon/underline.
  - Full keyboard operability + visible `:focus-visible` outlines on every control, incl. the
    cart, size chips, filters, and `/create` tools; add a **skip-to-content** link.
  - Alt text on every product/photo `<img>`; `aria-label` on icon-only buttons; a real `<label>`
    on every checkout/newsletter field; correct heading order + landmarks (`header/nav/main/footer`).
  - **Honor `@media (prefers-reduced-motion: reduce)`** across the hero, book, and image
    "breathe" — reduce or stop motion for users who ask for it. (You already use this token in
    several components; make it cover *all* the animated surfaces.)
  - Add a **persistent, real accessibility control** (text-size A / A+ / A++, high-contrast
    toggle, reduce-motion toggle) that writes actual CSS/state — not a bolt-on overlay.
  - Publish an **Accessibility Statement** page (`/accessibility`) with a way to report problems,
    linked in the global footer.

### 2. Deceptive pricing & marketing claims ← you just shipped a discount feature, so read this
The moment you show a struck-through "was" price next to a lower "sale" price, you're in
**FTC + state deceptive-pricing** territory. A fake or inflated "original" price is a classic
UDAP/class-action trigger.

- **Rules:** FTC Act §5 (deceptive advertising) + FTC **Guides Against Deceptive Pricing**
  (a "former price" must be a **genuine, recent, bona fide** price the item was actually offered
  at, not an invented anchor) + the FTC **Consumer Reviews & Testimonials Rule** (in effect since
  Oct 2024; civil penalties up to ~$53,000 **per violation**) + state UDAP laws. Some states
  (e.g. CA) regulate how long ago the "former price" must have been in effect.
- **Also risky on AAA:** any "used by / worn by / trusted by" counts you can't prove; superlatives
  ("#1", "best", "the only"); scarcity/urgency ("almost gone", "selling fast", countdown timers)
  that isn't true; **material / origin claims** — "organic", "100% cotton", "handmade", "Made in ___",
  "one-of-one" — must be literally true (FTC Textile/Wool labeling + fiber-content rules); fake or
  incentivized reviews/testimonials; invented brand logos or press ("as seen in").
- **Fixes:**
  - For every discounted product, make sure the struck **"original" price is a real price the item
    was genuinely sold at recently** — keep proof (screenshots / price history) on file. Don't set
    an inflated MSRP just to show a bigger % off.
  - Only use **real** reviews from real buyers; disclose any incentive/relationship; don't suppress
    negative reviews.
  - Make scarcity/urgency claims only when true; if you show "limited"/"one-of-one", it must be.
  - Keep material, size, care, and "Made in ___" statements accurate; keep written proof for every
    factual claim **before** it goes live.

### 3. Terms of Sale, returns, shipping & pricing disclosures
A store needs clear **terms of sale** and legally-required **shipping/return** disclosures. You
already have `/policies/returns` and `/policies/care` — good start; make them complete and link the
rest.

- **Rules:** FTC **Mail, Internet, or Telephone Order Merchandise Rule** — ship within the time you
  state (or 30 days if none stated); if you can't, notify the buyer and offer a refund. Many states
  require a **conspicuous refund/return policy** (in some, no-posted-policy = returns allowed).
  International sales → you must be clear about **who pays customs/duties/taxes**.
- **Fixes:**
  - Add a routed **Terms of Sale / Terms & Conditions** page (`/terms`): who you are, order
    acceptance, pricing & currency, payment (Stripe), shipping times, risk of loss, returns,
    "as is"/limitation of liability, governing law, and a **no-guaranteed-results / colors-may-vary**
    note for handmade + AI-custom items.
  - Make the **Returns/Refund** policy state: window, condition, who pays return shipping, refund
    method + timing, and whether **custom `/create` pieces are final-sale** (say so clearly — custom
    goods are commonly non-returnable, but you must disclose it up front).
  - Add a **Shipping** section: processing time, carriers, regions, estimated delivery, and a
    **duties/taxes on international orders are the buyer's responsibility** line (if that's your policy).
  - Show **total price, currency, and any taxes/fees** clearly before the customer commits.

### 4. Privacy & data protection (US + likely EU/UK)
Checkout collects name, email, phone, and shipping address; you send data to Stripe; you have a
newsletter. That's regulated personal data — and because you **ship internationally from Israel**,
you very likely fall under **GDPR / UK-GDPR**, not just US state law.

- **Rules:** **GDPR / UK-GDPR** (EU/UK shoppers — lawful basis, privacy notice, data-subject rights,
  fines up to 4% of global turnover); **CCPA/CPRA** and other US state privacy laws (CA penalties up
  to ~$7,988 per intentional violation); **Israel's Privacy Protection Law**; card data must stay
  with **Stripe/PCI**, never your own logs.
- **Fixes:**
  - Publish a routed **Privacy Policy** (`/privacy`, footer-linked on every page): what you collect
    (contact + shipping + order data), why, who you share it with (Stripe, shipping/email providers),
    how long you keep it, international transfers, and user rights (access/delete/opt-out) with a
    contact method. Give it an **effective date** and review it every 12 months.
  - **Don't log or email full payment details** — confirm Stripe handles card data end-to-end and
    your `mailto` fallback never includes card numbers.
  - Add a **cookie/consent banner only if you add analytics/tracking/marketing pixels** (none
    detected today — so skip it for now, but revisit the moment you add GA/Meta pixel/etc.).
  - Newsletter opt-in should be clear and separate from checkout; store consent.

### 5. Email / SMS marketing (CAN-SPAM · TCPA texting · Meta/WhatsApp)
This replaces the SaaS "AI auto-dialer" section. AAA doesn't auto-call leads, but it has a
**newsletter** and WhatsApp/Instagram contact — so the risk is **marketing messages**, not robocalls.

- **Rules:** **CAN-SPAM** (marketing emails need a real physical postal address, a truthful subject/
  "from", and a working one-click unsubscribe honored promptly); **TCPA/TSR** (marketing **texts**
  need prior express written consent + STOP opt-out — $500–$1,500 per text); **WhatsApp/Meta**
  business-messaging opt-in rules if you message customers there.
- **Fixes:**
  - Every marketing email: include AAA's **postal address** + a working **unsubscribe** link.
  - Don't send marketing **SMS/WhatsApp** without explicit opt-in; honor STOP immediately.
  - Keep transactional order emails (receipts, shipping updates) separate from marketing — those
    are fine without opt-in.

### 6. Third-party brands, IP & the `/create` custom-design tool
Two things here: (a) don't imply partnerships you don't have, and (b) the AI/custom design tool lets
customers put **whatever they want** on a garment — including other people's trademarks, logos, and
faces. That's a real infringement + right-of-publicity channel that needs terms + a takedown process.

- **Rules:** trademark/copyright infringement, **right of publicity** (celebrity likeness),
  **DMCA** safe harbor (requires a registered **designated agent** + notice-and-takedown to be
  protected), and platform/print-partner content rules.
- **Fixes:**
  - Only claim integrations/partners/press that are real; add "trademarks belong to their respective
    owners; AAA is not affiliated with or endorsed by them" wherever third-party marks appear.
  - On `/create`, add a short **content policy + user warranty**: the customer confirms they have the
    rights to any image/text/mark they upload or apply, agree not to submit infringing/illegal/hateful
    content, grant AAA a license to produce it, and **indemnify** AAA for their content. State **who
    owns** the resulting design and whether custom pieces are **final sale**.
  - Publish a **DMCA / IP-complaint** contact (can live on `/terms`) and, if volume grows, register a
    DMCA designated agent (~$6 with the Copyright Office).
  - Reserve the right to refuse/cancel any custom order that violates the content policy.

---

## Fastest way to reduce risk this week
1. **Accessibility pass** (biggest lawsuit risk): darken the grey text to ≥4.5:1, add a real
   accessibility control (text-size + contrast + reduce-motion), make everything keyboard-operable
   with visible focus, ensure `prefers-reduced-motion` covers the hero/book/images, add alt text +
   field labels + a skip link.
2. **Verify every discounted product's struck "original" price is a genuine former price** and label
   any sample/lookbook imagery honestly.
3. **Add the 4 missing legal pages, footer-linked everywhere:** Privacy Policy (`/privacy`), Terms of
   Sale (`/terms`), Accessibility Statement (`/accessibility`), and complete the Returns + Shipping
   disclosures. Add a short `/create` content policy.
4. **Confirm no card data is logged/emailed** anywhere in the checkout/order path.
5. Have a lawyer review the store terms, return/refund flow, and (given EU/UK shipping) your
   GDPR privacy notice.

---

## Copy-paste Claude Code prompt
Paste this into Claude Code at the root of the AAA repo (`~/artist-site-app`).

```
You are auditing and fixing my web app (AAA / Amit Amar Art — a direct-to-consumer streetwear
store with a discount/sale-price feature, an AI + 3D "/create" custom-design tool, and
international shipping) for legal and accessibility risk. Work in TWO phases and STOP for my
review after Phase 1.

============================================================
PHASE 1 — AUDIT (read-only; produce LEGAL_AUDIT.md; change no code yet)
============================================================
First, build a PAGE INVENTORY of every route/template: home (/), shop, shop/[slug], collection,
collection/[category], create, about, contact, checkout, checkout/success, a-book,
policies/returns, policies/care, login, plus the footer, cart drawer, product cards, and any
transactional emails. Run EVERY check below on EVERY page, and report per-page with file:line.
Don't stop at the homepage.

SEARCH FOR THESE EXACT THINGS (grep the whole repo — code, JSX, markdown, content JSON, image
alt text, meta tags):

1) Deceptive pricing & marketing — search (case-insensitive) for:
   - discount/sale mechanics: "discount", "sale", "was", "original", "% off", "strike", "MSRP",
     "compare at" — and verify each struck "original" price is a genuine former price, not an anchor.
   - customer/social proof: "trusted by", "worn by", "used by", "customers", "reviews",
     "testimonial", "rating", "stars", "as seen", "featured in", "award", "#1", "best", "guarantee".
   - scarcity/urgency: "limited", "one-of-one", "almost gone", "selling fast", "only X left",
     "last chance", countdown timers — flag any that may not be literally true.
   - material/origin: "organic", "100%", "cotton", "handmade", "Made in", fiber-content claims.
   - third-party brands/logos in copy and /public: partner or press logos.
   For each hit: file:line, the exact text, flag UNVERIFIED unless proof exists in the repo.

2) Accessibility (WCAG 2.2 AA) — audit every page and report failures for:
   - viewport meta with "user-scalable=no"/"maximum-scale" (blocks zoom); pinch-zoom blocked.
   - text hard-coded in px instead of rem/em; layout that breaks at 200% zoom.
   - color contrast: list every failing foreground/background pair with hex + ratio (esp. the
     light-grey captions/prices).
   - state shown by COLOR ALONE (sale tag, selected size, form error) with no icon/text.
   - non-keyboard-operable controls (onClick on div/span, canvas /create tools), missing focus.
   - missing :focus-visible styles; missing skip-to-content link.
   - <img> without alt (product photos!); icon-only buttons (cart, social) without aria-label.
   - <input>/<select>/<textarea> without an associated <label> (checkout, newsletter).
   - broken heading order / missing landmarks (header/nav/main/footer).
   - animation with NO prefers-reduced-motion handling — list every animated surface (hero,
     a-book flip, autoplay scrub, image "breathe") and whether reduced-motion covers it.
   - video/audio without captions.
   Do NOT recommend a third-party "accessibility overlay/widget" — those get sued too.

3) Missing legal pages — check routes + footer links for: Privacy Policy, Terms of Sale,
   Accessibility Statement, a complete Returns/Refund policy, and a Shipping policy. Flag each that
   is missing or not linked in the footer of every page. (Returns + Care already exist.)

4) Data & payment safety — find everywhere the checkout/order path handles personal data: confirm
   no full card/payment data is logged, stored, or included in the mailto fallback; confirm card
   data stays with Stripe. Note what PII is collected and where it's sent (Stripe, email, shipping).

5) /create content & IP — flag that the custom-design tool has no content policy / user warranty /
   indemnity / ownership terms / final-sale disclosure, and no DMCA/IP-complaint contact.

Output LEGAL_AUDIT.md as a prioritized checklist (High/Med/Low), grouped by page, with file:line.

============================================================
PHASE 2 — FIX (only after I approve the audit)
============================================================
A. Accessibility (WCAG 2.2 AA): fix everything from Phase 1 — remove any zoom blockers, move text
   to rem/em, survive 200% zoom, fix all contrast to >=4.5:1 (large/UI >=3:1) incl. the grey
   captions/prices, add icons/text so color isn't the only signal, make every control keyboard
   operable with visible :focus-visible, add a skip-to-content link, add alt text + <label>s +
   landmarks + correct ARIA, and make @media (prefers-reduced-motion: reduce) cover ALL animated
   surfaces. Add a persistent, REAL accessibility control (text-size A/A+/A++, high-contrast toggle,
   reduce-motion toggle) that writes actual state/CSS — not an overlay. Add an /accessibility page
   with a report-an-issue contact.
B. Pricing & marketing: ensure every struck "original" price is a genuine former price; label any
   sample/lookbook data honestly; keep only real, provable claims and reviews; add "trademarks
   belong to their respective owners; AAA is not affiliated with or endorsed by them" wherever
   third-party marks appear.
C. Legal pages: scaffold routed /privacy, /terms, /accessibility, complete /policies/returns +
   add /policies/shipping, all linked in the global footer on every page. Real structure, but put
   any wording that needs a lawyer behind a clearly marked [PLACEHOLDER] with a visible TODO banner
   "Attorney review required before launch." Add a cookie/consent banner ONLY if analytics/tracking
   scripts exist (today none do).
D. /create content & IP: add a short content policy + user warranty/indemnity checkbox (customer
   confirms they own the rights, won't submit infringing/illegal content, licenses AAA to produce
   it), state design ownership + that custom pieces are final sale, and add a DMCA/IP-complaint
   contact.
E. REQUIRED DISCLAIMERS — make sure the Terms of Sale AND relevant pages clearly state, in plain
   language (mark true legal clauses as [PLACEHOLDER] for my lawyer):
   - Handmade / one-of-one / AI-custom items: colors, textures, and exact appearance may vary from
     on-screen renders; each piece is unique; not a defect.
   - No guaranteed results / sample data: any lookbook, demo, or sample figures are illustrative,
     not a promise.
   - Custom /create pieces are final sale (or state the exact policy); customer warrants rights to
     their content and indemnifies AAA for it.
   - Service/goods "as is", limitation of liability, governing law. [PLACEHOLDER where legal wording
     is needed]
   - Data/privacy: what's collected (contact, shipping, order data), that payment is handled by
     Stripe, and a link to the Privacy Policy.
   - Shipping: processing/delivery times and that international duties/taxes are the buyer's
     responsibility (if that's your policy).

Constraints: keep the existing "maker's workbook" design/styling; make minimal, clearly-labeled
diffs; never invent facts, reviews, customer counts, materials, or partnerships; put anything
needing legal wording behind [PLACEHOLDER] + a TODO banner. After Phase 2, output a summary of
every file changed and a remaining "for your attorney" list.
```

---

## What changed vs. the Foreman (SaaS) version — quick map
- **Removed:** TCPA AI-voice auto-dialer section, and the "AI accountant / bookkeeping" disclaimer
  (AAA doesn't call leads or give financial advice).
- **Promoted to #1:** website accessibility — online stores are the top ADA/WCAG lawsuit target,
  and AAA is motion-heavy with low-contrast text.
- **New/expanded for e-commerce:** deceptive **sale-price** rules (your new discount feature),
  Terms of Sale + Returns + Shipping (FTC Mail-Order Rule, international duties), payment/PCI via
  Stripe, and the `/create` custom-design **content/IP/indemnity/final-sale** layer.
- **Rescoped:** the "auto-messaging" section → ordinary **email/SMS marketing (CAN-SPAM/TCPA texting)**
  for the newsletter + WhatsApp/IG contact.
- **Added:** GDPR/UK-GDPR (international shipping) alongside US state privacy law.

---

*Prepared as general information, July 2026. Verify against a licensed attorney before relying on it.*

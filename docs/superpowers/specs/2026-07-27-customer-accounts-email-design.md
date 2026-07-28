# Customer Accounts + Transactional Email — Design

**Date:** 2026-07-27
**Site:** artbyaaa.com (aaa — Amit Amar Art, Next.js 16 on Vercel, project `aaa-website`)
**Approach:** A — Supabase for identity + customer data only; orders stay in Vercel Blob.

## Goals

1. Customers can create accounts and log in (email+password, magic link; Google later).
2. Logged-in customers get: order history, saved 3D designs, checkout autofill, wishlist.
3. Order emails send from `orders@artbyaaa.com`: itemized receipt to the customer,
   new-order alert to the client, shipped notification on fulfillment.

## Non-goals

- Moving orders or CMS content out of Vercel Blob (declined 2026-07-27; admin console unchanged).
- Tax-compliant invoicing (receipt emails are itemized order summaries, not tax invoices).
- Stripe integration changes (checkout keeps its current email-fallback flow).

## Architecture

- **Auth:** Supabase Auth on the client's project `amit amar art` (ref `ezywfxinftfurrwqmoix`).
  Cookie sessions via `@supabase/ssr`. Server routes and server components read the session;
  no client-side token storage.
- **Customer data:** new Postgres tables in the same project, RLS enforced per-user.
- **Orders:** remain in Blob (`orders` key, versioned writes). Logged-in checkout stamps
  `userId` onto the order. "My orders" = server route filtering the orders list by
  `userId`, falling back to case-insensitive email match for pre-account orders.
- **Email:** Resend (free tier). Domain `artbyaaa.com` verified via two DNS records added
  through the Vercel CLI (domain is Vercel-managed). Send failures log and retry once;
  they never fail an order.

## Data model (Supabase)

```sql
profiles       (id uuid PK = auth.users.id, display_name text, phone text,
                address jsonb, created_at, updated_at)
saved_designs  (id uuid PK, user_id uuid FK -> auth.users, name text,
                design jsonb, preview_url text, created_at)
wishlist_items (id uuid PK, user_id uuid FK -> auth.users, product_slug text,
                created_at, UNIQUE(user_id, product_slug))
```

RLS on all three: `user_id = auth.uid()` (profiles: `id = auth.uid()`) for
select/insert/update/delete. No service-role usage in request paths.

## Flows

- **Signup/login:** `/account/login` — password form + "email me a login link" +
  signup. Confirmation and reset emails via Supabase hosted flows, redirecting to
  `/account`. UI patterned on the existing admin `login-form.tsx`.
- **Account hub `/account`:** tabs Orders / Designs / Wishlist / Details.
  Designs tab has "load in studio" → opens `/create` with the saved design applied.
- **Checkout:** logged-in → autofill address from profile, stamp `userId`, send receipt.
  Guest → unchanged, receipt still sent to entered email.
- **Save design in `/create`:** logged-in saves directly; logged-out prompts login and
  preserves the in-progress design across the redirect.
- **Nav:** account icon — logged-out → `/account/login`; logged-in → `/account`.

## Email spec

| Trigger              | To                  | Template                       |
|----------------------|---------------------|--------------------------------|
| Order created        | customer email      | Itemized receipt (order id, items, totals, shipping) |
| Order created        | `NOTIFY_EMAIL`      | New-order alert with admin link |
| Fulfillment → shipped| customer email      | Shipped notice with order summary |

Sender: `orders@artbyaaa.com`. Reply-to: `NOTIFY_EMAIL` (the client's aaart inbox).
Phase 6 points Supabase auth SMTP at Resend so auth emails also come from the domain.

## Config inputs (Vercel env)

- `RESEND_API_KEY` — created during phase 1 on the client's Resend account.
- `NOTIFY_EMAIL` — the client's aaart inbox; required before phase 1 deploys.
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — already set (2026-07-27).

## Error handling

- Email: failures never block order creation; log + one retry; admin alert failure is
  silent to the customer.
- Supabase outage: browsing/guest checkout unaffected; account surfaces show a
  friendly unavailable state.
- RLS is the security boundary for customer data; order filtering happens server-side
  only (Blob orders contain other customers' data and never reach the client unfiltered).

## Testing

- Playwright E2E: signup → confirm → login → save design → checkout → order in history.
- RLS: cross-user read attempts must fail (tested with two seeded users).
- Email: template render tests + Resend test mode; checkout success asserted even with
  email endpoint mocked to fail.

## Build order (independently shippable)

1. Email foundation (DNS, Resend, receipt + admin alert) — benefits guests immediately.
2. Supabase Auth + `/account` with order history.
3. Profiles + checkout autofill.
4. Saved designs (incl. `/create` save button).
5. Wishlist.
6. Google OAuth + Supabase SMTP via Resend (needs client's Google console; DNS proven).

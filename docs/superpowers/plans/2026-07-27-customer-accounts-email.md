# Customer Accounts + Transactional Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Customer logins (Supabase Auth) with order history, saved 3D designs, checkout autofill and wishlist, plus transactional order emails sent from orders@artbyaaa.com (Resend).

**Architecture:** Supabase (project `amit amar art`, ref `ezywfxinftfurrwqmoix`) handles identity and customer data with RLS; orders and CMS content stay in Vercel Blob. Email is an isolated `src/lib/email` module called fire-and-forget from the order routes — an email failure never fails an order. Each phase ships independently.

**Tech Stack:** Next.js 16 (App Router, `src/proxy.ts` middleware), TypeScript, Vercel, Vercel Blob, Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Resend REST API (no SDK), vitest (new), Playwright (final task).

## Global Constraints

- Site deploys from git `main` → Vercel project `aaa-website` (team `aaart2025-beeps-projects`). Push = deploy.
- Production URL: https://www.artbyaaa.com (until DNS resolves, use https://aaa-website-lac.vercel.app).
- Vercel env already set: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NOTIFY_EMAIL=aaart2025@gmail.com`, `BLOB_STORE_ID`, `ADMIN_USER`, `ADMIN_PASS`, `AAA_AUTH_SECRET`, `ALLOWED_ORIGINS`, `NEXT_PUBLIC_SITE_URL`.
- Email failures must NEVER block or fail an order (spec requirement).
- No service-role Supabase key anywhere; RLS is the only data boundary for customer tables.
- Existing code style: 2-space indent, double quotes, top-of-file comment blocks explaining "why". Follow it.
- Commit style: `feat:`/`fix:`/`docs:` prefixes, no attribution footer.
- Before each commit: `npx tsc --noEmit` must pass. `npx next build` before each push.

## File Structure

```
src/lib/email/send.ts            # Resend transport: sendEmail(), emailEnabled, FROM/NOTIFY
src/lib/email/templates.ts       # Pure Order -> {subject, html, text} template functions
src/lib/email/order-emails.ts    # sendOrderEmails(), sendShippedEmail() orchestration
src/lib/supabase/client.ts       # Browser Supabase client factory
src/lib/supabase/server.ts       # Server (cookies) Supabase client factory
src/lib/account/orders.ts        # ordersForUser() — filter Blob orders by identity
supabase/migrations/0001_customer_accounts.sql   # profiles, saved_designs, wishlist_items + RLS
scripts/apply-supabase-sql.mjs   # Applies a .sql file via Supabase Management API
src/app/account/login/page.tsx   # Customer login/signup/magic-link page
src/app/account/page.tsx         # Account hub (tabs)
src/app/api/account/orders/route.ts  # Session -> own orders JSON
src/components/account/*.tsx     # login-form, orders-tab, details-tab, designs-tab, wishlist-tab, account-nav
vitest.config.ts                 # New test runner config (alias @/ -> src/)
tests/email-templates.test.ts    # Template unit tests
tests/account-orders.test.ts     # ordersForUser unit tests
e2e/account.spec.ts              # Playwright E2E (final task)
```

Modified: `src/proxy.ts` (session refresh), `src/lib/orders/types.ts` (Order.userId), `src/app/api/orders/route.ts` (emails + userId stamp), `src/app/api/admin/orders/route.ts` (shipped email), `src/components/checkout/checkout-client.tsx` (autofill prop), `src/app/checkout/page.tsx` (pass profile), `src/components/creator/creator.tsx` (save design button), `src/components/paper/shop-grid.tsx` (wishlist hearts), site nav (account icon), `package.json`.

---

## Phase 1 — Email foundation

### Task 1: Resend account, domain verification, API key

Operational task — no app code. Produces a verified sending domain and `RESEND_API_KEY` in Vercel env.

**Files:** none (env + DNS only)

**Interfaces:**
- Produces: Vercel env `RESEND_API_KEY` (production); DNS records for `artbyaaa.com` on Vercel DNS; verified Resend domain.

- [ ] **Step 1 (USER ACTION): Create the Resend account**

Ask the user to: sign up at https://resend.com/signup using the client's GitHub (`aaart2025-beep`), then create an API key (Dashboard → API Keys → Create, full access) and run:

```
! vercel env add RESEND_API_KEY production
```

pasting the key at the prompt (never into chat). Then `vercel env pull .env.resend-check --environment=production --yes` locally to make the key available for the next steps; delete that file when Task 1 completes.

- [ ] **Step 2: Register the domain with Resend**

```bash
KEY=$(grep '^RESEND_API_KEY=' .env.resend-check | cut -d= -f2- | tr -d '"')
curl -s -X POST https://api.resend.com/domains \
  -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"name":"artbyaaa.com","region":"us-east-1"}' | python3 -m json.tool
```

Expected: JSON with `"id"` and a `records` array (SPF TXT + DKIM TXT entries such as `resend._domainkey`). Save the domain id.

- [ ] **Step 3: Add the DNS records via Vercel CLI**

For each record in the response (name, type, value), run:

```bash
vercel dns add artbyaaa.com <record-name> <TYPE> "<value>"
```

Note: Resend returns fully-qualified names (e.g. `send.artbyaaa.com`); `vercel dns add` wants the subdomain part only (`send`). Strip the `.artbyaaa.com` suffix. MX records need the priority flag: `vercel dns add artbyaaa.com send MX "feedback-smtp.us-east-1.amazonses.com" 10`.

- [ ] **Step 4: Trigger + poll verification**

```bash
curl -s -X POST "https://api.resend.com/domains/<domain-id>/verify" -H "Authorization: Bearer $KEY"
curl -s "https://api.resend.com/domains/<domain-id>" -H "Authorization: Bearer $KEY" | python3 -c "import json,sys; print(json.load(sys.stdin)['status'])"
```

Expected: status becomes `verified` (DNS can take up to ~15 min; re-poll, don't loop-spam).

- [ ] **Step 5: Send a test email and confirm receipt**

```bash
curl -s -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"from":"AAA — Wearable Art <orders@artbyaaa.com>","to":["aaart2025@gmail.com"],"subject":"AAA email test","html":"<p>Domain verified.</p>","text":"Domain verified."}'
```

Expected: JSON `{"id": "..."}`. Ask the user to confirm it arrived in aaart2025@gmail.com (check spam folder). Then `rm -f .env.resend-check`.

### Task 2: vitest + email templates module

**Files:**
- Create: `vitest.config.ts`, `src/lib/email/templates.ts`
- Test: `tests/email-templates.test.ts`
- Modify: `package.json` (devDependency `vitest`, script `"test": "vitest run"`)

**Interfaces:**
- Consumes: `Order`, `OrderItem` from `@/lib/orders/types` (existing).
- Produces: `orderReceiptEmail(order: Order): EmailContent`, `orderAlertEmail(order: Order): EmailContent`, `orderShippedEmail(order: Order): EmailContent` where `EmailContent = { subject: string; html: string; text: string }`.

- [ ] **Step 1: Install vitest and add config**

```bash
pnpm add -D vitest
```

Add to `package.json` scripts: `"test": "vitest run"`.

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: { include: ["tests/**/*.test.ts"] },
});
```

- [ ] **Step 2: Write the failing template tests**

Create `tests/email-templates.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { orderReceiptEmail, orderAlertEmail, orderShippedEmail } from "@/lib/email/templates";
import type { Order } from "@/lib/orders/types";

const order: Order = {
  id: "AAA-7F3K2",
  createdAt: "2026-07-27T12:00:00.000Z",
  items: [
    { slug: "wave-hoodie", name: "Wave Hoodie", variant: "M", price: 120, qty: 1 },
    { slug: "logo-tee", name: "Logo Tee", price: 45, qty: 2 },
  ],
  subtotal: 210,
  currency: "USD",
  customer: { name: "Dana Levi", email: "dana@example.com", address: "Tel Aviv" },
  paymentStatus: "unpaid",
  fulfillmentStatus: "new",
};

describe("orderReceiptEmail", () => {
  it("includes order id, each item with qty and price, and the subtotal", () => {
    const m = orderReceiptEmail(order);
    expect(m.subject).toContain("AAA-7F3K2");
    for (const part of ["Wave Hoodie", "M", "Logo Tee", "×2", "$120", "$45", "$210"]) {
      expect(m.html).toContain(part);
      }
    expect(m.text).toContain("AAA-7F3K2");
  });
});

describe("orderAlertEmail", () => {
  it("addresses the studio with customer contact and admin link", () => {
    const m = orderAlertEmail(order);
    expect(m.subject).toContain("New order");
    expect(m.html).toContain("dana@example.com");
    expect(m.html).toContain("/admin/orders");
  });
});

describe("orderShippedEmail", () => {
  it("tells the customer the order shipped", () => {
    const m = orderShippedEmail(order);
    expect(m.subject.toLowerCase()).toContain("shipped");
    expect(m.html).toContain("AAA-7F3K2");
  });
});
```

- [ ] **Step 3: Run tests, verify they fail**

Run: `pnpm test`
Expected: FAIL — cannot resolve `@/lib/email/templates`.

- [ ] **Step 4: Implement the templates**

Create `src/lib/email/templates.ts`:

```ts
import type { Order } from "@/lib/orders/types";

/* Transactional email content. Pure functions — no I/O — so they are unit
 * testable and render identically in every environment. Plain-table HTML:
 * email clients, not browsers. */

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

const usd = (n: number) => `$${n.toFixed(n % 1 === 0 ? 0 : 2)}`;
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function itemsTable(order: Order): string {
  const rows = order.items
    .map(
      (i) => `<tr>
  <td style="padding:6px 12px 6px 0">${esc(i.name)}${i.variant ? ` — ${esc(i.variant)}` : ""}${i.qty > 1 ? ` ×${i.qty}` : ""}</td>
  <td style="padding:6px 0;text-align:right">${usd(i.price * i.qty)}</td>
</tr>`,
    )
    .join("");
  return `<table style="border-collapse:collapse;width:100%;max-width:420px">${rows}
<tr><td style="padding:10px 12px 0 0;border-top:1px solid #ddd"><strong>Total</strong></td>
<td style="padding:10px 0 0;border-top:1px solid #ddd;text-align:right"><strong>${usd(order.subtotal)}</strong></td></tr></table>`;
}

function itemsText(order: Order): string {
  return order.items
    .map((i) => `- ${i.name}${i.variant ? ` (${i.variant})` : ""} x${i.qty} — ${usd(i.price * i.qty)}`)
    .join("\n");
}

export function orderReceiptEmail(order: Order): EmailContent {
  return {
    subject: `Your AAA order ${order.id}`,
    html: `<div style="font-family:Arial,sans-serif;color:#111">
<h2 style="margin:0 0 8px">Thanks for your order, ${esc(order.customer.name)}!</h2>
<p>Order <strong>${order.id}</strong> — we'll be in touch about payment and delivery.</p>
${itemsTable(order)}
<p style="margin-top:16px">Questions? Just reply to this email.</p>
<p style="color:#777">AAA — Wearable Art · artbyaaa.com</p></div>`,
    text: `Thanks for your order, ${order.customer.name}!\n\nOrder ${order.id}\n${itemsText(order)}\nTotal: ${usd(order.subtotal)}\n\nQuestions? Reply to this email.\nAAA — Wearable Art · artbyaaa.com`,
  };
}

export function orderAlertEmail(order: Order): EmailContent {
  const c = order.customer;
  return {
    subject: `New order ${order.id} — ${usd(order.subtotal)}`,
    html: `<div style="font-family:Arial,sans-serif;color:#111">
<h2 style="margin:0 0 8px">New order ${order.id}</h2>
<p>${esc(c.name)} · <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>${c.phone ? ` · ${esc(c.phone)}` : ""}</p>
${c.address ? `<p>Ship to: ${esc(c.address)}</p>` : ""}
${c.note ? `<p>Note: ${esc(c.note)}</p>` : ""}
${itemsTable(order)}
<p style="margin-top:16px"><a href="https://www.artbyaaa.com/admin/orders">Open admin orders</a></p></div>`,
    text: `New order ${order.id}\n${c.name} · ${c.email}${c.phone ? ` · ${c.phone}` : ""}\n${c.address ? `Ship to: ${c.address}\n` : ""}${itemsText(order)}\nTotal: ${usd(order.subtotal)}\nAdmin: https://www.artbyaaa.com/admin/orders`,
  };
}

export function orderShippedEmail(order: Order): EmailContent {
  return {
    subject: `Your AAA order ${order.id} has shipped`,
    html: `<div style="font-family:Arial,sans-serif;color:#111">
<h2 style="margin:0 0 8px">It's on the way, ${esc(order.customer.name)}!</h2>
<p>Order <strong>${order.id}</strong> has shipped.</p>
${itemsTable(order)}
<p style="color:#777;margin-top:16px">AAA — Wearable Art · artbyaaa.com</p></div>`,
    text: `It's on the way, ${order.customer.name}!\nOrder ${order.id} has shipped.\n${itemsText(order)}\nAAA — Wearable Art · artbyaaa.com`,
  };
}
```

- [ ] **Step 5: Run tests, verify pass; typecheck; commit**

Run: `pnpm test` → Expected: 3 passed. Run `npx tsc --noEmit` → clean.

```bash
git add vitest.config.ts package.json pnpm-lock.yaml src/lib/email/templates.ts tests/email-templates.test.ts
git commit -m "feat(email): order email templates + vitest test runner"
```

### Task 3: Email transport + order-route hooks

**Files:**
- Create: `src/lib/email/send.ts`, `src/lib/email/order-emails.ts`
- Modify: `src/app/api/orders/route.ts` (after line 104 `await appendOrder(order);`), `src/app/api/admin/orders/route.ts` (POST handler, around the `updateOrder` call)
- Test: `tests/order-emails.test.ts`

**Interfaces:**
- Consumes: `orderReceiptEmail/orderAlertEmail/orderShippedEmail` (Task 2), `Order` type.
- Produces: `sendEmail(msg: EmailMessage): Promise<boolean>`, `emailEnabled: boolean`, `sendOrderEmails(order: Order): Promise<void>`, `sendShippedEmail(order: Order): Promise<void>`. `EmailMessage = { to: string; subject: string; html: string; text: string; replyTo?: string }`.

- [ ] **Step 1: Write failing orchestration tests**

Create `tests/order-emails.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the transport before importing the module under test.
vi.mock("@/lib/email/send", () => ({
  emailEnabled: true,
  NOTIFY: "aaart2025@gmail.com",
  sendEmail: vi.fn(async () => true),
}));

import { sendOrderEmails, sendShippedEmail } from "@/lib/email/order-emails";
import { sendEmail } from "@/lib/email/send";
import type { Order } from "@/lib/orders/types";

const order: Order = {
  id: "AAA-TEST1", createdAt: "2026-07-27T12:00:00.000Z",
  items: [{ slug: "s", name: "Thing", price: 10, qty: 1 }],
  subtotal: 10, currency: "USD",
  customer: { name: "A", email: "a@b.co" },
  paymentStatus: "unpaid", fulfillmentStatus: "new",
};

beforeEach(() => vi.mocked(sendEmail).mockClear());

describe("sendOrderEmails", () => {
  it("sends receipt to customer and alert to the studio", async () => {
    await sendOrderEmails(order);
    const calls = vi.mocked(sendEmail).mock.calls.map((c) => c[0]);
    expect(calls).toHaveLength(2);
    expect(calls[0].to).toBe("a@b.co");
    expect(calls[1].to).toBe("aaart2025@gmail.com");
  });

  it("never throws even when the transport rejects", async () => {
    vi.mocked(sendEmail).mockRejectedValueOnce(new Error("down"));
    await expect(sendOrderEmails(order)).resolves.toBeUndefined();
  });
});

describe("sendShippedEmail", () => {
  it("sends to the customer", async () => {
    await sendShippedEmail(order);
    expect(vi.mocked(sendEmail).mock.calls[0][0].to).toBe("a@b.co");
  });
});
```

- [ ] **Step 2: Run tests, verify fail** — `pnpm test` → FAIL (module missing).

- [ ] **Step 3: Implement transport and orchestration**

Create `src/lib/email/send.ts`:

```ts
/* Resend transport. Absent RESEND_API_KEY (local checkout) email is disabled
 * and every send resolves false — callers must treat email as best-effort.
 * One retry on failure; never throws. */

const KEY = process.env.RESEND_API_KEY;
export const emailEnabled = Boolean(KEY);
export const NOTIFY = process.env.NOTIFY_EMAIL ?? "";
const FROM = "AAA — Wearable Art <orders@artbyaaa.com>";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

async function post(msg: EmailMessage): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [msg.to],
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
    }),
  });
  return res.ok;
}

export async function sendEmail(msg: EmailMessage): Promise<boolean> {
  if (!emailEnabled) return false;
  try {
    if (await post(msg)) return true;
    return await post(msg); // one retry
  } catch {
    try {
      return await post(msg);
    } catch {
      console.error(`email send failed: ${msg.subject} -> ${msg.to}`);
      return false;
    }
  }
}
```

Create `src/lib/email/order-emails.ts`:

```ts
import type { Order } from "@/lib/orders/types";
import { sendEmail, NOTIFY } from "@/lib/email/send";
import { orderReceiptEmail, orderAlertEmail, orderShippedEmail } from "@/lib/email/templates";

/* Order-event email orchestration. Best-effort by contract: these functions
 * swallow every failure — an email problem must never surface to checkout. */

export async function sendOrderEmails(order: Order): Promise<void> {
  const receipt = orderReceiptEmail(order);
  const alert = orderAlertEmail(order);
  await Promise.allSettled([
    sendEmail({ to: order.customer.email, replyTo: NOTIFY || undefined, ...receipt }),
    NOTIFY ? sendEmail({ to: NOTIFY, ...alert }) : Promise.resolve(false),
  ]);
}

export async function sendShippedEmail(order: Order): Promise<void> {
  const msg = orderShippedEmail(order);
  try {
    await sendEmail({ to: order.customer.email, replyTo: NOTIFY || undefined, ...msg });
  } catch {
    /* best-effort */
  }
}
```

- [ ] **Step 4: Run tests, verify pass** — `pnpm test` → all green.

- [ ] **Step 5: Hook into order creation**

In `src/app/api/orders/route.ts`: add import `import { sendOrderEmails } from "@/lib/email/order-emails";` and after the successful `await appendOrder(order);` (inside the try, before the final return) add:

```ts
  } catch {
    return NextResponse.json(
      { ok: false, error: "We couldn't save your order. Please try again or message the studio." },
      { status: 503, headers: cors },
    );
  }

  await sendOrderEmails(order); // best-effort by contract; never throws

  return NextResponse.json({ ok: true, id: order.id, subtotal }, { headers: cors });
```

- [ ] **Step 6: Hook the shipped transition**

In `src/app/api/admin/orders/route.ts` POST handler: import `readOrders` is already imported; add `import { sendShippedEmail } from "@/lib/email/order-emails";`. Before the `updateOrder` call, capture the previous status; after a successful update, fire the email only on the transition into "shipped":

```ts
  const prev = (await readOrders()).find((o) => o.id === id);
  const updated = await updateOrder(id, patch);
  if (!updated) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  if (patch.fulfillmentStatus === "shipped" && prev?.fulfillmentStatus !== "shipped") {
    await sendShippedEmail(updated);
  }
  return NextResponse.json({ ok: true, order: updated });
```

(Adapt to the file's actual tail — keep its existing response shape.)

- [ ] **Step 7: Typecheck, build, commit, push, live verify**

`npx tsc --noEmit` → clean. `npx next build` → succeeds.

```bash
git add src/lib/email tests/order-emails.test.ts src/app/api/orders/route.ts src/app/api/admin/orders/route.ts
git commit -m "feat(email): order receipt, studio alert and shipped emails via Resend"
git push origin main
```

After deploy: place a real test order on the production site (small qty, note "TEST"), confirm the receipt lands at your inbox and the alert at aaart2025@gmail.com; then in `/admin/orders` mark it shipped and confirm the shipped email. Finally cancel the test order in admin.

---

## Phase 2 — Supabase auth + account hub

### Task 4: Database schema + RLS

**Files:**
- Create: `supabase/migrations/0001_customer_accounts.sql`, `scripts/apply-supabase-sql.mjs`

**Interfaces:**
- Produces: tables `profiles`, `saved_designs`, `wishlist_items` with RLS, in project `ezywfxinftfurrwqmoix`.

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/0001_customer_accounts.sql`:

```sql
-- Customer data for artbyaaa.com. RLS is the only access boundary: the app
-- ships no service-role key, so every row is reachable only by its owner.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  design jsonb not null,
  preview_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, product_slug)
);

alter table public.profiles enable row level security;
alter table public.saved_designs enable row level security;
alter table public.wishlist_items enable row level security;

create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());
create policy "own designs" on public.saved_designs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own wishlist" on public.wishlist_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists saved_designs_user_idx on public.saved_designs (user_id, created_at desc);
create index if not exists wishlist_user_idx on public.wishlist_items (user_id, created_at desc);
```

- [ ] **Step 2: Write the apply script**

Create `scripts/apply-supabase-sql.mjs`:

```js
// Applies a SQL file to the client's Supabase project via the Management API.
// Auth: the Supabase CLI access token (supabase login) from the standard
// token location. Usage: node scripts/apply-supabase-sql.mjs <file.sql>
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const REF = "ezywfxinftfurrwqmoix";
const file = process.argv[2];
if (!file) throw new Error("usage: node scripts/apply-supabase-sql.mjs <file.sql>");

async function token() {
  if (process.env.SUPABASE_ACCESS_TOKEN) return process.env.SUPABASE_ACCESS_TOKEN;
  return (await readFile(join(homedir(), ".supabase", "access-token"), "utf8")).trim();
}

const query = await readFile(file, "utf8");
const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query }),
});
if (!res.ok) throw new Error(`apply failed ${res.status}: ${await res.text()}`);
console.log("applied", file);
```

- [ ] **Step 3: Apply + verify**

```bash
node scripts/apply-supabase-sql.mjs supabase/migrations/0001_customer_accounts.sql
```

Expected: `applied supabase/migrations/0001_customer_accounts.sql`.

Verify tables + RLS (should list the three tables with `rowsecurity: true`):

```bash
echo "select tablename, rowsecurity from pg_tables where schemaname='public' and tablename in ('profiles','saved_designs','wishlist_items');" > /tmp/check.sql
node scripts/apply-supabase-sql.mjs /tmp/check.sql
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0001_customer_accounts.sql scripts/apply-supabase-sql.mjs
git commit -m "feat(accounts): customer tables with per-user RLS"
```

### Task 5: Supabase client helpers + session middleware

**Files:**
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`
- Modify: `src/proxy.ts` (add session refresh), `package.json`

**Interfaces:**
- Produces: `supabaseBrowser(): SupabaseClient` (client components), `supabaseServer(): Promise<SupabaseClient>` (server components/routes — Next 16 `cookies()` is async).

- [ ] **Step 1: Install deps**

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Client factories**

Create `src/lib/supabase/client.ts`:

```ts
"use client";
import { createBrowserClient } from "@supabase/ssr";

export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

Create `src/lib/supabase/server.ts`:

```ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/* Server-side Supabase client bound to the request's auth cookies. Safe in
 * server components (setAll may throw there — middleware owns refresh). */

export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (list) => {
          try {
            for (const { name, value, options } of list) store.set(name, value, options);
          } catch {
            /* server component render — refresh happens in proxy */
          }
        },
      },
    },
  );
}
```

- [ ] **Step 3: Session refresh in the middleware**

Read `src/proxy.ts` first and merge — do not replace its existing logic. Add a Supabase session refresh pass that runs for `/account` and `/api/account` paths:

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

async function refreshSupabaseSession(req: NextRequest, res: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => {
          for (const { name, value, options } of list) res.cookies.set(name, value, options);
        },
      },
    },
  );
  await supabase.auth.getUser(); // refreshes expired tokens onto res cookies
  return res;
}
```

Call it from the existing exported proxy/middleware function when `req.nextUrl.pathname` starts with `/account` or `/api/account`, passing through the response it would otherwise return. Ensure the middleware matcher includes those paths.

- [ ] **Step 4: Typecheck, build, commit**

`npx tsc --noEmit` && `npx next build` → clean.

```bash
git add src/lib/supabase src/proxy.ts package.json pnpm-lock.yaml
git commit -m "feat(accounts): supabase ssr clients + session refresh middleware"
```

### Task 6: Customer login/signup page

**Files:**
- Create: `src/app/account/login/page.tsx`, `src/components/account/customer-login-form.tsx`

**Interfaces:**
- Consumes: `supabaseBrowser()` (Task 5).
- Produces: routes `/account/login`; successful auth redirects to `/account`.

- [ ] **Step 1: Page shell (server component)**

Create `src/app/account/login/page.tsx`:

```tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { CustomerLoginForm } from "@/components/account/customer-login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function CustomerLoginPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/account");
  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold">Your account</h1>
      <CustomerLoginForm />
    </main>
  );
}
```

(Match the site's actual layout wrappers — check `src/app/login/page.tsx` for the admin page's container classes and reuse the same visual pattern.)

- [ ] **Step 2: The form (client component)**

Create `src/components/account/customer-login-form.tsx`:

```tsx
"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

/* Password sign-in / sign-up + magic-link, one compact form. Mirrors the
 * admin login-form styling (see components/auth/login-form.tsx). */

type Mode = "signin" | "signup" | "magic";

export function CustomerLoginForm() {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [msg, setMsg] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);
    const supabase = supabaseBrowser();
    const origin = window.location.origin;
    try {
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({
          email, options: { emailRedirectTo: `${origin}/account` },
        });
        if (error) throw error;
        setMsg("Check your email for the login link.");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password, options: { emailRedirectTo: `${origin}/account` },
        });
        if (error) throw error;
        setMsg("Almost there — confirm your email to finish signing up.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/account");
        router.refresh();
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex gap-2 text-sm">
        <button type="button" onClick={() => setMode("signin")} aria-pressed={mode === "signin"} className="underline-offset-4 aria-pressed:underline">Sign in</button>
        <span aria-hidden>·</span>
        <button type="button" onClick={() => setMode("signup")} aria-pressed={mode === "signup"} className="underline-offset-4 aria-pressed:underline">Create account</button>
        <span aria-hidden>·</span>
        <button type="button" onClick={() => setMode("magic")} aria-pressed={mode === "magic"} className="underline-offset-4 aria-pressed:underline">Email me a link</button>
      </div>
      <label className="block">
        <span className="text-sm">Email</span>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2 text-base" autoComplete="email" />
      </label>
      {mode !== "magic" && (
        <label className="block">
          <span className="text-sm">Password</span>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2 text-base"
            autoComplete={mode === "signup" ? "new-password" : "current-password"} />
        </label>
      )}
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      {msg && <p role="status" className="text-sm text-green-700">{msg}</p>}
      <button disabled={busy} className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50">
        {mode === "signup" ? "Create account" : mode === "magic" ? "Send login link" : "Sign in"}
      </button>
    </form>
  );
}
```

Adapt classNames to the site's design tokens — read `src/components/auth/login-form.tsx` first and copy its input/button styling exactly.

- [ ] **Step 3: Manual verify locally**

`pnpm dev` → open http://localhost:3000/account/login → create an account with a real email you control → confirmation email arrives (from Supabase) → after confirming, `/account/login` redirects to `/account` (404 until Task 7 — expected).

- [ ] **Step 4: Typecheck + commit**

```bash
npx tsc --noEmit
git add src/app/account src/components/account
git commit -m "feat(accounts): customer login, signup and magic-link page"
```

### Task 7: Account hub + order history

**Files:**
- Create: `src/lib/account/orders.ts`, `src/app/api/account/orders/route.ts`, `src/app/account/page.tsx`, `src/components/account/orders-tab.tsx`, `src/components/account/account-nav.tsx`
- Modify: `src/lib/orders/types.ts` (add `userId`), site nav component (account icon — find it via `grep -rn "cart" src/components/site/` and mirror the cart link pattern)
- Test: `tests/account-orders.test.ts`

**Interfaces:**
- Consumes: `readOrders()` (existing), `supabaseServer()` (Task 5).
- Produces: `Order.userId?: string`; `ordersForUser(orders: Order[], user: { id: string; email: string }): Order[]`; GET `/api/account/orders` → `{ ok: true, orders: Order[] }` (401 when logged out); tabbed `/account` page with sign-out.

- [ ] **Step 1: Add userId to the Order type**

In `src/lib/orders/types.ts`, extend the `Order` interface after `fulfillmentStatus`:

```ts
  /** Supabase auth user id when the order was placed by a logged-in customer */
  userId?: string;
```

- [ ] **Step 2: Failing test for the identity filter**

Create `tests/account-orders.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { ordersForUser } from "@/lib/account/orders";
import type { Order } from "@/lib/orders/types";

const base: Omit<Order, "id" | "customer" | "userId"> = {
  createdAt: "2026-07-27T12:00:00.000Z",
  items: [{ slug: "s", name: "Thing", price: 10, qty: 1 }],
  subtotal: 10, currency: "USD",
  paymentStatus: "unpaid", fulfillmentStatus: "new",
};
const mk = (id: string, email: string, userId?: string): Order =>
  ({ ...base, id, customer: { name: "x", email }, userId });

describe("ordersForUser", () => {
  const user = { id: "u-1", email: "Dana@Example.com" };
  it("matches by userId", () => {
    expect(ordersForUser([mk("A", "other@x.co", "u-1")], user).map((o) => o.id)).toEqual(["A"]);
  });
  it("matches pre-account orders by email, case-insensitive", () => {
    expect(ordersForUser([mk("B", "dana@example.com")], user).map((o) => o.id)).toEqual(["B"]);
  });
  it("excludes other customers", () => {
    expect(ordersForUser([mk("C", "someone@else.co", "u-2")], user)).toEqual([]);
  });
  it("sorts newest first", () => {
    const a = { ...mk("OLD", "dana@example.com"), createdAt: "2026-01-01T00:00:00.000Z" };
    const b = { ...mk("NEW", "dana@example.com"), createdAt: "2026-07-01T00:00:00.000Z" };
    expect(ordersForUser([a, b], user).map((o) => o.id)).toEqual(["NEW", "OLD"]);
  });
});
```

Run `pnpm test` → FAIL (module missing).

- [ ] **Step 3: Implement the filter**

Create `src/lib/account/orders.ts`:

```ts
import type { Order } from "@/lib/orders/types";

/* Identity filter for "my orders". Orders live in one shared Blob list, so
 * this server-side filter is the privacy boundary — it must run before any
 * order data reaches a response. Email matching covers orders placed before
 * the customer created an account. */

export function ordersForUser(orders: Order[], user: { id: string; email: string }): Order[] {
  const email = user.email.toLowerCase();
  return orders
    .filter((o) => o.userId === user.id || o.customer.email.toLowerCase() === email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
```

Run `pnpm test` → all pass.

- [ ] **Step 4: The API route**

Create `src/app/api/account/orders/route.ts`:

```ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { readOrders } from "@/lib/orders/store";
import { ordersForUser } from "@/lib/account/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const orders = ordersForUser(await readOrders(), { id: data.user.id, email: data.user.email });
  return NextResponse.json({ ok: true, orders });
}
```

- [ ] **Step 5: Account hub page + orders tab**

Create `src/components/account/account-nav.tsx`:

```tsx
"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export function AccountNav({ email }: { email: string }) {
  const router = useRouter();
  return (
    <div className="mb-8 flex items-center justify-between">
      <p className="text-sm text-neutral-600">{email}</p>
      <button
        className="text-sm underline underline-offset-4"
        onClick={async () => {
          await supabaseBrowser().auth.signOut();
          router.push("/");
          router.refresh();
        }}
      >
        Sign out
      </button>
    </div>
  );
}
```

Create `src/components/account/orders-tab.tsx`:

```tsx
import type { Order } from "@/lib/orders/types";
import { FULFILLMENT_LABELS } from "@/lib/orders/types";

export function OrdersTab({ orders }: { orders: Order[] }) {
  if (orders.length === 0) return <p className="text-sm text-neutral-600">No orders yet.</p>;
  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li key={o.id} className="rounded border p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-medium">{o.id}</span>
            <span className="text-sm">{FULFILLMENT_LABELS[o.fulfillmentStatus]}</span>
          </div>
          <p className="mt-1 text-sm text-neutral-600">
            {new Date(o.createdAt).toLocaleDateString()} · ${o.subtotal} · {o.items.length} item(s)
          </p>
          <ul className="mt-2 text-sm">
            {o.items.map((i, n) => (
              <li key={n}>{i.name}{i.variant ? ` — ${i.variant}` : ""}{i.qty > 1 ? ` ×${i.qty}` : ""}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
```

Create `src/app/account/page.tsx` (server component; tabs land in later tasks — start with Orders only and a placeholder-free layout):

```tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { readOrders } from "@/lib/orders/store";
import { ordersForUser } from "@/lib/account/orders";
import { AccountNav } from "@/components/account/account-nav";
import { OrdersTab } from "@/components/account/orders-tab";

export const metadata: Metadata = { title: "Your account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) redirect("/account/login");
  const orders = ordersForUser(await readOrders(), { id: data.user.id, email: data.user.email });
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold">Your account</h1>
      <AccountNav email={data.user.email} />
      <h2 className="mb-4 text-lg font-medium">Orders</h2>
      <OrdersTab orders={orders} />
    </main>
  );
}
```

- [ ] **Step 6: Nav account icon**

Find the site header (`grep -rn "Cart\|/checkout" src/components/site/ | head`). Next to the cart link, add a link to `/account` labelled "Account" using the header's existing link styling. Keep it one line; logged-in/out state does NOT need to vary the link (both states land correctly thanks to the redirect).

- [ ] **Step 7: Verify + commit + push**

Local: sign in → `/account` lists orders placed with that email (place one via checkout first if empty). `pnpm test`, `npx tsc --noEmit`, `npx next build` all green.

```bash
git add src/lib/account src/app/api/account src/app/account src/components/account src/lib/orders/types.ts tests/account-orders.test.ts src/components/site
git commit -m "feat(accounts): account hub with order history"
git push origin main
```

### Task 8: Stamp userId on logged-in checkout

**Files:**
- Modify: `src/app/api/orders/route.ts` (order construction, line ~92)

**Interfaces:**
- Consumes: `supabaseServer()` (Task 5), `Order.userId` (Task 7).

- [ ] **Step 1: Read the session at order creation**

In `src/app/api/orders/route.ts`, add import `import { supabaseServer } from "@/lib/supabase/server";`. Before building the `order` object insert:

```ts
  // Logged-in customers get their orders bound to their account. Guests (and
  // the static-mirror origin, which sends no auth cookies) stay anonymous.
  let userId: string | undefined;
  try {
    const supabase = await supabaseServer();
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id;
  } catch {
    /* cookie-less callers (CORS mirror) — fine */
  }
```

and add `userId,` to the `order` literal after `fulfillmentStatus`.

- [ ] **Step 2: Verify + commit**

Local: logged in, place an order → `data/orders.json` (local fallback) shows `"userId"`. Logged out → no field.

```bash
npx tsc --noEmit
git add src/app/api/orders/route.ts
git commit -m "feat(accounts): bind logged-in checkout orders to the customer"
```

---

## Phase 3 — Profiles + checkout autofill

### Task 9: Details tab + autofill

**Files:**
- Create: `src/components/account/details-tab.tsx`
- Modify: `src/app/account/page.tsx` (render DetailsTab), `src/components/checkout/checkout-client.tsx` (accept `initial` prop, line 48/56), `src/app/checkout/page.tsx` (load profile server-side)

**Interfaces:**
- Consumes: `supabaseBrowser()`, `supabaseServer()`, table `profiles` (Task 4).
- Produces: `CheckoutClient` new optional prop `initial?: { name?: string; email?: string; phone?: string; address?: string }`; profile row shape `{ display_name, phone, address: { line: string } }`.

- [ ] **Step 1: Details tab (client component, direct RLS access)**

Create `src/components/account/details-tab.tsx`:

```tsx
"use client";
import * as React from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

/* Profile editor backed directly by the RLS'd profiles table — no API route
 * needed; the anon key + session cookie is the entire trust chain. */

interface ProfileForm { display_name: string; phone: string; line: string }

export function DetailsTab({ userId }: { userId: string }) {
  const [form, setForm] = React.useState<ProfileForm>({ display_name: "", phone: "", line: "" });
  const [state, setState] = React.useState<"loading" | "idle" | "saving" | "saved" | "error">("loading");

  React.useEffect(() => {
    const supabase = supabaseBrowser();
    supabase
      .from("profiles")
      .select("display_name, phone, address")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) return setState("error");
        setForm({
          display_name: data?.display_name ?? "",
          phone: data?.phone ?? "",
          line: (data?.address as { line?: string } | null)?.line ?? "",
        });
        setState("idle");
      });
  }, [userId]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    const { error } = await supabaseBrowser().from("profiles").upsert({
      id: userId,
      display_name: form.display_name.trim() || null,
      phone: form.phone.trim() || null,
      address: form.line.trim() ? { line: form.line.trim() } : null,
      updated_at: new Date().toISOString(),
    });
    setState(error ? "error" : "saved");
  }

  if (state === "loading") return <p className="text-sm text-neutral-600">Loading…</p>;
  return (
    <form onSubmit={save} className="space-y-4">
      <label className="block"><span className="text-sm">Name</span>
        <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })}
          className="mt-1 w-full rounded border px-3 py-2 text-base" autoComplete="name" /></label>
      <label className="block"><span className="text-sm">Phone</span>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="mt-1 w-full rounded border px-3 py-2 text-base" autoComplete="tel" /></label>
      <label className="block"><span className="text-sm">Shipping address</span>
        <input value={form.line} onChange={(e) => setForm({ ...form, line: e.target.value })}
          className="mt-1 w-full rounded border px-3 py-2 text-base" autoComplete="street-address" /></label>
      {state === "error" && <p role="alert" className="text-sm text-red-600">Couldn't save — try again.</p>}
      {state === "saved" && <p role="status" className="text-sm text-green-700">Saved.</p>}
      <button disabled={state === "saving"} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">Save details</button>
    </form>
  );
}
```

Render it in `src/app/account/page.tsx` under a "Details" heading, passing `userId={data.user.id}`.

- [ ] **Step 2: Checkout autofill**

`src/components/checkout/checkout-client.tsx` line 48 — extend the props and seed the form state (line 56):

```tsx
export function CheckoutClient({ email, apiBase = "", initial }: {
  email: string;
  apiBase?: string;
  initial?: { name?: string; email?: string; phone?: string; address?: string };
}) {
  const [form, setForm] = React.useState({
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    address: initial?.address ?? "",
    note: "",
  });
```

`src/app/checkout/page.tsx` — read the profile server-side and pass it (merge with the page's existing props; read the file first):

```tsx
import { supabaseServer } from "@/lib/supabase/server";

async function checkoutInitial() {
  try {
    const supabase = await supabaseServer();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return undefined;
    const { data: p } = await supabase
      .from("profiles").select("display_name, phone, address").eq("id", data.user.id).maybeSingle();
    return {
      name: p?.display_name ?? undefined,
      email: data.user.email,
      phone: p?.phone ?? undefined,
      address: (p?.address as { line?: string } | null)?.line ?? undefined,
    };
  } catch {
    return undefined;
  }
}
```

Call it in the page component and pass `initial={await checkoutInitial()}` to `<CheckoutClient …>`.

- [ ] **Step 3: Verify + commit + push**

Local: save details in `/account`, open `/checkout` logged-in → fields prefilled; logged-out → empty. `pnpm test && npx tsc --noEmit && npx next build` green.

```bash
git add src/components/account/details-tab.tsx src/app/account/page.tsx src/components/checkout/checkout-client.tsx src/app/checkout/page.tsx
git commit -m "feat(accounts): profile details + checkout autofill"
git push origin main
```

---

## Phase 4 — Saved designs

### Task 10: Save/load designs from the studio

**Files:**
- Create: `src/components/account/designs-tab.tsx`, `src/components/creator/save-design-button.tsx`
- Modify: `src/components/creator/creator.tsx` (design state owner, line 62), `src/app/account/page.tsx` (Designs section)

**Interfaces:**
- Consumes: `Design` type (`src/lib/creator/config.ts:160`), `supabaseBrowser()`, table `saved_designs`.
- Produces: `SaveDesignButton({ design }: { design: Design })`; `/create?load=<designId>` loads a saved design; localStorage key `aaa-pending-design` carries an unsaved design through the login redirect.

- [ ] **Step 1: Save button with login-redirect preservation**

Create `src/components/creator/save-design-button.tsx`:

```tsx
"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Design } from "@/lib/creator/config";

/* Saves the current design to the customer's account. Logged out: the design
 * is parked in localStorage and restored after login so nothing is lost. */

const PENDING_KEY = "aaa-pending-design";

export function SaveDesignButton({ design }: { design: Design }) {
  const router = useRouter();
  const [state, setState] = React.useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setState("saving");
    const supabase = supabaseBrowser();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      localStorage.setItem(PENDING_KEY, JSON.stringify(design));
      router.push("/account/login");
      return;
    }
    const name = `${design.base} — ${new Date().toLocaleDateString()}`;
    const { error } = await supabase.from("saved_designs").insert({ user_id: data.user.id, name, design });
    setState(error ? "error" : "saved");
  }

  return (
    <button onClick={save} disabled={state === "saving"} className="rounded border px-3 py-1.5 text-sm disabled:opacity-50">
      {state === "saved" ? "Saved ✓" : state === "error" ? "Retry save" : "Save design"}
    </button>
  );
}

/** Call once on studio mount: restores a design parked before login. */
export function takePendingDesign(): Design | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    localStorage.removeItem(PENDING_KEY);
    return JSON.parse(raw) as Design;
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Wire into the studio**

In `src/components/creator/creator.tsx` (state owner at line 62):
- Render `<SaveDesignButton design={design} />` in the studio toolbar (next to the existing AI-preview / order controls — read the JSX to place it consistently).
- On mount, restore a parked or requested design:

```tsx
  const search = useSearchParams(); // next/navigation, already a client component
  React.useEffect(() => {
    const pending = takePendingDesign();
    if (pending) { setDesign(pending); return; }
    const loadId = search.get("load");
    if (!loadId) return;
    supabaseBrowser()
      .from("saved_designs").select("design").eq("id", loadId).maybeSingle()
      .then(({ data }) => { if (data?.design) setDesign(data.design as Design); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
```

If `creator.tsx` is not wrapped in `<Suspense>` where used, wrap the `useSearchParams` usage per Next 16 requirements (check the `/create` page component).

- [ ] **Step 3: Designs tab**

Create `src/components/account/designs-tab.tsx`:

```tsx
"use client";
import * as React from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

interface Row { id: string; name: string; created_at: string }

export function DesignsTab() {
  const [rows, setRows] = React.useState<Row[] | null>(null);

  React.useEffect(() => {
    supabaseBrowser()
      .from("saved_designs").select("id, name, created_at").order("created_at", { ascending: false })
      .then(({ data }) => setRows(data ?? []));
  }, []);

  async function remove(id: string) {
    await supabaseBrowser().from("saved_designs").delete().eq("id", id);
    setRows((r) => (r ?? []).filter((x) => x.id !== id));
  }

  if (rows === null) return <p className="text-sm text-neutral-600">Loading…</p>;
  if (rows.length === 0) return <p className="text-sm text-neutral-600">No saved designs yet — create one in the studio.</p>;
  return (
    <ul className="space-y-3">
      {rows.map((d) => (
        <li key={d.id} className="flex items-center justify-between rounded border p-3">
          <div>
            <p className="font-medium">{d.name}</p>
            <p className="text-sm text-neutral-600">{new Date(d.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-3 text-sm">
            <Link className="underline underline-offset-4" href={`/create?load=${d.id}`}>Load in studio</Link>
            <button className="text-red-600 underline underline-offset-4" onClick={() => remove(d.id)}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
```

Render in `src/app/account/page.tsx` under a "Designs" heading (client tab needs no props — RLS scopes rows).

- [ ] **Step 4: Verify + commit + push**

Local: save logged-out → login → design restored → save → appears in `/account` → "Load in studio" reproduces it. `pnpm test && npx tsc --noEmit && npx next build`.

```bash
git add src/components/creator/save-design-button.tsx src/components/creator/creator.tsx src/components/account/designs-tab.tsx src/app/account/page.tsx
git commit -m "feat(accounts): save and reload studio designs"
git push origin main
```

---

## Phase 5 — Wishlist

### Task 11: Hearts on the shop grid + wishlist tab

**Files:**
- Create: `src/components/shop/wishlist-heart.tsx`, `src/components/account/wishlist-tab.tsx`
- Modify: `src/components/paper/shop-grid.tsx` (add heart per card), `src/app/account/page.tsx` (Wishlist section)

**Interfaces:**
- Consumes: `supabaseBrowser()`, table `wishlist_items`, product slugs from the shop grid's existing product objects.
- Produces: `WishlistHeart({ slug }: { slug: string })` — toggles; silently no-ops (renders nothing) when logged out.

- [ ] **Step 1: Heart component**

Create `src/components/shop/wishlist-heart.tsx`:

```tsx
"use client";
import * as React from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

/* Wishlist toggle. Hidden for guests: the shop grid must not push login at
 * browsers — hearts appear once a session exists. */

export function WishlistHeart({ slug }: { slug: string }) {
  const [userId, setUserId] = React.useState<string | null>(null);
  const [on, setOn] = React.useState(false);

  React.useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      supabase.from("wishlist_items").select("id").eq("product_slug", slug).maybeSingle()
        .then(({ data: row }) => setOn(Boolean(row)));
    });
  }, [slug]);

  if (!userId) return null;

  async function toggle(e: React.MouseEvent) {
    e.preventDefault(); // cards are links — don't navigate
    const supabase = supabaseBrowser();
    setOn((v) => !v);
    if (on) await supabase.from("wishlist_items").delete().eq("product_slug", slug);
    else await supabase.from("wishlist_items").insert({ user_id: userId, product_slug: slug });
  }

  return (
    <button onClick={toggle} aria-label={on ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={on}
      className="absolute right-2 top-2 rounded-full bg-white/80 p-1.5 text-lg leading-none">
      {on ? "♥" : "♡"}
    </button>
  );
}
```

- [ ] **Step 2: Mount on shop cards**

In `src/components/paper/shop-grid.tsx`: each product card renders inside a relatively-positioned wrapper (verify; add `relative` if missing) — add `<WishlistHeart slug={product.slug} />` inside the card. Read the file first; use its actual product variable name.

- [ ] **Step 3: Wishlist tab**

Create `src/components/account/wishlist-tab.tsx`:

```tsx
"use client";
import * as React from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

interface Row { id: string; product_slug: string }

export function WishlistTab() {
  const [rows, setRows] = React.useState<Row[] | null>(null);
  React.useEffect(() => {
    supabaseBrowser().from("wishlist_items").select("id, product_slug").order("created_at", { ascending: false })
      .then(({ data }) => setRows(data ?? []));
  }, []);
  if (rows === null) return <p className="text-sm text-neutral-600">Loading…</p>;
  if (rows.length === 0) return <p className="text-sm text-neutral-600">Nothing hearted yet.</p>;
  return (
    <ul className="flex flex-wrap gap-3">
      {rows.map((r) => (
        <li key={r.id}>
          <Link className="underline underline-offset-4" href={`/shop/${r.product_slug}`}>{r.product_slug}</Link>
        </li>
      ))}
    </ul>
  );
}
```

Render in `src/app/account/page.tsx` under a "Wishlist" heading.

- [ ] **Step 4: Verify + commit + push**

Local: logged-in, heart two products, unheart one, `/account` shows the remainder linking to product pages. Guests see no hearts.

```bash
git add src/components/shop/wishlist-heart.tsx src/components/paper/shop-grid.tsx src/components/account/wishlist-tab.tsx src/app/account/page.tsx
git commit -m "feat(accounts): wishlist hearts + account tab"
git push origin main
```

---

## Phase 6 — Google OAuth + branded auth email

### Task 12: Sign in with Google

**Files:**
- Modify: `src/components/account/customer-login-form.tsx` (add Google button)

**Interfaces:**
- Consumes: Supabase OAuth (`signInWithOAuth`), Google credentials configured in the Supabase dashboard.

- [ ] **Step 1 (USER ACTION): Google Cloud OAuth client**

Walk the user through, in a browser logged into the client's Google account (aaart2025@gmail.com):
1. https://console.cloud.google.com → new project "artbyaaa".
2. APIs & Services → OAuth consent screen → External → app name "AAA — Wearable Art", support email aaart2025@gmail.com → publish.
3. Credentials → Create credentials → OAuth client ID → Web application. Authorized redirect URI: `https://ezywfxinftfurrwqmoix.supabase.co/auth/v1/callback`.
4. Copy the Client ID + Client Secret into Supabase dashboard → Authentication → Providers → Google (enable, paste, save) — at https://supabase.com/dashboard/project/ezywfxinftfurrwqmoix/auth/providers.

- [ ] **Step 2: Add the button**

In `customer-login-form.tsx`, under the submit button:

```tsx
      <button
        type="button"
        onClick={() =>
          supabaseBrowser().auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/account` },
          })
        }
        className="w-full rounded border px-4 py-2"
      >
        Continue with Google
      </button>
```

Also add `https://www.artbyaaa.com/account` (and the -lac fallback) to Supabase → Authentication → URL Configuration → Redirect URLs, and set Site URL to `https://www.artbyaaa.com`.

- [ ] **Step 3: Verify + commit + push**

Google sign-in round-trips to `/account` locally and on production.

```bash
git add src/components/account/customer-login-form.tsx
git commit -m "feat(accounts): sign in with Google"
git push origin main
```

### Task 13: Auth emails from the domain (Supabase SMTP → Resend)

**Files:** none (dashboard config)

- [ ] **Step 1: Create an SMTP credential in Resend** — Dashboard → SMTP (or Settings → SMTP): host `smtp.resend.com`, port 465, user `resend`, password = an API key (create a dedicated key named `supabase-smtp`).

- [ ] **Step 2: Configure Supabase SMTP** — https://supabase.com/dashboard/project/ezywfxinftfurrwqmoix/settings/auth → SMTP Settings: enable custom SMTP, sender `orders@artbyaaa.com`, sender name "AAA — Wearable Art", host `smtp.resend.com`, port 465, user `resend`, password = that API key. Save.

- [ ] **Step 3: Verify** — trigger a password-reset email from `/account/login`; it must arrive from orders@artbyaaa.com (not supabase.io). Check spam standing at https://www.mail-tester.com with a signup email.

---

## Final Task 14: E2E suite + production verification

**Files:**
- Create: `e2e/account.spec.ts`, `playwright.config.ts`
- Modify: `package.json` (devDep `@playwright/test`, script `"e2e": "playwright test"`)

- [ ] **Step 1: Install Playwright**

```bash
pnpm add -D @playwright/test && npx playwright install chromium
```

Create `playwright.config.ts`:

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  use: { baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000" },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: "pnpm dev", url: "http://localhost:3000", reuseExistingServer: true },
});
```

- [ ] **Step 2: The journey test**

Create `e2e/account.spec.ts` (auth via a pre-seeded test user — create `e2e-test@artbyaaa.com` once via the login page and keep credentials in `.env.e2e`, gitignored):

```ts
import { test, expect } from "@playwright/test";

const EMAIL = process.env.E2E_EMAIL ?? "";
const PASSWORD = process.env.E2E_PASSWORD ?? "";

test.skip(!EMAIL || !PASSWORD, "E2E_EMAIL / E2E_PASSWORD not set");

test("login → account hub shows tabs", async ({ page }) => {
  await page.goto("/account/login");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/account$/);
  for (const h of ["Orders", "Designs", "Wishlist", "Details"]) {
    await expect(page.getByRole("heading", { name: h })).toBeVisible();
  }
});

test("guest checkout unaffected", async ({ page }) => {
  await page.goto("/shop");
  await expect(page.locator("h1")).toBeVisible();
});
```

- [ ] **Step 3: RLS cross-user check (one-off script, not committed CI)**

With two test users' JWTs (sign in as each in a browser, copy `sb-*-auth-token`), verify user B cannot read user A's rows: a `select` on `saved_designs` with B's token must return only B's rows. Document the result in the PR/commit message.

- [ ] **Step 4: Run everything, commit, push**

```bash
pnpm test && pnpm e2e && npx tsc --noEmit && npx next build
git add playwright.config.ts e2e package.json pnpm-lock.yaml
git commit -m "test: account journey e2e + config"
git push origin main
```

- [ ] **Step 5: Production smoke** — on https://www.artbyaaa.com (or -lac fallback): sign up with a real email, confirm, save a design, heart a product, place a test order, verify receipt + alert emails, mark shipped in admin, verify shipped email. Cancel the test order.

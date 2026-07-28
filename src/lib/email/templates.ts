import type { Order } from "@/lib/orders/types";

/* Transactional email content. Pure functions — no I/O — so they are unit
 * testable and render identically in every environment. Plain-table HTML
 * with inline styles: built for email clients, not browsers.
 *
 * ── HOW TO EDIT THESE EMAILS ─────────────────────────────────────────────
 * Everything a customer or the studio receives is in THIS file:
 *   • orderReceiptEmail  → the confirmation the CUSTOMER gets (Hebrew, then
 *                          English). Edit the `he` / `en` blocks below.
 *   • orderAlertEmail    → the heads-up the STUDIO gets on a new order.
 *   • orderShippedEmail  → the "it shipped" note to the customer.
 * To change wording, edit the strings. To change the logo or brand colours,
 * edit the BRAND constants right below. The logo must be a public URL (email
 * can't read local files) — it points at the logo already hosted on the site.
 * ─────────────────────────────────────────────────────────────────────── */

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

/* ---- Brand kit (edit here to restyle every email at once) ---- */
const BRAND = {
  site: "https://www.artbyaaa.com",
  logo: "https://www.artbyaaa.com/brand/logo-aaa-ink.png",
  paper: "#F5F0E4", // cream page
  ink: "#211F1B", // near-black ink
  muted: "#6E6A60", // soft grey ink
  line: "#D9D3C4", // hairline rule
  accent: "#A9E34B", // lime
};

/* Prices are in shekels. Simple, locale-proof formatting for email clients. */
const ils = (n: number) => `₪${n % 1 === 0 ? n : n.toFixed(2)}`;
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Branded page wrapper: cream sheet, centred logo, then the body. `dir`
 * flips alignment for the Hebrew blocks. */
function shell(bodyHtml: string): string {
  return `<div style="margin:0;padding:24px 12px;background:${BRAND.paper};font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink}">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;margin:0 auto;background:${BRAND.paper}">
    <tr><td style="padding:8px 24px 0;text-align:center">
      <img src="${BRAND.logo}" alt="AAA" width="120" style="width:120px;height:auto;display:inline-block" />
      <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:13px;letter-spacing:2px;color:${BRAND.muted};margin-top:4px">amit_amar_art</div>
      <div style="height:3px;background:${BRAND.accent};width:48px;margin:14px auto 0"></div>
    </td></tr>
    <tr><td style="padding:20px 24px 28px">${bodyHtml}</td></tr>
    <tr><td style="padding:0 24px 28px;text-align:center">
      <div style="border-top:1px solid ${BRAND.line};padding-top:14px;font-size:11px;color:${BRAND.muted}">
        AAA — Wearable Art · <a href="${BRAND.site}" style="color:${BRAND.muted}">artbyaaa.com</a>
      </div>
    </td></tr>
  </table>
</div>`;
}

/** Line-items table. `lang` localises the total row and its alignment. */
function itemsTable(order: Order, lang: "he" | "en"): string {
  const rtl = lang === "he";
  const totalLabel = rtl ? "סה״כ" : "Total";
  const rows = order.items
    .map(
      (i) => `<tr>
  <td style="padding:6px 0;font-size:14px">${esc(i.name)}${i.variant ? ` — ${esc(i.variant)}` : ""}${i.qty > 1 ? ` ×${i.qty} @ ${ils(i.price)}` : ""}</td>
  <td style="padding:6px 0;font-size:14px;text-align:${rtl ? "left" : "right"};white-space:nowrap">${ils(i.price * i.qty)}</td>
</tr>`,
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;width:100%;margin-top:6px" dir="${rtl ? "rtl" : "ltr"}">${rows}
<tr>
  <td style="padding:10px 0 0;border-top:1px solid ${BRAND.line};font-size:14px"><strong>${totalLabel}</strong></td>
  <td style="padding:10px 0 0;border-top:1px solid ${BRAND.line};text-align:${rtl ? "left" : "right"};font-size:14px"><strong>${ils(order.subtotal)}</strong></td>
</tr></table>`;
}

function itemsText(order: Order): string {
  return order.items
    .map((i) => `- ${i.name}${i.variant ? ` (${i.variant})` : ""} x${i.qty}${i.qty > 1 ? ` @ ${ils(i.price)}` : ""} — ${ils(i.price * i.qty)}`)
    .join("\n");
}

/** Customer confirmation — Hebrew first, then English. */
export function orderReceiptEmail(order: Order): EmailContent {
  const name = esc(order.customer.name);

  const he = `<div dir="rtl" style="text-align:right">
  <h2 style="margin:0 0 8px;font-size:20px">תודה על הזמנתך, ${name}!</h2>
  <p style="margin:0 0 4px;font-size:14px;line-height:1.7">הזמנה <strong>${order.id}</strong> — ניצור איתך קשר לגבי התשלום והמשלוח.</p>
  ${itemsTable(order, "he")}
  <p style="margin:16px 0 0;font-size:14px;line-height:1.7">שאלות? אפשר פשוט להשיב למייל הזה.</p>
</div>`;

  const en = `<div dir="ltr" style="text-align:left;margin-top:26px;padding-top:20px;border-top:1px dashed ${BRAND.line}">
  <h2 style="margin:0 0 8px;font-size:20px">Thanks for your order, ${name}!</h2>
  <p style="margin:0 0 4px;font-size:14px;line-height:1.7">Order <strong>${order.id}</strong> — we'll be in touch about payment and delivery.</p>
  ${itemsTable(order, "en")}
  <p style="margin:16px 0 0;font-size:14px;line-height:1.7">Questions? Just reply to this email.</p>
</div>`;

  return {
    subject: `תודה על הזמנתך · Your AAA order ${order.id}`,
    html: shell(he + en),
    text:
      `תודה על הזמנתך, ${order.customer.name}!\nהזמנה ${order.id}\n${itemsText(order)}\nסה״כ: ${ils(order.subtotal)}\nשאלות? אפשר להשיב למייל הזה.\n\n— — —\n\n` +
      `Thanks for your order, ${order.customer.name}!\nOrder ${order.id}\n${itemsText(order)}\nTotal: ${ils(order.subtotal)}\nQuestions? Reply to this email.\nAAA — Wearable Art · artbyaaa.com`,
  };
}

/** Studio alert — internal heads-up for the maker on every new order. */
export function orderAlertEmail(order: Order): EmailContent {
  const c = order.customer;
  const body = `<div dir="ltr" style="text-align:left">
  <h2 style="margin:0 0 8px;font-size:20px">New order ${order.id}</h2>
  <p style="margin:0 0 4px;font-size:14px">${esc(c.name)} · <a href="mailto:${esc(c.email)}" style="color:${BRAND.ink}">${esc(c.email)}</a>${c.phone ? ` · ${esc(c.phone)}` : ""}</p>
  ${c.address ? `<p style="margin:0 0 4px;font-size:14px">Ship to: ${esc(c.address)}</p>` : ""}
  ${c.note ? `<p style="margin:0 0 4px;font-size:14px">Note: ${esc(c.note)}</p>` : ""}
  ${itemsTable(order, "en")}
  <p style="margin:18px 0 0;font-size:14px"><a href="${BRAND.site}/admin/orders" style="color:${BRAND.ink}"><strong>Open admin orders →</strong></a></p>
</div>`;
  return {
    subject: `New order ${order.id} — ${ils(order.subtotal)}`,
    html: shell(body),
    text: `New order ${order.id}\n${c.name} · ${c.email}${c.phone ? ` · ${c.phone}` : ""}\n${c.address ? `Ship to: ${c.address}\n` : ""}${itemsText(order)}\nTotal: ${ils(order.subtotal)}\nAdmin: ${BRAND.site}/admin/orders`,
  };
}

/** Shipped note — Hebrew first, then English. */
export function orderShippedEmail(order: Order): EmailContent {
  const name = esc(order.customer.name);
  const he = `<div dir="rtl" style="text-align:right">
  <h2 style="margin:0 0 8px;font-size:20px">ההזמנה בדרך אליך, ${name}!</h2>
  <p style="margin:0 0 4px;font-size:14px;line-height:1.7">הזמנה <strong>${order.id}</strong> נשלחה.</p>
  ${itemsTable(order, "he")}
</div>`;
  const en = `<div dir="ltr" style="text-align:left;margin-top:26px;padding-top:20px;border-top:1px dashed ${BRAND.line}">
  <h2 style="margin:0 0 8px;font-size:20px">It's on the way, ${name}!</h2>
  <p style="margin:0 0 4px;font-size:14px;line-height:1.7">Order <strong>${order.id}</strong> has shipped.</p>
  ${itemsTable(order, "en")}
</div>`;
  return {
    subject: `הזמנתך ${order.id} נשלחה · Your AAA order ${order.id} has shipped`,
    html: shell(he + en),
    text: `ההזמנה בדרך אליך, ${order.customer.name}!\nהזמנה ${order.id} נשלחה.\n${itemsText(order)}\n\n— — —\n\nIt's on the way, ${order.customer.name}!\nOrder ${order.id} has shipped.\n${itemsText(order)}\nAAA — Wearable Art · artbyaaa.com`,
  };
}

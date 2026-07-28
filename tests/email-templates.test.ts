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
  currency: "ILS",
  customer: { name: "Dana Levi", email: "dana@example.com", address: "Tel Aviv" },
  paymentStatus: "unpaid",
  fulfillmentStatus: "new",
};

describe("orderReceiptEmail", () => {
  it("includes order id, each item with qty and price, and the subtotal", () => {
    const m = orderReceiptEmail(order);
    expect(m.subject).toContain("AAA-7F3K2");
    for (const part of ["Wave Hoodie", "M", "Logo Tee", "×2", "₪120", "₪45", "₪210"]) {
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

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
  subtotal: 10, currency: "ILS",
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
    // Resolves (doesn't throw) and reports whether the studio alert was sent.
    await expect(sendOrderEmails(order)).resolves.toEqual(expect.any(Boolean));
  });
});

describe("sendShippedEmail", () => {
  it("sends to the customer", async () => {
    await sendShippedEmail(order);
    expect(vi.mocked(sendEmail).mock.calls[0][0].to).toBe("a@b.co");
  });
});

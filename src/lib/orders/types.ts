/* Order model for the storefront. Payments are handled offline for now (no
 * Stripe): an order is captured as "unpaid", and the studio marks it "paid"
 * from the admin once payment is arranged. */

export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type FulfillmentStatus = "new" | "in_production" | "shipped" | "completed" | "cancelled";

export const PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "paid", "refunded"];
export const FULFILLMENT_STATUSES: FulfillmentStatus[] = ["new", "in_production", "shipped", "completed", "cancelled"];

export const FULFILLMENT_LABELS: Record<FulfillmentStatus, string> = {
  new: "New",
  in_production: "In production",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

export interface OrderItem {
  slug: string;
  name: string;
  /** e.g. a size like "M" or "US 9" */
  variant?: string;
  /** unit price in ILS (server-recomputed from the catalog) */
  price: number;
  qty: number;
  /** cover image path for the piece (shown in emails / admin) */
  image?: string;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  note?: string;
}

export interface Order {
  id: string;
  createdAt: string; // ISO
  items: OrderItem[];
  subtotal: number;
  currency: "ILS";
  customer: OrderCustomer;
  paymentStatus: PaymentStatus;
  /** how the studio collected payment, e.g. "Bank transfer", "Cash", "Bit" */
  paymentMethod?: string;
  fulfillmentStatus: FulfillmentStatus;
}

/** Short human-friendly order reference, e.g. "AAA-7F3K2". */
export function newOrderId(seed: number): string {
  const base = Math.abs(Math.floor(seed)).toString(36).toUpperCase().slice(-5).padStart(5, "0");
  return `AAA-${base}`;
}

/* Client-safe customer shape (no server imports), derived from order history. */

export interface Customer {
  /** lowercased email — the stable key */
  email: string;
  /** display name from the most recent order */
  name: string;
  phone?: string;
  /** number of orders placed */
  orders: number;
  /** total of every order's subtotal (₪) */
  totalSpent: number;
  /** total of orders marked paid (₪) */
  paidSpent: number;
  /** first order date (ISO) — stands in for "signup" until accounts exist */
  firstOrder: string;
  /** most recent order date (ISO) */
  lastOrder: string;
  /** the studio's private note about this customer */
  note?: string;
}

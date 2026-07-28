import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* Provider-agnostic cart: client-side state for the current browsing session.
 * A guest (not-signed-in) cart is intentionally session-only — it never lingers
 * across browser sessions or leaks between visitors. When customer accounts land,
 * a signed-in cart will sync to the account instead. Works identically on Vercel
 * and the static Hostinger build. */

/* Session-only storage, guarded for SSR (no window on the server). */
const sessionStore = () =>
  typeof window !== "undefined"
    ? window.sessionStorage
    : (undefined as unknown as Storage);

export interface CartItem {
  slug: string;
  name: string;
  price: number;
  image?: string;
  /** optional variant note, e.g. a size */
  variant?: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (slug: string, variant?: string) => void;
  setQty: (slug: string, qty: number, variant?: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

const sameLine = (a: CartItem, slug: string, variant?: string) => a.slug === slug && (a.variant ?? "") === (variant ?? "");

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => sameLine(i, item.slug, item.variant));
          const items = existing
            ? s.items.map((i) => (sameLine(i, item.slug, item.variant) ? { ...i, qty: i.qty + qty } : i))
            : [...s.items, { ...item, qty }];
          return { items, isOpen: true };
        }),
      remove: (slug, variant) => set((s) => ({ items: s.items.filter((i) => !sameLine(i, slug, variant)) })),
      setQty: (slug, qty, variant) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => !sameLine(i, slug, variant))
              : s.items.map((i) => (sameLine(i, slug, variant) ? { ...i, qty } : i)),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "aaa-cart",
      storage: createJSONStorage(sessionStore),
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

export const cartCount = (items: CartItem[]): number => items.reduce((n, i) => n + i.qty, 0);
export const cartSubtotal = (items: CartItem[]): number => items.reduce((n, i) => n + i.price * i.qty, 0);

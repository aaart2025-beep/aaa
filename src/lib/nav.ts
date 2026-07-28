/* Single source of truth for the site menu — order, routes, labels and which
 * items the admin has toggled off. Every nav surface (paper header, home
 * end-state, the A Book header, mobile menu) derives from this so the order and
 * visibility stay in lockstep. */

export interface NavItem {
  /** stable id, also the visibility key and the text-key suffix */
  key: string;
  href: string;
  /** fallback label when no admin text override exists */
  fallback: string;
  /** which side of the centred wordmark it sits on (paper header) */
  side: "left" | "right";
}

/** Menu order: Shop · Collections · Create, then About · Contact.
 * ("A Book" is hidden for now — its /a-book route still works by URL.) */
export const NAV_ITEMS: NavItem[] = [
  { key: "shop", href: "/shop", fallback: "Shop", side: "left" },
  { key: "collections", href: "/collection", fallback: "Collections", side: "left" },
  { key: "create", href: "/create", fallback: "Create", side: "left" },
  { key: "about", href: "/about", fallback: "About", side: "right" },
  { key: "contact", href: "/contact", fallback: "Contact", side: "right" },
];

/** Content text-key for an item's label (admin-editable). */
export function navTextKey(key: string): string {
  return `nav.${key}`;
}

/** Hidden only when explicitly set false; unknown/absent → visible. */
export function isNavVisible(navVisible: Record<string, boolean> | undefined, key: string): boolean {
  return navVisible?.[key] !== false;
}

/** The items that should currently appear, in order. */
export function visibleNavItems(navVisible: Record<string, boolean> | undefined): NavItem[] {
  return NAV_ITEMS.filter((n) => isNavVisible(navVisible, n.key));
}

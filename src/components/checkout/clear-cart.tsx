"use client";

import * as React from "react";
import { useCart } from "@/lib/cart/store";

/** Empties the bag once, on mount (used by the order-success page). */
export function ClearCart() {
  const clear = useCart((s) => s.clear);
  React.useEffect(() => {
    clear();
  }, [clear]);
  return null;
}

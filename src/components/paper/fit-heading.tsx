"use client";

import * as React from "react";

/* A product-title heading that always sits on ONE line: it starts from the
 * CSS font size and shrinks just enough for the name to fit its container,
 * however long the name is. Re-fits on resize (orientation / window changes).
 * Renders as an <h1>; the caller supplies the visual classes. */
export function FitHeading({ text, className }: { text: string; className?: string }) {
  const ref = React.useRef<HTMLHeadingElement>(null);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      // Reset to the stylesheet size, then measure the natural (nowrap) width.
      el.style.fontSize = "";
      const base = parseFloat(getComputedStyle(el).fontSize) || 24;
      let size = base;
      // Shrink until the text fits on one line (or we hit a sensible floor).
      // scrollWidth is the full nowrap width; clientWidth is the box width.
      let guard = 0;
      while (el.scrollWidth > el.clientWidth + 1 && size > 11 && guard < 200) {
        size -= 1;
        el.style.fontSize = `${size}px`;
        guard += 1;
      }
    };

    fit();
    const ro = new ResizeObserver(fit);
    // Observe the parent box — its width drives how much room the title has.
    if (el.parentElement) ro.observe(el.parentElement);
    return () => ro.disconnect();
  }, [text]);

  return (
    <h1 ref={ref} className={className} style={{ whiteSpace: "nowrap" }}>
      {text}
    </h1>
  );
}

/* Renders text where each letter glows in turn — a wave of light travelling
 * from the first letter to the last (staggered animation-delay). Used for the
 * "one piece only" mark. Pure markup (no hooks) so it works in both server and
 * client components. Screen readers get the whole word via aria-label; the
 * per-letter spans are aria-hidden. */

export function GlowText({ text, className }: { text: string; className?: string }) {
  const chars = Array.from(text);
  return (
    <span className={className} aria-label={text}>
      {chars.map((ch, i) =>
        ch === " " ? (
          <span key={i} aria-hidden>
            {" "}
          </span>
        ) : (
          <span
            key={i}
            aria-hidden
            className="one-piece-letter"
            style={{ animationDelay: `${(i * 0.11).toFixed(2)}s` }}
          >
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

import type { ProductSizeGuide } from "@/lib/products";

/* The measurements table shared by the site-wide Size Guide page and the
 * per-product size-guide pop-up on each product. Pure presentational markup
 * (no hooks) so it renders inside a Server Component or a Client dialog alike.
 * The size/measure text is studio-entered, so it isn't run through i18n; only
 * the column headers + empty line are passed in already-translated. */

export function SizeGuideTable({
  guide,
  sizeCol,
  measureCol,
  emptyText,
}: {
  guide: ProductSizeGuide | undefined;
  sizeCol: string;
  measureCol: string;
  emptyText: string;
}) {
  const rows = (guide?.rows ?? []).filter((r) => (r.size ?? "").trim() || (r.measure ?? "").trim());

  return (
    <div>
      {guide?.intro?.trim() ? (
        <p className="font-typewriter mb-4 text-[12px] leading-[1.8] tracking-[0.02em] text-ink/75">{guide.intro}</p>
      ) : null}

      {rows.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-start">
            <thead>
              <tr className="border-b-2 border-ink/60">
                <th className="font-archivo py-2 pe-4 text-start text-[11px] font-extrabold uppercase tracking-tight text-ink">
                  {sizeCol}
                </th>
                <th className="font-archivo py-2 text-start text-[11px] font-extrabold uppercase tracking-tight text-ink">
                  {measureCol}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-dashed border-ink/25 align-top">
                  <td className="font-typewriter whitespace-nowrap py-2.5 pe-4 text-[12px] font-bold uppercase tracking-[0.06em] text-ink">
                    {r.size}
                  </td>
                  <td className="font-typewriter py-2.5 text-[12px] leading-[1.7] tracking-[0.02em] text-ink/80">
                    {r.measure}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="font-typewriter text-[12px] leading-[1.8] tracking-[0.02em] text-ink/70">{emptyText}</p>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import { useT } from "@/lib/i18n/context";

/* Shrink a photo in the browser before upload (fast, keeps well under Vercel's
 * request limit). Falls back to the original if the browser can't decode it. */
async function shrink(file: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const MAX = 1200;
    let w = bmp.width;
    let h = bmp.height;
    if (Math.max(w, h) > MAX) {
      const s = MAX / Math.max(w, h);
      w = Math.round(w * s);
      h = Math.round(h * s);
    }
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bmp.close();
      return file;
    }
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.85));
    return blob ?? file;
  } catch {
    return file;
  }
}

export function ReviewForm({ productSlug }: { productSlug?: string }) {
  const t = useT();
  const [state, setState] = React.useState<"idle" | "sending" | "sent" | "error">("idle");
  const [rating, setRating] = React.useState(5);
  const [form, setForm] = React.useState({ name: "", body: "", company: "" });
  const [photo, setPhoto] = React.useState<File | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("body", form.body);
      fd.append("rating", String(rating));
      fd.append("company", form.company);
      if (productSlug) fd.append("productSlug", productSlug);
      if (photo) fd.append("photo", await shrink(photo), "review.jpg");
      const res = await fetch("/api/reviews", { method: "POST", body: fd });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean };
      setState(j.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  };

  const field =
    "w-full rounded border border-ink/25 bg-white/60 px-3 py-2.5 font-typewriter text-[13px] text-ink outline-none transition-colors focus:border-ink/60";

  if (state === "sent") {
    return (
      <div className="rounded border border-ink/25 bg-paper px-5 py-6 text-center shadow-paper">
        <p className="font-typewriter text-[13px] leading-[1.8] text-ink/80">{t("reviews.sent")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 text-start">
      <input
        type="text"
        name="company"
        value={form.company}
        onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <label className="flex flex-col gap-1">
        <span className="font-typewriter text-[10px] uppercase tracking-[0.14em] text-ink/60">{t("reviews.name")}</span>
        <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={field} />
      </label>

      <div className="flex flex-col gap-1">
        <span className="font-typewriter text-[10px] uppercase tracking-[0.14em] text-ink/60">{t("reviews.rating")}</span>
        <div className="flex gap-1" role="radiogroup" aria-label={t("reviews.rating")}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n}`}
              onClick={() => setRating(n)}
              className={`text-[24px] leading-none transition-colors ${n <= rating ? "text-amber-500" : "text-ink/25 hover:text-amber-400"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="font-typewriter text-[10px] uppercase tracking-[0.14em] text-ink/60">{t("reviews.reviewText")}</span>
        <textarea required rows={4} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} className={`${field} resize-y`} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-typewriter text-[10px] uppercase tracking-[0.14em] text-ink/60">{t("reviews.photo")}</span>
        <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} className="font-typewriter text-[12px] text-ink/70 file:mr-3 file:rounded file:border file:border-ink/30 file:bg-paper file:px-3 file:py-1.5 file:text-[11px] file:text-ink" />
      </label>

      {state === "error" && <p className="font-typewriter text-[12px] text-red-700">{t("reviews.error")}</p>}

      <button
        type="submit"
        disabled={state === "sending"}
        className="chip-lime font-archivo mt-1 self-start px-7 py-3 text-[12px] font-bold uppercase tracking-[0.18em] disabled:opacity-50"
      >
        {state === "sending" ? t("reviews.sending") : t("reviews.submit")}
      </button>
    </form>
  );
}

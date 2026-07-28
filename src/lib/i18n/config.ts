/* Language config for the bilingual storefront (English / Hebrew).
 * The chosen language lives in a cookie so both the server (page renders)
 * and the client (instant toggle) agree on it. Hebrew flips the page to RTL. */

export type Lang = "en" | "he";

export const LANGS: Lang[] = ["en", "he"];
export const DEFAULT_LANG: Lang = "en";
export const LANG_COOKIE = "lang";

export function isLang(v: unknown): v is Lang {
  return v === "en" || v === "he";
}

/** Text direction for a language. Hebrew is right-to-left. */
export function dir(lang: Lang): "rtl" | "ltr" {
  return lang === "he" ? "rtl" : "ltr";
}

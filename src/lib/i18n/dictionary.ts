import type { Lang } from "@/lib/i18n/config";
import { DEFAULT_LANG } from "@/lib/i18n/config";
import { chrome } from "@/lib/i18n/dict/chrome";
import { checkout } from "@/lib/i18n/dict/checkout";
import { shop } from "@/lib/i18n/dict/shop";
import { pages } from "@/lib/i18n/dict/pages";
import { policies } from "@/lib/i18n/dict/policies";
import { home } from "@/lib/i18n/dict/home";

/* Merged translation dictionary. Each namespace module contributes its own
 * flat `namespace.key` entries for both languages, merged here. `translate`
 * is the single lookup used by both the server (`getT`) and client (`useT`)
 * layers, so translations render identically in either place. */

type Dict = Record<Lang, Record<string, string>>;

function merge(...parts: Dict[]): Dict {
  const out: Dict = { en: {}, he: {} };
  for (const part of parts) {
    Object.assign(out.en, part.en);
    Object.assign(out.he, part.he);
  }
  return out;
}

export const DICT: Dict = merge(chrome, checkout, shop, pages, policies, home);

/** Replace {name} placeholders with values from `vars`. */
function interpolate(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/** Look up a key for a language, falling back to English, then to the key
 * itself so a missing translation is visible rather than blank. */
export function translate(
  lang: Lang,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const table = DICT[lang] ?? DICT[DEFAULT_LANG];
  const raw = table[key] ?? DICT[DEFAULT_LANG][key] ?? key;
  return interpolate(raw, vars);
}

export type TFunction = (key: string, vars?: Record<string, string | number>) => string;

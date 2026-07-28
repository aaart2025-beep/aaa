import { cookies } from "next/headers";
import { DEFAULT_LANG, LANG_COOKIE, isLang, type Lang } from "@/lib/i18n/config";
import { translate, type TFunction } from "@/lib/i18n/dictionary";

/* Server-side language access for Server Components. Reading the cookie opts
 * the route into dynamic rendering, so a language switch is reflected on the
 * next request (the client toggle calls router.refresh()). */

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const v = store.get(LANG_COOKIE)?.value;
  return isLang(v) ? v : DEFAULT_LANG;
}

/** Convenience: resolve the language and return a bound `t()` for a Server
 * Component. Usage: `const t = await getT();  t("checkout.title")`. */
export async function getT(): Promise<TFunction> {
  const lang = await getLang();
  return (key, vars) => translate(lang, key, vars);
}

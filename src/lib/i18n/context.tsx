"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LANG, LANG_COOKIE, dir, type Lang } from "@/lib/i18n/config";
import { translate, type TFunction } from "@/lib/i18n/dictionary";

/* Client-side language state. Initialised from the cookie the server already
 * read (passed via <LanguageProvider initial=…>), so there is no flash. The
 * toggle writes the cookie, flips <html dir/lang> optimistically for an
 * instant feel, then router.refresh() re-renders Server Components in the new
 * language. */

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: TFunction;
}

const Ctx = React.createContext<LangCtx | null>(null);

export function LanguageProvider({
  initial,
  children,
}: {
  initial: Lang;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = React.useState<Lang>(initial);
  const router = useRouter();

  const setLang = React.useCallback(
    (l: Lang) => {
      setLangState(l);
      // Persist for a year; path=/ so every route sees it.
      document.cookie = `${LANG_COOKIE}=${l};path=/;max-age=31536000;samesite=lax`;
      const root = document.documentElement;
      root.setAttribute("lang", l);
      root.setAttribute("dir", dir(l));
      router.refresh();
    },
    [router],
  );

  const toggle = React.useCallback(
    () => setLang(lang === "he" ? "en" : "he"),
    [lang, setLang],
  );

  const t = React.useCallback<TFunction>((key, vars) => translate(lang, key, vars), [lang]);

  const value = React.useMemo(() => ({ lang, setLang, toggle, t }), [lang, setLang, toggle, t]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const ctx = React.useContext(Ctx);
  if (!ctx) {
    // Safe fallback if a client component renders outside the provider.
    return {
      lang: DEFAULT_LANG,
      setLang: () => {},
      toggle: () => {},
      t: (key, vars) => translate(DEFAULT_LANG, key, vars),
    };
  }
  return ctx;
}

/** Just the translate function, for components that only need `t`. */
export function useT(): TFunction {
  return useLang().t;
}

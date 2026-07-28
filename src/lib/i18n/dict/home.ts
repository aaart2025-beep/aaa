import type { Lang } from "@/lib/i18n/config";

/* Landing / book experience (cover, hero, flipbook chrome). Keys prefixed
 * `home.`. Filled by the home translation pass. */

export const home: Record<Lang, Record<string, string>> = {
  en: {
    // hero cover / scroll-video
    "home.heroHeadlineA": "Wearable art",
    "home.heroHeadlineB": "made by hand",
    "home.heroShopCta": "Enter the shop",
    "home.heroIntroCta": "Tap to begin",
    "home.heroBeginAria": "Begin",
    // book experience chrome
    "home.rotateHint": "rotate for the full spread ⟳",
    "home.rotateHintDismiss": "Dismiss rotation hint",
    "home.close": "Close",
    "home.contents": "Contents",
    "home.closeContents": "Close contents",
    "home.aboutAaa": "About AAA",
    "home.turnNextAria": "Turn to next page",
    "home.prevAria": "Previous page",
    "home.nextAria": "Next page",
    "home.escToGoBack": "Press Esc or Close to go back",
    "home.browsePrompt": "Use the arrows or contents to browse",
    "home.cartCount": " · {count} in cart",
    "home.openToBegin": "Open the book to begin",
    // a-book route
    "home.backToAaa": "← Back to AAA",
    "home.bookMetaTitle": "A Book — AAA",
    "home.bookMetaDescription": "A luxury fashion & art catalog you open like a book.",
  },
  he: {
    // hero cover / scroll-video
    "home.heroHeadlineA": "אמנות ללבוש",
    "home.heroHeadlineB": "עבודת יד",
    "home.heroShopCta": "כניסה לחנות",
    "home.heroIntroCta": "הקישו כדי להתחיל",
    "home.heroBeginAria": "התחלה",
    // book experience chrome
    "home.rotateHint": "סובבו לכפולה המלאה ⟳",
    "home.rotateHintDismiss": "סגירת הרמז לסיבוב",
    "home.close": "סגירה",
    "home.contents": "תוכן העניינים",
    "home.closeContents": "סגירת תוכן העניינים",
    "home.aboutAaa": "על AAA",
    "home.turnNextAria": "מעבר לעמוד הבא",
    "home.prevAria": "העמוד הקודם",
    "home.nextAria": "העמוד הבא",
    "home.escToGoBack": "הקישו Esc או סגירה כדי לחזור",
    "home.browsePrompt": "דפדפו בעזרת החצים או תוכן העניינים",
    "home.cartCount": " · {count} בעגלה",
    "home.openToBegin": "פתחו את הספר כדי להתחיל",
    // a-book route
    "home.backToAaa": "→ חזרה ל-AAA",
    "home.bookMetaTitle": "ספר — AAA",
    "home.bookMetaDescription": "קטלוג אופנה ואמנות יוקרתי שנפתח כמו ספר.",
  },
};

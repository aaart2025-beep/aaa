import type { Lang } from "@/lib/i18n/config";

/* Standalone content pages (about, contact, login, accessibility, create,
 * 404, error) + floating widgets and the design-it-yourself creator. Keys
 * prefixed `pages.`. English mirrors the in-code fallbacks; Hebrew is the
 * boutique-brand voice for AAA — amit_amar_art. */

export const pages: Record<Lang, Record<string, string>> = {
  en: {
    // ---- about ----
    "pages.about.eyebrow": "The artist",
    "pages.about.title": "One pair of hands,",
    "pages.about.title2": "one piece at a time.",
    "pages.about.opening": "Hi — I'm Amit.",
    "pages.about.body1":
      "AAA started exactly the way this website looks: as a workbook. A place where sketches, fabric swatches and half-ideas pile up until one of them refuses to stay on the page.",
    "pages.about.body2":
      "Everything in the shop is made by hand in my studio — painted sneakers sealed and flexed for real wear, hoodies rebuilt with patches and embroidery, one-off objects that are equal parts furniture and inside joke.",
    "pages.about.body3":
      "Nothing is mass-produced. When a piece sells, it's gone — the page turns, and the book moves on. If you want something that exists exactly once, you're in the right place.",
    "pages.about.quote": "Souls are rare. Pretty faces are everywhere.",
    "pages.about.quoteAttribution": "— stitched on the back of a blue hoodie",
    "pages.about.cta": "See the pieces",
    "pages.about.ctaCreate": "Design your own",
    "pages.about.photoAlt": "The AAA studio table",
    "pages.about.photoNote": "where it all happens",
    "pages.about.figCaption": "Fig. 00 — the studio",
    "pages.about.processTitle": "How a piece happens",
    "pages.about.process1": "It starts as a sketch in this book — a line, a joke, a feeling.",
    "pages.about.process2": "Then the hunt: the right blank, the right fabric, the right thread.",
    "pages.about.process3": "Paint, stitch, fray, seal — every mark made by hand, no two alike.",
    "pages.about.process4": "Photographed, numbered and filed here. Then it's yours.",

    // ---- contact ----
    "pages.contact.eyebrow": "Correspondence",
    "pages.contact.title": "Write to the studio",
    "pages.contact.body":
      "Commissions, custom pieces, sizing questions, or just to say the Mona Lisa Jordans are a lot — every message lands on this desk and gets a reply from the artist.",
    "pages.contact.cardLabel": "Preferred channel",
    "pages.contact.note": "replies within a day — usually with sketches",
    "pages.contact.socialLabel": "Or find the studio here",

    // ---- login ----
    "pages.login.heading": "Staff entrance",
    "pages.login.subtitle": "Sign in to open the studio console.",
    "pages.login.makersOnly": "AAA — makers only",
    "pages.login.note": "the workbook stays open — this door is just for the studio",
    "pages.login.back": "← back to the book",

    // ---- login form ----
    "pages.loginForm.errEmpty": "Please enter your username and password.",
    "pages.loginForm.errInvalid": "Invalid username or password.",
    "pages.loginForm.errGeneric": "Something went wrong. Please try again.",
    "pages.loginForm.username": "Username",
    "pages.loginForm.usernamePlaceholder": "your name",
    "pages.loginForm.password": "Password",
    "pages.loginForm.opening": "Opening the door…",
    "pages.loginForm.signIn": "Sign in",

    // ---- accessibility page ----
    "pages.a11y.backToShop": "Back to the shop",

    // ---- accessibility menu ----
    "pages.a11yMenu.dialogLabel": "Accessibility options",
    "pages.a11yMenu.title": "Accessibility",
    "pages.a11yMenu.close": "Close accessibility options",
    "pages.a11yMenu.textSize": "Text size",
    "pages.a11yMenu.textNormal": "Normal text size",
    "pages.a11yMenu.textLarge": "Large text size",
    "pages.a11yMenu.textLargest": "Largest text size",
    "pages.a11yMenu.highContrast": "High contrast",
    "pages.a11yMenu.reduceMotion": "Reduce motion",
    "pages.a11yMenu.on": "On",
    "pages.a11yMenu.off": "Off",
    "pages.a11yMenu.reset": "Reset",
    "pages.a11yMenu.statement": "Statement",

    // ---- 404 ----
    "pages.notFound.eyebrow": "AAA — page 404",
    "pages.notFound.title": "this page isn't in the book",
    "pages.notFound.body":
      "Maybe the leaf was torn out, maybe it was never inked. Either way — back to the workbook.",
    "pages.notFound.openShop": "Open the shop",
    "pages.notFound.backCover": "Back to the cover",

    // ---- error ----
    "pages.error.eyebrow": "AAA — small accident",
    "pages.error.title": "ink spilled on this page",
    "pages.error.body": "Something went wrong while inking this page. Give it another press.",
    "pages.error.tryAgain": "Try again",

    // ---- create page header ----
    "pages.create.eyebrow": "The drafting table",
    "pages.create.title": "Design it yourself.",
    "pages.create.intro":
      "Your page in the workbook: pick a base, click any part of the drawing and paint it, drag the AAA mark wherever it belongs, choose fabric, size and cuts. The studio hand-makes exactly what you draft.",
    "pages.create.note": "every draft is buildable!",

    // ---- whatsapp float ----
    "pages.whatsapp.aria": "Chat on WhatsApp",

    // ---- order success ----
    "pages.success.eyebrow": "AAA — Order received",

    // ---- creator ----
    "pages.creator.loading3d": "loading 3D…",
    "pages.creator.svgAria": "Your custom {label} design",
    "pages.creator.logoAria": "AAA logo — drag to reposition",
    "pages.creator.oneOfOne": "Custom {label} — one of one",
    "pages.creator.selected": "{label} selected",
    "pages.creator.step.palette": "Borrow a palette from a real piece",
    "pages.creator.usePalette": "Use the {name} palette",
    "pages.creator.step.base": "Pick your base",
    "pages.creator.model": "Model",
    "pages.creator.step.paint": "Paint it — part by part",
    "pages.creator.swatchWall": "Swatch wall",
    "pages.creator.paintColor": "Paint {color}",
    "pages.creator.surprise": "Surprise me",
    "pages.creator.anyColour": "any colour",
    "pages.creator.customColour": "Custom colour",
    "pages.creator.paletteBorrowed": "palette borrowed from “{name}”",
    "pages.creator.step.fabric": "Choose the fabric",
    "pages.creator.included": "incl.",
    "pages.creator.step.pattern": "Pattern & graphics",
    "pages.creator.patternColour": "Pattern colour",
    "pages.creator.patternColourVal": "Pattern colour {color}",
    "pages.creator.customPatternColour": "Custom pattern colour",
    "pages.creator.scale": "Size",
    "pages.creator.angle": "Angle",
    "pages.creator.patternHint": "patterns paint the body — try Waveform or Kilim",
    "pages.creator.step.size": "Size",
    "pages.creator.step.cuts": "Cuts & finishes",
    "pages.creator.step.logo": "The AAA mark",
    "pages.creator.logoColour": "Logo colour",
    "pages.creator.logoColourVal": "Logo colour {color}",
    "pages.creator.customLogoColour": "Custom logo colour",
    "pages.creator.move": "← move →",
    "pages.creator.height": "↑ height ↓",
    "pages.creator.rotate": "⟳ rotate",
    "pages.creator.priceTitle": "The price writes itself",
    "pages.creator.estTotal": "Estimated total",
    "pages.creator.finalQuote": "Final quote confirmed by the studio before any work begins.",
    "pages.creator.rights":
      "By sending a design you confirm you own the rights to any image, text, or mark in it and that it doesn't infringe anyone else's rights.",
    "pages.creator.sendStudio": "Send to the studio",
    "pages.creator.downloadSketch": "Download sketch",
    "pages.creator.startOver": "Start over",
    "pages.creator.mail.none": "none",
    "pages.creator.mail.intro": "Hi AAA — here's my custom design from the creator:",
    "pages.creator.mail.base": "Base: {label}",
    "pages.creator.mail.colours": "Colours:",
    "pages.creator.mail.fabric": "Fabric: {label}",
    "pages.creator.mail.size": "Size: {size}",
    "pages.creator.mail.cuts": "Cuts & finishes: {cuts}",
    "pages.creator.mail.logo": "Logo: {details}",
    "pages.creator.mail.palette": "Palette borrowed from: {name}",
    "pages.creator.mail.estPrice": "Estimated price: {price}",
    "pages.creator.mail.attach":
      "(sketch attached — use \"Download sketch\" on the site and attach the file)",
    "pages.creator.mail.subject": "Custom {label} — AAA creator",

    // ---- mockup preview ----
    "pages.mockup.aria": "Realistic preview of your custom {label}",
    "pages.mockup.livePreview": "Live preview · exact",
    "pages.mockup.saveRender": "save render",
    "pages.mockup.note": "exactly what you designed",

    // ---- ai preview ----
    "pages.aiPreview.renderAlt": "AI render of your custom {label}",
    "pages.aiPreview.painting": "painting your piece…",
    "pages.aiPreview.studioRender": "AAA studio render",
    "pages.aiPreview.updating": "updating…",
    "pages.aiPreview.couldntRender": "Couldn't render",
    "pages.aiPreview.tryAgain": "Try again",
    "pages.aiPreview.label": "AI preview",
    "pages.aiPreview.liveFree": "updates live · free",
    "pages.aiPreview.note": "a peek at the real thing",
  },
  he: {
    // ---- about ----
    "pages.about.eyebrow": "האמן",
    "pages.about.title": "זוג ידיים אחד,",
    "pages.about.title2": "פריט אחד בכל פעם.",
    "pages.about.opening": "היי — אני עמית.",
    "pages.about.body1":
      "AAA התחיל בדיוק כמו שהאתר הזה נראה: כמחברת עבודה. מקום שבו סקיצות, דוגמיות בד וחצאי־רעיונות נערמים עד שאחד מהם מסרב להישאר על הדף.",
    "pages.about.body2":
      "כל מה שיש בחנות עשוי בעבודת יד בסטודיו שלי — סניקרס מצוירים, אטומים וגמישים ללבישה אמיתית, קפוצ'ונים שנבנו מחדש עם טלאים ורקמה, ואובייקטים חד־פעמיים שהם חצי רהיט וחצי בדיחה פנימית.",
    "pages.about.body3":
      "שום דבר כאן אינו מיוצר בייצור המוני. כשפריט נמכר — הוא נעלם; הדף מתהפך, והמחברת ממשיכה הלאה. אם בא לכם משהו שקיים בדיוק פעם אחת, הגעתם למקום הנכון.",
    "pages.about.quote": "נשמות הן דבר נדיר. פרצופים יפים יש בכל מקום.",
    "pages.about.quoteAttribution": "— רקום על גב קפוצ'ון כחול",
    "pages.about.cta": "לצפייה בפריטים",
    "pages.about.ctaCreate": "עצבו משלכם",
    "pages.about.photoAlt": "שולחן הסטודיו של AAA",
    "pages.about.photoNote": "כאן הכול קורה",
    "pages.about.figCaption": "איור 00 — הסטודיו",
    "pages.about.processTitle": "איך נולד פריט",
    "pages.about.process1": "הכול מתחיל בסקיצה במחברת הזו — קו, בדיחה, תחושה.",
    "pages.about.process2": "אחר כך מגיע הציד: הבסיס הנכון, הבד הנכון, החוט הנכון.",
    "pages.about.process3": "צביעה, תפירה, פרימה, איטום — כל סימן נעשה ביד, ואין שניים זהים.",
    "pages.about.process4": "מצולם, ממוספר ומתויק כאן. ואז הוא שלכם.",

    // ---- contact ----
    "pages.contact.eyebrow": "התכתבות",
    "pages.contact.title": "כתבו לסטודיו",
    "pages.contact.body":
      "הזמנות עבודה, פריטים בהתאמה אישית, שאלות על מידות, או סתם כדי להגיד שה־Mona Lisa Jordans זה קצת יותר מדי — כל הודעה נוחתת על השולחן הזה ומקבלת תשובה מהאמן עצמו.",
    "pages.contact.cardLabel": "הערוץ המועדף",
    "pages.contact.note": "תשובה תוך יום — בדרך כלל עם סקיצות",
    "pages.contact.socialLabel": "או מצאו את הסטודיו כאן",

    // ---- login ----
    "pages.login.heading": "כניסת צוות",
    "pages.login.subtitle": "התחברו כדי לפתוח את קונסולת הסטודיו.",
    "pages.login.makersOnly": "AAA — ליוצרים בלבד",
    "pages.login.note": "המחברת נשארת פתוחה — הדלת הזו היא רק לסטודיו",
    "pages.login.back": "← חזרה למחברת",

    // ---- login form ----
    "pages.loginForm.errEmpty": "נא להזין שם משתמש וסיסמה.",
    "pages.loginForm.errInvalid": "שם משתמש או סיסמה שגויים.",
    "pages.loginForm.errGeneric": "משהו השתבש. נסו שוב.",
    "pages.loginForm.username": "שם משתמש",
    "pages.loginForm.usernamePlaceholder": "השם שלך",
    "pages.loginForm.password": "סיסמה",
    "pages.loginForm.opening": "פותח את הדלת…",
    "pages.loginForm.signIn": "התחברות",

    // ---- accessibility page ----
    "pages.a11y.backToShop": "חזרה לחנות",

    // ---- accessibility menu ----
    "pages.a11yMenu.dialogLabel": "אפשרויות נגישות",
    "pages.a11yMenu.title": "נגישות",
    "pages.a11yMenu.close": "סגירת אפשרויות הנגישות",
    "pages.a11yMenu.textSize": "גודל טקסט",
    "pages.a11yMenu.textNormal": "גודל טקסט רגיל",
    "pages.a11yMenu.textLarge": "גודל טקסט גדול",
    "pages.a11yMenu.textLargest": "גודל הטקסט הגדול ביותר",
    "pages.a11yMenu.highContrast": "ניגודיות גבוהה",
    "pages.a11yMenu.reduceMotion": "הפחתת תנועה",
    "pages.a11yMenu.on": "פועל",
    "pages.a11yMenu.off": "כבוי",
    "pages.a11yMenu.reset": "איפוס",
    "pages.a11yMenu.statement": "הצהרה",

    // ---- 404 ----
    "pages.notFound.eyebrow": "AAA — עמוד 404",
    "pages.notFound.title": "העמוד הזה לא נמצא במחברת",
    "pages.notFound.body":
      "אולי הדף נתלש, אולי הוא מעולם לא צויר בדיו. כך או כך — חזרה למחברת.",
    "pages.notFound.openShop": "לפתיחת החנות",
    "pages.notFound.backCover": "חזרה לכריכה",

    // ---- error ----
    "pages.error.eyebrow": "AAA — תקלה קטנה",
    "pages.error.title": "נשפך דיו על העמוד הזה",
    "pages.error.body": "משהו השתבש בזמן הכנת העמוד. נסו שוב.",
    "pages.error.tryAgain": "נסו שוב",

    // ---- create page header ----
    "pages.create.eyebrow": "שולחן השרטוט",
    "pages.create.title": "עצבו בעצמכם.",
    "pages.create.intro":
      "הדף שלכם במחברת: בחרו בסיס, לחצו על כל חלק בציור וצבעו אותו, גררו את חותם ה־AAA לאן שבא לכם, ובחרו בד, מידה וגזרות. הסטודיו יוצר ביד בדיוק את מה שסרטטתם.",
    "pages.create.note": "כל שרטוט ניתן לייצור!",

    // ---- whatsapp float ----
    "pages.whatsapp.aria": "שיחה בוואטסאפ",

    // ---- order success ----
    "pages.success.eyebrow": "AAA — ההזמנה התקבלה",

    // ---- creator ----
    "pages.creator.loading3d": "טוען תלת־ממד…",
    "pages.creator.svgAria": "העיצוב המותאם שלך של {label}",
    "pages.creator.logoAria": "הלוגו של AAA — גררו כדי למקם מחדש",
    "pages.creator.oneOfOne": "{label} מותאם — אחד ויחיד",
    "pages.creator.selected": "{label} נבחר",
    "pages.creator.step.palette": "שאלו פלטת צבעים מפריט אמיתי",
    "pages.creator.usePalette": "השתמשו בפלטה של {name}",
    "pages.creator.step.base": "בחרו בסיס",
    "pages.creator.model": "דגם",
    "pages.creator.step.paint": "צבעו — חלק אחר חלק",
    "pages.creator.swatchWall": "קיר הצבעים",
    "pages.creator.paintColor": "צביעה ב־{color}",
    "pages.creator.surprise": "הפתיעו אותי",
    "pages.creator.anyColour": "כל צבע",
    "pages.creator.customColour": "צבע מותאם אישית",
    "pages.creator.paletteBorrowed": "פלטה מושאלת מ־„{name}”",
    "pages.creator.step.fabric": "בחרו את הבד",
    "pages.creator.included": "כלול",
    "pages.creator.step.pattern": "דוגמאות וגרפיקה",
    "pages.creator.patternColour": "צבע הדוגמה",
    "pages.creator.patternColourVal": "צבע הדוגמה {color}",
    "pages.creator.customPatternColour": "צבע דוגמה מותאם אישית",
    "pages.creator.scale": "גודל",
    "pages.creator.angle": "זווית",
    "pages.creator.patternHint": "הדוגמאות צובעות את הגוף — נסו Waveform או Kilim",
    "pages.creator.step.size": "מידה",
    "pages.creator.step.cuts": "גזרות וגימורים",
    "pages.creator.step.logo": "חותם ה־AAA",
    "pages.creator.logoColour": "צבע הלוגו",
    "pages.creator.logoColourVal": "צבע הלוגו {color}",
    "pages.creator.customLogoColour": "צבע לוגו מותאם אישית",
    "pages.creator.move": "← הזזה →",
    "pages.creator.height": "↑ גובה ↓",
    "pages.creator.rotate": "⟳ סיבוב",
    "pages.creator.priceTitle": "המחיר כותב את עצמו",
    "pages.creator.estTotal": "סה\"כ משוער",
    "pages.creator.finalQuote": "הצעת המחיר הסופית תאושר על ידי הסטודיו לפני תחילת העבודה.",
    "pages.creator.rights":
      "בשליחת עיצוב אתם מאשרים שהזכויות על כל תמונה, טקסט או סימן שבו שייכות לכם, ושאינם מפרים זכויות של אף אחד אחר.",
    "pages.creator.sendStudio": "שליחה לסטודיו",
    "pages.creator.downloadSketch": "הורדת סקיצה",
    "pages.creator.startOver": "התחלה מחדש",
    "pages.creator.mail.none": "ללא",
    "pages.creator.mail.intro": "היי AAA — הנה העיצוב המותאם שלי מהסטודיו:",
    "pages.creator.mail.base": "בסיס: {label}",
    "pages.creator.mail.colours": "צבעים:",
    "pages.creator.mail.fabric": "בד: {label}",
    "pages.creator.mail.size": "מידה: {size}",
    "pages.creator.mail.cuts": "גזרות וגימורים: {cuts}",
    "pages.creator.mail.logo": "לוגו: {details}",
    "pages.creator.mail.palette": "פלטה מושאלת מ: {name}",
    "pages.creator.mail.estPrice": "מחיר משוער: {price}",
    "pages.creator.mail.attach":
      "(הסקיצה מצורפת — השתמשו ב\"הורדת סקיצה\" באתר וצרפו את הקובץ)",
    "pages.creator.mail.subject": "{label} מותאם — סטודיו AAA",

    // ---- mockup preview ----
    "pages.mockup.aria": "תצוגה מקדימה מציאותית של ה־{label} המותאם שלך",
    "pages.mockup.livePreview": "תצוגה חיה · מדויקת",
    "pages.mockup.saveRender": "שמירת הדמיה",
    "pages.mockup.note": "בדיוק מה שעיצבתם",

    // ---- ai preview ----
    "pages.aiPreview.renderAlt": "הדמיית AI של ה־{label} המותאם שלך",
    "pages.aiPreview.painting": "מציירים את הפריט שלך…",
    "pages.aiPreview.studioRender": "הדמיית סטודיו AAA",
    "pages.aiPreview.updating": "מעדכן…",
    "pages.aiPreview.couldntRender": "ההדמיה נכשלה",
    "pages.aiPreview.tryAgain": "נסו שוב",
    "pages.aiPreview.label": "תצוגת AI",
    "pages.aiPreview.liveFree": "מתעדכן חי · חינם",
    "pages.aiPreview.note": "הצצה לדבר האמיתי",
  },
};

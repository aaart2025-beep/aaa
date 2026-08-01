import type { Lang } from "@/lib/i18n/config";

/* Shop / collection / product-page UI strings. Keys prefixed `shop.`.
 * (Product copy itself — taglines, descriptions, colours — is translated
 * separately in products-he.ts.) Filled by the shop translation pass. */

export const shop: Record<Lang, Record<string, string>> = {
  en: {
    /* ---- categories ---- */
    "shop.catAll": "All",
    "shop.catClothing": "Clothing",
    "shop.catHeadwear": "Headwear",
    "shop.catFootwear": "Footwear",
    "shop.catArtObject": "Art Object",
    "shop.catSale": "Sale",

    /* ---- shop landing ---- */
    "shop.eyebrow": "AAA — The Shop",
    "shop.title": "Our Shop",
    "shop.intro":
      "AAA is a luxury fashion and art brand creating unique custom-designed pieces that speak individuality, creativity and timeless style.",
    "shop.fromWorkbook": "from the workbook",
    "shop.customTitle": "Create Your Own Design",
    "shop.customBody":
      "Have an idea, a sketch, a photo? Upload your image and our studio will hand-craft it into a one-of-a-kind wearable piece. Every AAA custom order is made-to-order, just for you.",
    "shop.customCta": "Upload your image",
    "shop.replyDay": "we reply within a day",
    "shop.uploadRights":
      "By uploading you confirm you own the rights to the image and that it doesn't infringe anyone else's rights.",
    "shop.customMailSubject": "Custom design request — AAA",
    "shop.customMailBody":
      "Hi! I'd like to create a custom piece. My idea: \n\n(attach your image or sketch here)",

    /* ---- shop grid: filter / sort / meta ---- */
    "shop.filterLabel": "Filter",
    "shop.sortLabel": "Sort",
    "shop.filterSortAria": "Filter and sort",
    "shop.sortFeatured": "Featured",
    "shop.sortPriceAsc": "Price ↑",
    "shop.sortPriceDesc": "Price ↓",
    "shop.sortAZ": "A–Z",
    "shop.piecesHandmade": "{count} pieces · all handmade",
    "shop.noTwoIdentical": "no two pieces identical!",
    "shop.emptyTab": "Nothing filed under this tab yet.",
    "shop.comingSoon": "Coming soon",
    "shop.inStudio": "in the studio…",

    /* ---- cards ---- */
    "shop.openAria": "Open {name}",
    "shop.openDetailsAria": "Open {name} details",
    "shop.viewProduct": "View Product",

    /* ---- product page ---- */
    "shop.backToShop": "Back to the shop",
    "shop.related": "You might also like",
    "shop.fieldGarment": "Garment",
    "shop.fieldFit": "Fit",
    "shop.fieldFabricDetail": "Fabric Detail",
    "shop.fieldSize": "Size",
    "shop.fieldSizes": "Sizes",
    "shop.fieldDate": "Date",
    "shop.fieldFabric": "Fabric",
    "shop.fieldPrint": "Print",
    "shop.fieldColors": "Colors",
    "shop.offBadge": "−{pct}% off",
    "shop.listPriceNote": "the studio's list price",
    "shop.designedBy": "Designed by Amit Amar Art",
    "shop.careWashing": "Care & washing",
    "shop.addToCart": "Add to Cart",
    "shop.soldOut": "Sold out",
    "shop.onePiece": "One piece only",
    "shop.sizeGuide": "Size guide",
    "shop.sizeGuideTitle": "Size Guide",
    "shop.sizeGuideEmpty": "Size details are coming soon. Message us and we'll help you choose.",
    "shop.sizeCol": "Size",
    "shop.measureCol": "Measurements",
    "shop.specSheet": "Spec Sheet",

    /* ---- garment values (spec sheet) ---- */
    "shop.garmentCap": "Cap",
    "shop.garmentSneaker": "Sneaker",
    "shop.garmentArtObject": "Art Object",
    "shop.garmentHoodie": "Hoodie",
    "shop.garmentSweatshirt": "Sweatshirt",
    "shop.garmentTracksuit": "Tracksuit",
    "shop.garmentBodysuit": "Bodysuit",
    "shop.garmentTee": "T-Shirt",
    "shop.garmentHalter": "Halter",
    "shop.garmentCami": "Cami",
    "shop.garmentSkirt": "Skirt",
    "shop.garmentPullover": "Pullover",
    "shop.garmentGarment": "Garment",

    /* ---- fit values ---- */
    "shop.fitOversized": "Oversized",
    "shop.fitCroppedBoxy": "Cropped boxy",
    "shop.fitCompression": "Compression",
    "shop.fitTrueToSize": "True to size",
    "shop.fitAdjustable": "Adjustable",
    "shop.fitOneOfOne": "One of one",

    /* ---- short fabric-detail tags ---- */
    "shop.sdPrint": "Print",
    "shop.sdEmbroidery": "Embroidery",
    "shop.sdHandPaint": "Hand-paint",
    "shop.sdApplique": "Appliqué",
    "shop.sdStitch": "Stitch",
    "shop.sdWashed": "Washed",

    /* ---- size labels ---- */
    "shop.sizeOneSize": "One size",
    "shop.sizeOneOfOne": "One of one",

    /* ---- studio views ---- */
    "shop.viewFront": "Front",
    "shop.viewBack": "Back",
    "shop.viewSideLeft": "Side · L",
    "shop.viewSideRight": "Side · R",
    "shop.viewFabric": "Fabric",
    "shop.viewOf": "{label} view",
    "shop.toBePhotographed": "to be photographed…",
    "shop.detailZoom": "Detail × {x}",
    "shop.productViewsAria": "Product views",

    /* ---- collection ---- */
    "shop.collectionEyebrow": "AAA — The Collection",
    "shop.collectionTitle": "Our Collection",
    "shop.collectionIntro":
      "Hand-made pieces, grouped by who and what they're for. Tap any item to open it.",
    "shop.albumNote": "an album of everything, strip by strip ↓",
    "shop.backToCollection": "Back to the collection",
    "shop.shopTitle": "Shop {title}",

    /* ---- book experience (flipbook chrome I own) ---- */
    "shop.madeBy": "Made By",
    "shop.enter": "Enter",
    "shop.estHandMade": "Est. 2026 · Hand Made",
    "shop.handMade": "Hand Made",
    "shop.aboutHeadline1": "Wearable art,",
    "shop.aboutHeadline2": "unique as you.",
    "shop.aboutPara1":
      "AAA is a luxury fashion and art house creating one-of-a-kind, custom-designed pieces. Every garment and object is hand-finished in our studio — made to carry individuality, creativity and a quiet sense of timeless style.",
    "shop.aboutPara2":
      "Turn the page to browse the collections, or use the contents on the right to jump straight to what you're looking for.",
    "shop.theAtelier": "The Atelier",
    "shop.contents": "Contents",
    "shop.theCollections": "The Collections",
    "shop.collectionNo": "Collection {n}",
    "shop.pieceOne": "1 Piece",
    "shop.pieceMany": "{count} Pieces",
    "shop.fig01": "Fig. 01",
    "shop.createOwnTitle": "Create Your Own",
    "shop.createOwnBody":
      "Upload your image and we'll bring your design to life as wearable art.",
    "shop.uploadImage": "Upload Image",
  },
  he: {
    /* ---- categories ---- */
    "shop.catAll": "הכול",
    "shop.catClothing": "ביגוד",
    "shop.catHeadwear": "כובעים",
    "shop.catFootwear": "הנעלה",
    "shop.catArtObject": "אובייקט אמנות",
    "shop.catSale": "מבצע",

    /* ---- shop landing ---- */
    "shop.eyebrow": "AAA — החנות",
    "shop.title": "החנות שלנו",
    "shop.intro":
      "AAA הוא מותג אופנה ואמנות יוקרתי, שיוצר פריטים ייחודיים בעיצוב אישי — כאלה שמדברים ייחודיות, יצירתיות וסגנון על-זמני.",
    "shop.fromWorkbook": "מתוך מחברת העבודה",
    "shop.customTitle": "לעצב משלכם",
    "shop.customBody":
      "יש לכם רעיון, סקיצה או תמונה? העלו את התמונה, והסטודיו שלנו יהפוך אותה בעבודת יד ליצירה לבישה שאין לה שנייה. כל הזמנה אישית ב-AAA נתפרת במיוחד בשבילכם.",
    "shop.customCta": "העלו תמונה",
    "shop.replyDay": "נחזור אליכם תוך יום",
    "shop.uploadRights":
      "בהעלאת התמונה אתם מאשרים שהזכויות בה שייכות לכם ושאין בה כדי לפגוע בזכויותיו של אף אחד אחר.",
    "shop.customMailSubject": "בקשה לעיצוב אישי — AAA",
    "shop.customMailBody":
      "היי! אשמח ליצור פריט אישי. הרעיון שלי: \n\n(צרפו כאן תמונה או סקיצה)",

    /* ---- shop grid: filter / sort / meta ---- */
    "shop.filterLabel": "סינון",
    "shop.sortLabel": "מיון",
    "shop.filterSortAria": "סינון ומיון",
    "shop.sortFeatured": "מומלצים",
    "shop.sortPriceAsc": "מחיר ↑",
    "shop.sortPriceDesc": "מחיר ↓",
    "shop.sortAZ": "א–ת",
    "shop.piecesHandmade": "{count} פריטים · הכול בעבודת יד",
    "shop.noTwoIdentical": "אין שתי יצירות זהות!",
    "shop.emptyTab": "עדיין אין פריטים בקטגוריה הזו.",
    "shop.comingSoon": "בקרוב",
    "shop.inStudio": "בסטודיו…",

    /* ---- cards ---- */
    "shop.openAria": "פתיחת {name}",
    "shop.openDetailsAria": "פתיחת פרטי {name}",
    "shop.viewProduct": "לצפייה במוצר",

    /* ---- product page ---- */
    "shop.backToShop": "חזרה לחנות",
    "shop.related": "אולי יעניין אתכם גם",
    "shop.fieldGarment": "פריט",
    "shop.fieldFit": "גזרה",
    "shop.fieldFabricDetail": "פרט בד",
    "shop.fieldSize": "מידה",
    "shop.fieldSizes": "מידות",
    "shop.fieldDate": "שנה",
    "shop.fieldFabric": "בד",
    "shop.fieldPrint": "הדפס",
    "shop.fieldColors": "צבעים",
    "shop.offBadge": "−{pct}% הנחה",
    "shop.listPriceNote": "ממחיר המחירון של הסטודיו",
    "shop.designedBy": "עוצב על ידי Amit Amar Art",
    "shop.careWashing": "טיפוח וכביסה",
    "shop.addToCart": "הוספה לעגלה",
    "shop.soldOut": "אזל המלאי",
    "shop.onePiece": "פריט יחיד",
    "shop.sizeGuide": "מדריך מידות",
    "shop.sizeGuideTitle": "מדריך מידות",
    "shop.sizeGuideEmpty": "פרטי המידות יתווספו בקרוב. כתבו לנו ונשמח לעזור לכם לבחור.",
    "shop.sizeCol": "מידה",
    "shop.measureCol": "מידות",
    "shop.specSheet": "דף מפרט",

    /* ---- garment values (spec sheet) ---- */
    "shop.garmentCap": "כובע",
    "shop.garmentSneaker": "נעל",
    "shop.garmentArtObject": "אובייקט אמנות",
    "shop.garmentHoodie": "קפוצ'ון",
    "shop.garmentSweatshirt": "סווטשירט",
    "shop.garmentTracksuit": "חליפת טרנינג",
    "shop.garmentBodysuit": "בגד גוף",
    "shop.garmentTee": "טי-שירט",
    "shop.garmentHalter": "הולטר",
    "shop.garmentCami": "גופיית קמיסול",
    "shop.garmentSkirt": "חצאית",
    "shop.garmentPullover": "סוודר",
    "shop.garmentGarment": "פריט לבוש",

    /* ---- fit values ---- */
    "shop.fitOversized": "אוברסייז",
    "shop.fitCroppedBoxy": "קרופ מרובע",
    "shop.fitCompression": "צמוד לגוף",
    "shop.fitTrueToSize": "נאמן למידה",
    "shop.fitAdjustable": "מתכוונן",
    "shop.fitOneOfOne": "יחיד מסוגו",

    /* ---- short fabric-detail tags ---- */
    "shop.sdPrint": "הדפס",
    "shop.sdEmbroidery": "רקמה",
    "shop.sdHandPaint": "צביעה ידנית",
    "shop.sdApplique": "אפליקציה",
    "shop.sdStitch": "תפירה",
    "shop.sdWashed": "שטיפה",

    /* ---- size labels ---- */
    "shop.sizeOneSize": "מידה אחת",
    "shop.sizeOneOfOne": "יחיד מסוגו",

    /* ---- studio views ---- */
    "shop.viewFront": "חזית",
    "shop.viewBack": "גב",
    "shop.viewSideLeft": "צד · שמאל",
    "shop.viewSideRight": "צד · ימין",
    "shop.viewFabric": "בד",
    "shop.viewOf": "מבט {label}",
    "shop.toBePhotographed": "יצולם בקרוב…",
    "shop.detailZoom": "פירוט × {x}",
    "shop.productViewsAria": "מבטי המוצר",

    /* ---- collection ---- */
    "shop.collectionEyebrow": "AAA — הקולקציה",
    "shop.collectionTitle": "הקולקציה שלנו",
    "shop.collectionIntro":
      "פריטים בעבודת יד, מקובצים לפי למי ולמה הם נועדו. הקישו על כל פריט כדי לפתוח אותו.",
    "shop.albumNote": "אלבום של הכול, רצועה אחר רצועה ↓",
    "shop.backToCollection": "חזרה לקולקציה",
    "shop.shopTitle": "לצפייה — {title}",

    /* ---- book experience (flipbook chrome I own) ---- */
    "shop.madeBy": "מאת",
    "shop.enter": "כניסה",
    "shop.estHandMade": "נוסד 2026 · עבודת יד",
    "shop.handMade": "עבודת יד",
    "shop.aboutHeadline1": "אמנות ללבוש,",
    "shop.aboutHeadline2": "ייחודית כמוך.",
    "shop.aboutPara1":
      "AAA הוא בית אופנה ואמנות יוקרתי, שיוצר פריטים ייחודיים בעיצוב אישי. כל בגד וכל אובייקט מוגמרים בעבודת יד בסטודיו שלנו — נועדו לשאת ייחודיות, יצירתיות ותחושה שקטה של סגנון על-זמני.",
    "shop.aboutPara2":
      "דפדפו לעמוד הבא כדי לעיין בקולקציות, או השתמשו בתוכן העניינים שמימין כדי לקפוץ ישר למה שאתם מחפשים.",
    "shop.theAtelier": "הסטודיו",
    "shop.contents": "תוכן העניינים",
    "shop.theCollections": "הקולקציות",
    "shop.collectionNo": "קולקציה {n}",
    "shop.pieceOne": "יצירה אחת",
    "shop.pieceMany": "{count} יצירות",
    "shop.fig01": "איור 01",
    "shop.createOwnTitle": "לעצב משלכם",
    "shop.createOwnBody":
      "העלו את התמונה שלכם ואנחנו נהפוך את העיצוב שלכם לאמנות לבישה.",
    "shop.uploadImage": "העלו תמונה",
  },
};

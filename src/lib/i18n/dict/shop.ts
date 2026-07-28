import type { Lang } from "@/lib/i18n/config";

/* Shop / collection / product-page UI strings. Keys prefixed `shop.`.
 * (Product copy itself — taglines, descriptions, colours — is translated
 * separately in products-he.ts.) Filled by the shop translation pass. */

export const shop: Record<Lang, Record<string, string>> = {
  en: {
    /* ---- categories ---- */
    catAll: "All",
    catClothing: "Clothing",
    catHeadwear: "Headwear",
    catFootwear: "Footwear",
    catArtObject: "Art Object",

    /* ---- shop landing ---- */
    eyebrow: "AAA — The Shop",
    title: "Our Shop",
    intro:
      "AAA is a luxury fashion and art brand creating unique custom-designed pieces that speak individuality, creativity and timeless style.",
    fromWorkbook: "from the workbook",
    customTitle: "Create Your Own Design",
    customBody:
      "Have an idea, a sketch, a photo? Upload your image and our studio will hand-craft it into a one-of-a-kind wearable piece. Every AAA custom order is made-to-order, just for you.",
    customCta: "Upload your image",
    replyDay: "we reply within a day",
    uploadRights:
      "By uploading you confirm you own the rights to the image and that it doesn't infringe anyone else's rights.",
    customMailSubject: "Custom design request — AAA",
    customMailBody:
      "Hi! I'd like to create a custom piece. My idea: \n\n(attach your image or sketch here)",

    /* ---- shop grid: filter / sort / meta ---- */
    filterLabel: "Filter",
    sortLabel: "Sort",
    filterSortAria: "Filter and sort",
    sortFeatured: "Featured",
    sortPriceAsc: "Price ↑",
    sortPriceDesc: "Price ↓",
    sortAZ: "A–Z",
    piecesHandmade: "{count} pieces · all handmade",
    noTwoIdentical: "no two pieces identical!",
    emptyTab: "Nothing filed under this tab yet.",
    comingSoon: "Coming soon",
    inStudio: "in the studio…",

    /* ---- cards ---- */
    openAria: "Open {name}",
    openDetailsAria: "Open {name} details",
    viewProduct: "View Product",

    /* ---- product page ---- */
    backToShop: "Back to the shop",
    fieldGarment: "Garment",
    fieldFit: "Fit",
    fieldFabricDetail: "Fabric Detail",
    fieldSize: "Size",
    fieldSizes: "Sizes",
    fieldDate: "Date",
    fieldFabric: "Fabric",
    fieldPrint: "Print",
    fieldColors: "Colors",
    offBadge: "−{pct}% off",
    listPriceNote: "the studio's list price",
    designedBy: "Designed by Amit Amar Art",
    careWashing: "Care & washing",
    addToCart: "Add to Cart",
    specSheet: "Spec Sheet",

    /* ---- garment values (spec sheet) ---- */
    garmentCap: "Cap",
    garmentSneaker: "Sneaker",
    garmentArtObject: "Art Object",
    garmentHoodie: "Hoodie",
    garmentSweatshirt: "Sweatshirt",
    garmentTracksuit: "Tracksuit",
    garmentBodysuit: "Bodysuit",
    garmentTee: "T-Shirt",
    garmentHalter: "Halter",
    garmentCami: "Cami",
    garmentSkirt: "Skirt",
    garmentPullover: "Pullover",
    garmentGarment: "Garment",

    /* ---- fit values ---- */
    fitOversized: "Oversized",
    fitCroppedBoxy: "Cropped boxy",
    fitCompression: "Compression",
    fitTrueToSize: "True to size",
    fitAdjustable: "Adjustable",
    fitOneOfOne: "One of one",

    /* ---- short fabric-detail tags ---- */
    sdPrint: "Print",
    sdEmbroidery: "Embroidery",
    sdHandPaint: "Hand-paint",
    sdApplique: "Appliqué",
    sdStitch: "Stitch",
    sdWashed: "Washed",

    /* ---- size labels ---- */
    sizeOneSize: "One size",
    sizeOneOfOne: "One of one",

    /* ---- studio views ---- */
    viewFront: "Front",
    viewBack: "Back",
    viewSideLeft: "Side · L",
    viewSideRight: "Side · R",
    viewFabric: "Fabric",
    viewOf: "{label} view",
    toBePhotographed: "to be photographed…",
    detailZoom: "Detail × {x}",
    productViewsAria: "Product views",

    /* ---- collection ---- */
    collectionEyebrow: "AAA — The Collection",
    collectionTitle: "Our Collection",
    collectionIntro:
      "Hand-made pieces, grouped by who and what they're for. Tap any item to open it.",
    albumNote: "an album of everything, strip by strip ↓",
    backToCollection: "Back to the collection",
    shopTitle: "Shop {title}",

    /* ---- book experience (flipbook chrome I own) ---- */
    madeBy: "Made By",
    enter: "Enter",
    estHandMade: "Est. 2026 · Hand Made",
    handMade: "Hand Made",
    aboutHeadline1: "Wearable art,",
    aboutHeadline2: "unique as you.",
    aboutPara1:
      "AAA is a luxury fashion and art house creating one-of-a-kind, custom-designed pieces. Every garment and object is hand-finished in our studio — made to carry individuality, creativity and a quiet sense of timeless style.",
    aboutPara2:
      "Turn the page to browse the collections, or use the contents on the right to jump straight to what you're looking for.",
    theAtelier: "The Atelier",
    contents: "Contents",
    theCollections: "The Collections",
    collectionNo: "Collection {n}",
    pieceOne: "1 Piece",
    pieceMany: "{count} Pieces",
    fig01: "Fig. 01",
    createOwnTitle: "Create Your Own",
    createOwnBody:
      "Upload your image and we'll bring your design to life as wearable art.",
    uploadImage: "Upload Image",
  },
  he: {
    /* ---- categories ---- */
    catAll: "הכול",
    catClothing: "ביגוד",
    catHeadwear: "כובעים",
    catFootwear: "הנעלה",
    catArtObject: "אובייקט אמנות",

    /* ---- shop landing ---- */
    eyebrow: "AAA — החנות",
    title: "החנות שלנו",
    intro:
      "AAA הוא מותג אופנה ואמנות יוקרתי, שיוצר פריטים ייחודיים בעיצוב אישי — כאלה שמדברים ייחודיות, יצירתיות וסגנון על-זמני.",
    fromWorkbook: "מתוך מחברת העבודה",
    customTitle: "לעצב משלכם",
    customBody:
      "יש לכם רעיון, סקיצה או תמונה? העלו את התמונה, והסטודיו שלנו יהפוך אותה בעבודת יד ליצירה לבישה שאין לה שנייה. כל הזמנה אישית ב-AAA נתפרת במיוחד בשבילכם.",
    customCta: "העלו תמונה",
    replyDay: "נחזור אליכם תוך יום",
    uploadRights:
      "בהעלאת התמונה אתם מאשרים שהזכויות בה שייכות לכם ושאין בה כדי לפגוע בזכויותיו של אף אחד אחר.",
    customMailSubject: "בקשה לעיצוב אישי — AAA",
    customMailBody:
      "היי! אשמח ליצור פריט אישי. הרעיון שלי: \n\n(צרפו כאן תמונה או סקיצה)",

    /* ---- shop grid: filter / sort / meta ---- */
    filterLabel: "סינון",
    sortLabel: "מיון",
    filterSortAria: "סינון ומיון",
    sortFeatured: "מומלצים",
    sortPriceAsc: "מחיר ↑",
    sortPriceDesc: "מחיר ↓",
    sortAZ: "א–ת",
    piecesHandmade: "{count} פריטים · הכול בעבודת יד",
    noTwoIdentical: "אין שתי יצירות זהות!",
    emptyTab: "עדיין אין פריטים בקטגוריה הזו.",
    comingSoon: "בקרוב",
    inStudio: "בסטודיו…",

    /* ---- cards ---- */
    openAria: "פתיחת {name}",
    openDetailsAria: "פתיחת פרטי {name}",
    viewProduct: "לצפייה במוצר",

    /* ---- product page ---- */
    backToShop: "חזרה לחנות",
    fieldGarment: "פריט",
    fieldFit: "גזרה",
    fieldFabricDetail: "פרט בד",
    fieldSize: "מידה",
    fieldSizes: "מידות",
    fieldDate: "שנה",
    fieldFabric: "בד",
    fieldPrint: "הדפס",
    fieldColors: "צבעים",
    offBadge: "−{pct}% הנחה",
    listPriceNote: "ממחיר המחירון של הסטודיו",
    designedBy: "עוצב על ידי Amit Amar Art",
    careWashing: "טיפוח וכביסה",
    addToCart: "הוספה לעגלה",
    specSheet: "דף מפרט",

    /* ---- garment values (spec sheet) ---- */
    garmentCap: "כובע",
    garmentSneaker: "נעל",
    garmentArtObject: "אובייקט אמנות",
    garmentHoodie: "קפוצ'ון",
    garmentSweatshirt: "סווטשירט",
    garmentTracksuit: "חליפת טרנינג",
    garmentBodysuit: "בגד גוף",
    garmentTee: "טי-שירט",
    garmentHalter: "הולטר",
    garmentCami: "גופיית קמיסול",
    garmentSkirt: "חצאית",
    garmentPullover: "סוודר",
    garmentGarment: "פריט לבוש",

    /* ---- fit values ---- */
    fitOversized: "אוברסייז",
    fitCroppedBoxy: "קרופ מרובע",
    fitCompression: "צמוד לגוף",
    fitTrueToSize: "נאמן למידה",
    fitAdjustable: "מתכוונן",
    fitOneOfOne: "יחיד מסוגו",

    /* ---- short fabric-detail tags ---- */
    sdPrint: "הדפס",
    sdEmbroidery: "רקמה",
    sdHandPaint: "צביעה ידנית",
    sdApplique: "אפליקציה",
    sdStitch: "תפירה",
    sdWashed: "שטיפה",

    /* ---- size labels ---- */
    sizeOneSize: "מידה אחת",
    sizeOneOfOne: "יחיד מסוגו",

    /* ---- studio views ---- */
    viewFront: "חזית",
    viewBack: "גב",
    viewSideLeft: "צד · שמאל",
    viewSideRight: "צד · ימין",
    viewFabric: "בד",
    viewOf: "מבט {label}",
    toBePhotographed: "יצולם בקרוב…",
    detailZoom: "פירוט × {x}",
    productViewsAria: "מבטי המוצר",

    /* ---- collection ---- */
    collectionEyebrow: "AAA — הקולקציה",
    collectionTitle: "הקולקציה שלנו",
    collectionIntro:
      "פריטים בעבודת יד, מקובצים לפי למי ולמה הם נועדו. הקישו על כל פריט כדי לפתוח אותו.",
    albumNote: "אלבום של הכול, רצועה אחר רצועה ↓",
    backToCollection: "חזרה לקולקציה",
    shopTitle: "לצפייה — {title}",

    /* ---- book experience (flipbook chrome I own) ---- */
    madeBy: "מאת",
    enter: "כניסה",
    estHandMade: "נוסד 2026 · עבודת יד",
    handMade: "עבודת יד",
    aboutHeadline1: "אמנות ללבוש,",
    aboutHeadline2: "ייחודית כמוך.",
    aboutPara1:
      "AAA הוא בית אופנה ואמנות יוקרתי, שיוצר פריטים ייחודיים בעיצוב אישי. כל בגד וכל אובייקט מוגמרים בעבודת יד בסטודיו שלנו — נועדו לשאת ייחודיות, יצירתיות ותחושה שקטה של סגנון על-זמני.",
    aboutPara2:
      "דפדפו לעמוד הבא כדי לעיין בקולקציות, או השתמשו בתוכן העניינים שמימין כדי לקפוץ ישר למה שאתם מחפשים.",
    theAtelier: "הסטודיו",
    contents: "תוכן העניינים",
    theCollections: "הקולקציות",
    collectionNo: "קולקציה {n}",
    pieceOne: "יצירה אחת",
    pieceMany: "{count} יצירות",
    fig01: "איור 01",
    createOwnTitle: "לעצב משלכם",
    createOwnBody:
      "העלו את התמונה שלכם ואנחנו נהפוך את העיצוב שלכם לאמנות לבישה.",
    uploadImage: "העלו תמונה",
  },
};

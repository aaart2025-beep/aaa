import type { Lang } from "@/lib/i18n/config";

/* Legal / policy pages: returns, shipping, care, privacy, terms, accessibility
 * + the policy dialog. Keys prefixed `policies.`. Both languages carry every
 * key. English is authored from the original prose; Hebrew is professional
 * legal/policy register for an Israeli e-commerce store. */

export const policies: Record<Lang, Record<string, string>> = {
  en: {
    // Shared page chrome
    "policies.backToShop": "Back to the shop",
    "policies.close": "Close",
    "policies.legalNote":
      "This policy is available in English and Hebrew. In the event of any conflict, the English version prevails. For questions, contact us using the details in the footer.",
    "policies.disclaimer.legalDraft":
      "Plain-language draft prepared as general guidance — please have a licensed attorney confirm it for your jurisdiction before you rely on it.",
    "policies.disclaimer.shippingDefaults":
      "The processing times and regions below are conservative defaults — update them to match your real fulfilment before launch.",

    // Returns
    "policies.returns.title": "Return, Exchange & Cancellation Policy",
    "policies.returns.metaDescription":
      "How AAA handles returns, exchanges and cancellations for handmade, made-to-order pieces.",
    "policies.returns.intro":
      "At AAA, every product is carefully designed, sewn, and finished by hand. Our products are handcrafted with great attention to detail, making each piece unique. Due to the nature of handmade craftsmanship, our return, exchange, and cancellation policy is as follows.",
    "policies.returns.handmade.h": "Handmade Products",
    "policies.returns.handmade.p":
      "Each product is individually handcrafted. As a result, slight variations in color, texture, stitching, finishing, proportions, and decorative details may occur. These natural variations are part of the handmade process and are not considered defects.",
    "policies.returns.custom.h": "Custom & Personalized Orders",
    "policies.returns.custom.p1":
      "When placing a custom order or requesting a product based on an existing design, we make every effort to recreate the original as accurately as possible.",
    "policies.returns.custom.p2":
      "However, because every item is handmade, we cannot guarantee that the final product will be identical to the original sample or reference image. Minor differences in color, stitching, proportions, finishing, placement of design elements, and other handcrafted details may occur.",
    "policies.returns.custom.p3":
      "By placing a custom order, the customer acknowledges and accepts that these variations are an inherent part of handmade craftsmanship and do not constitute a defect or grounds for cancellation, return, exchange, or refund.",
    "policies.returns.cancel.h": "Order Cancellation",
    "policies.returns.cancel.li1":
      "Orders may be canceled only before the production, sewing, or customization process has begun.",
    "policies.returns.cancel.li2":
      "Once production has started, the order cannot be canceled and is not eligible for a refund.",
    "policies.returns.exchanges.h": "Returns & Exchanges",
    "policies.returns.exchanges.p1":
      "Returns or exchanges will only be considered in the following cases:",
    "policies.returns.exchanges.li1": "The product has a significant manufacturing defect.",
    "policies.returns.exchanges.li2":
      "The customer received an incorrect item due to an error by AAA.",
    "policies.returns.exchanges.li3":
      "The product differs substantially from the confirmed order due to an error made by AAA.",
    "policies.returns.window":
      "Any request must be submitted within 48 hours of receiving the order, accompanied by clear photographs of the product and the reported issue.",
    "policies.returns.notDefect.h": "What Is Not Considered a Defect",
    "policies.returns.notDefect.p1": "The following are not considered manufacturing defects:",
    "policies.returns.notDefect.li1": "Minor variations in color, texture, or finish.",
    "policies.returns.notDefect.li2": "Slight differences in stitching or handcrafted details.",
    "policies.returns.notDefect.li3":
      "Natural variations resulting from the handmade production process.",
    "policies.returns.notDefect.li4":
      "Minor differences between a custom-made product and its reference image or previous version.",
    "policies.returns.notDefect.li5": "Normal wear and tear from regular use.",
    "policies.returns.notDefect.li6":
      "Damage caused by improper care, washing, ironing, or handling contrary to the product care instructions.",
    "policies.returns.refunds.h": "Refunds",
    "policies.returns.refunds.p1":
      "If AAA determines that a manufacturing defect exists, we may, at our sole discretion, provide one of the following remedies:",
    "policies.returns.refunds.li1": "Repair of the product.",
    "policies.returns.refunds.li2": "Replacement of the product.",
    "policies.returns.refunds.li3": "Store credit.",
    "policies.returns.refunds.li4": "Refund, where applicable and required.",
    "policies.returns.shippingCosts.h": "Shipping Costs",
    "policies.returns.shippingCosts.p1":
      "If a return or exchange is approved due to a manufacturing defect or an error by AAA, the shipping costs will be covered by AAA.",
    "policies.returns.shippingCosts.p2":
      "In all other cases, shipping costs are the responsibility of the customer.",
    "policies.returns.unique.h": "Product Uniqueness",
    "policies.returns.unique.p1":
      "Every AAA product is an original handcrafted creation. Even when a customer orders a product based on an existing design, an identical replica cannot be guaranteed. Small differences are a natural result of the handmade design, sewing, and finishing process. These variations reflect the authenticity and uniqueness of each piece and shall not be considered defects or grounds for return, exchange, cancellation, or refund.",

    // Care
    "policies.care.title": "Product Care & Washing Instructions",
    "policies.care.metaDescription":
      "How to wash and care for your handmade AAA pieces so they last.",
    "policies.care.intro":
      "At AAA, every product is carefully handmade, sewn, designed, and finished by hand. To preserve the quality of the fabric, stitching, artwork, finishes, and overall craftsmanship, please follow the care instructions below.",
    "policies.care.general.h": "General Care Instructions",
    "policies.care.general.li1": "Hand wash only in lukewarm water (up to 30°C / 86°F).",
    "policies.care.general.li2":
      "Do not use a washing machine, unless the product label or product page explicitly states that machine washing is permitted.",
    "policies.care.general.li3": "Do not tumble dry.",
    "policies.care.general.li4": "Do not use bleach, chlorine, or harsh stain removers.",
    "policies.care.general.li5": "Use only a mild detergent.",
    "policies.care.general.li6": "Do not soak the product for extended periods.",
    "policies.care.general.li7": "Air dry naturally in the shade, away from direct sunlight.",
    "policies.care.general.li8": "Do not use a regular iron under any circumstances.",
    "policies.care.general.li9":
      "If wrinkle removal is necessary, use a vertical garment steamer only, on a low heat setting, keeping a minimum distance of 10 cm (4 inches) from the product. Avoid direct contact with the fabric, stitching, artwork, or any decorative elements.",
    "policies.care.handmade.h": "Handmade Products",
    "policies.care.handmade.p":
      "Every AAA product is handmade, sewn, and individually finished. Due to the nature of handcrafted production, slight variations in color, texture, stitching, finishing, and design details may occur. These variations are a natural part of the handmade process and are not considered defects.",
    "policies.care.disclaimer.h": "Care Disclaimer",
    "policies.care.disclaimer.p1":
      "The warranty does not cover damage resulting from failure to follow these care instructions, including but not limited to:",
    "policies.care.disclaimer.li1": "Using a washing machine when it is not explicitly permitted.",
    "policies.care.disclaimer.li2": "Using a tumble dryer.",
    "policies.care.disclaimer.li3": "Using a regular iron.",
    "policies.care.disclaimer.li4":
      "Using a garment steamer other than a vertical steamer or using excessive heat.",
    "policies.care.disclaimer.li5": "Allowing direct contact between the steamer and the product.",
    "policies.care.disclaimer.li6": "Using unsuitable cleaning agents.",
    "policies.care.disclaimer.li7": "Washing at temperatures higher than recommended.",
    "policies.care.disclaimer.li8":
      "Any cleaning or handling that does not comply with the care instructions provided.",
    "policies.care.damage":
      "Damage caused by improper care or handling is the customer's responsibility and is not eligible for repair, replacement, exchange, store credit, or refund.",
    "policies.care.specific.h": "Product-Specific Care Instructions",
    "policies.care.specific.p":
      "If a specific product includes different care instructions on its label or product page, those instructions shall take precedence over these general care guidelines.",

    // Privacy
    "policies.privacy.title": "Privacy Policy",
    "policies.privacy.metaDescription":
      "What personal information AAA collects, how it is used, and your choices.",
    "policies.privacy.intro":
      "This policy explains what personal information AAA (Amit Amar Art) collects when you visit our site or place an order, how we use it, and the choices you have. Effective date: 7 July 2026.",
    "policies.privacy.who.h": "Who We Are",
    "policies.privacy.who.p":
      "AAA is an independent studio run by Amit Amar. You can reach us using the email and WhatsApp number listed in the footer of this site. AAA (Amit Amar Art) is the controller of the personal information described here, and will provide full business and registration details on request.",
    "policies.privacy.collect.h": "Information We Collect",
    "policies.privacy.collect.p1":
      "We only collect what we need to take and fulfil your order and to reply to you:",
    "policies.privacy.collect.li1":
      "Contact details you enter — your name, email address, and phone/WhatsApp number.",
    "policies.privacy.collect.li2": "Your shipping address, and any note you add to an order.",
    "policies.privacy.collect.li3":
      "Order details — the items, sizes, colours, and custom-design choices you make.",
    "policies.privacy.collect.li4":
      "Any images, sketches, or text you send us for a custom or commissioned piece.",
    "policies.privacy.collect.li5":
      "Basic technical data your browser sends (e.g. IP address) needed to serve the site securely.",
    "policies.privacy.payment.h": "Payment Information",
    "policies.privacy.payment.p":
      "Card payments are processed by Stripe on their secure, hosted checkout. We never see or store your full card number, CVV, or full card details on our systems — Stripe handles that as the payment processor. See Stripe's privacy policy for how they handle payment data.",
    "policies.privacy.use.h": "How We Use Your Information",
    "policies.privacy.use.li1":
      "To process, produce, and ship your order and provide customer support.",
    "policies.privacy.use.li2": "To communicate with you about your order or custom request.",
    "policies.privacy.use.li3": "To comply with legal, tax, and accounting obligations.",
    "policies.privacy.use.li4":
      "Only if you opt in: to send occasional studio updates. You can unsubscribe at any time.",
    "policies.privacy.legalBases.h": "Legal Bases (EU/UK visitors)",
    "policies.privacy.legalBases.p":
      "Where the GDPR or UK GDPR applies, we rely on: performance of our contract with you (to fulfil orders), your consent (for marketing emails), and our legitimate interests (to run and secure the studio and site).",
    "policies.privacy.share.h": "Who We Share It With",
    "policies.privacy.share.p1":
      "We do not sell your personal information. We share it only with service providers that help us run the store, and only as needed:",
    "policies.privacy.share.li1": "Stripe — to take payment.",
    "policies.privacy.share.li2": "Shipping/delivery carriers — to deliver your order.",
    "policies.privacy.share.li3":
      "Our hosting and email providers — to operate the site and reply to you.",
    "policies.privacy.share.li4": "Authorities — where required by law.",
    "policies.privacy.transfers.h": "International Transfers",
    "policies.privacy.transfers.p":
      "We ship internationally and use service providers that may store or process data outside your country, including outside the EU/UK. Where required, we rely on appropriate safeguards for such transfers, such as the standard contractual clauses.",
    "policies.privacy.retention.h": "How Long We Keep It",
    "policies.privacy.retention.p":
      "We keep order and contact information for as long as needed to fulfil your order and to meet tax, accounting, and legal requirements, then delete or anonymise it. You can ask us to delete information we are not legally required to keep.",
    "policies.privacy.rights.h": "Your Rights",
    "policies.privacy.rights.p1":
      "Depending on where you live (including under the GDPR/UK GDPR and California's CCPA/CPRA), you may have the right to:",
    "policies.privacy.rights.li1": "Access the personal information we hold about you.",
    "policies.privacy.rights.li2": "Correct or update it.",
    "policies.privacy.rights.li3": "Ask us to delete it.",
    "policies.privacy.rights.li4":
      "Object to or restrict certain processing, and withdraw consent to marketing at any time.",
    "policies.privacy.rights.li5":
      "We do not sell or “share” personal information for cross-context behavioural advertising.",
    "policies.privacy.request":
      "To make a request, contact us through the channels in the footer. We will respond within the time required by law.",
    "policies.privacy.cookies.h": "Cookies & Tracking",
    "policies.privacy.cookies.p":
      "We use only essential cookies needed for the site and the admin login to work. We do not currently use third-party analytics or advertising trackers. If we add analytics or marketing pixels in the future, we will update this policy and add a cookie-consent banner where required.",
    "policies.privacy.children.h": "Children",
    "policies.privacy.children.p":
      "Our site is not directed to children, and we do not knowingly collect personal information from children. If you are under 16, please do not send us personal information without the consent of a parent or guardian.",
    "policies.privacy.changes.h": "Changes",
    "policies.privacy.changes.p":
      "We may update this policy from time to time. The effective date above shows when it was last changed.",

    // Terms
    "policies.terms.title": "Terms of Sale",
    "policies.terms.metaDescription":
      "The terms that govern purchases and custom orders from AAA.",
    "policies.terms.intro":
      "These Terms of Sale govern your purchase of products from AAA (Amit Amar Art). By placing an order you agree to these terms together with our Return, Shipping, and Privacy policies. Effective date: 7 July 2026.",
    "policies.terms.handmade.h": "Our Products Are Handmade",
    "policies.terms.handmade.p":
      "Every AAA piece is designed and finished by hand, and many are made to order. Colours, textures, placement, and exact appearance may vary from the photographs and on-screen 3D renders you see when ordering. Each piece is unique, and these natural variations are part of the craft — not defects.",
    "policies.terms.prices.h": "Prices & Payment",
    "policies.terms.prices.p":
      "Prices are shown in the currency displayed at checkout and may change at any time before you order. We take payment through Stripe's secure checkout. If a price is obviously wrong due to a technical error, we may cancel the order and refund you rather than honour the mistake. Where applicable, sales tax or VAT is shown or added at checkout; any import duties or local taxes on international orders are your responsibility (see the Shipping Policy).",
    "policies.terms.custom.h": "Custom & Made-to-Order Pieces",
    "policies.terms.custom.p1":
      "When you design a piece in our studio tool or commission a custom item:",
    "policies.terms.custom.li1":
      "We make every effort to match your request, but because each item is handmade an identical result cannot be guaranteed.",
    "policies.terms.custom.li2":
      "Custom and personalised pieces are made specifically for you and are final sale — they cannot be cancelled once production has begun, and are not eligible for return, exchange, or refund except for a genuine manufacturing defect or our error (see the Return Policy).",
    "policies.terms.content.h": "Content You Submit (Custom Orders)",
    "policies.terms.content.p1":
      "If you upload or send us any image, artwork, logo, name, or text to be applied to a product, you confirm and agree that:",
    "policies.terms.content.li1":
      "You own that content or have all rights and permissions needed to use it, and it does not infringe anyone's copyright, trademark, publicity, or other rights.",
    "policies.terms.content.li2": "It is not unlawful, hateful, or otherwise objectionable.",
    "policies.terms.content.li3":
      "You grant AAA a licence to use and reproduce that content solely to produce your order.",
    "policies.terms.content.li4":
      "You are responsible for the content you submit, and you agree to indemnify and hold AAA harmless from any third-party claim, loss, or expense (including reasonable legal fees) arising out of that content or your breach of these terms.",
    "policies.terms.content.li5":
      "AAA may decline or cancel any custom order that we believe infringes rights or violates this policy.",
    "policies.terms.trademarks.h": "Third-Party Trademarks",
    "policies.terms.trademarks.p":
      "Some product names and descriptions reference third-party brands, teams, characters, or designs for identification only. All such trademarks and copyrights are the property of their respective owners. AAA is an independent studio and is not affiliated with, sponsored by, or endorsed by any of them. Where footwear is customised, it is hand-finished on lawfully acquired blank products.",
    "policies.terms.ip.h": "Intellectual Property",
    "policies.terms.ip.p":
      "The AAA name, logo, site content, photographs, and original designs are owned by AAA and may not be copied or used without permission.",
    "policies.terms.dmca.h": "IP Complaints / DMCA",
    "policies.terms.dmca.p":
      "If you believe content on our site infringes your intellectual property, contact us through the channels in the footer with details of the work and the material in question, and we will review and act appropriately. We will remove or disable access to material shown to infringe, and may cancel any related order.",
    "policies.terms.liability.h": "Disclaimers & Limitation of Liability",
    "policies.terms.liability.p":
      "To the fullest extent permitted by law, products and this site are provided “as is”. Nothing in these terms limits rights you have under mandatory consumer-protection law. To the extent the law allows, AAA is not liable for indirect, incidental, or consequential loss, and our total liability in connection with any order is limited to the amount you paid for that order.",
    "policies.terms.law.h": "Governing Law",
    "policies.terms.law.p":
      "These terms are governed by the laws of the State of Israel, and any dispute will be handled by the competent courts of Israel. If you are a consumer elsewhere, you keep the benefit of any mandatory consumer protections of your country of residence.",
    "policies.terms.changes.h": "Changes",
    "policies.terms.changes.p":
      "We may update these terms from time to time; the version in effect when you order applies to that order.",

    // Shipping
    "policies.shipping.title": "Shipping Policy",
    "policies.shipping.metaDescription":
      "Processing times, delivery, and customs for handmade and made-to-order AAA pieces.",
    "policies.shipping.intro":
      "Because our pieces are handmade and often made to order, please allow production time before shipping. Effective date: 7 July 2026.",
    "policies.shipping.processing.h": "Processing Time",
    "policies.shipping.processing.p":
      "Ready-to-ship pieces are usually dispatched within 2-5 business days. Made-to-order and custom pieces require production time, typically 1-4 weeks, which we will confirm with you. If we cannot ship within the time stated, we will let you know and offer you the choice to wait or receive a refund.",
    "policies.shipping.where.h": "Where We Ship",
    "policies.shipping.where.p":
      "We ship within Israel and internationally. Shipping options and costs are shown at checkout before you pay.",
    "policies.shipping.estimates.h": "Delivery Estimates",
    "policies.shipping.estimates.p":
      "Delivery times are estimates provided by the carrier and are not guaranteed. Once your order ships we will share tracking where available.",
    "policies.shipping.customs.h": "Customs, Duties & Taxes",
    "policies.shipping.customs.p":
      "For international orders, any import duties, taxes, or customs fees charged by the destination country are the responsibility of the recipient and are not included in the product or shipping price.",
    "policies.shipping.lost.h": "Lost or Delayed Shipments",
    "policies.shipping.lost.p":
      "If your order is significantly delayed or appears lost, contact us through the footer and we will help trace it with the carrier.",

    // Accessibility
    "policies.accessibility.title": "Accessibility Statement",
    "policies.accessibility.metaDescription":
      "AAA's commitment to an accessible site, what we've done, and how to report a barrier.",
    "policies.accessibility.intro":
      "AAA wants everyone to be able to browse and shop our site. We are working to meet the Web Content Accessibility Guidelines (WCAG) 2.1 / 2.2 Level AA, and we treat accessibility as ongoing work rather than a one-time task.",
    "policies.accessibility.done.h": "What We've Done",
    "policies.accessibility.done.li1":
      "A built-in accessibility control (bottom-right of every page) to enlarge text, turn on high contrast, and reduce motion. Your choices are remembered.",
    "policies.accessibility.done.li2":
      "Text and background colours checked for readable contrast.",
    "policies.accessibility.done.li3":
      "Keyboard support with a visible focus outline, and a “skip to content” link.",
    "policies.accessibility.done.li4":
      "Alternative text on product images and labels on form fields.",
    "policies.accessibility.done.li5":
      "Respect for your device's “reduce motion” setting for animations.",
    "policies.accessibility.done.li6":
      "Semantic page structure and landmarks for screen readers.",
    "policies.accessibility.limitations.h": "Known Limitations",
    "policies.accessibility.limitations.p":
      "Some rich, interactive parts — the 3D custom-design studio and the animated “book” experience — may be difficult to use with a screen reader or by keyboard alone. If any part of the site is getting in your way, we will gladly help you browse, choose, or place an order another way.",
    "policies.accessibility.tell.h": "Tell Us",
    "policies.accessibility.tell.p":
      "If you run into a barrier or have a suggestion, contact us using the email or WhatsApp in the footer and tell us the page and the problem. We aim to respond within 5 business days and to fix issues as quickly as we can.",
    "policies.accessibility.reviewed": "Last reviewed: 7 July 2026.",
  },

  he: {
    // Shared page chrome
    "policies.backToShop": "חזרה לחנות",
    "policies.close": "סגירה",
    "policies.legalNote":
      "מדיניות זו זמינה בעברית ובאנגלית. בכל מקרה של סתירה, הגרסה האנגלית היא המחייבת. לשאלות ניתן לפנות אלינו באמצעות פרטי הקשר שבתחתית האתר.",
    "policies.disclaimer.legalDraft":
      "טיוטה בשפה פשוטה שהוכנה כהנחיה כללית — מומלץ להיוועץ בעורך דין מוסמך לאימותה בהתאם לתחום השיפוט הרלוונטי בטרם הסתמכות עליה.",
    "policies.disclaimer.shippingDefaults":
      "זמני ההכנה והאזורים המפורטים להלן הם ברירות מחדל שמרניות — יש לעדכנם כך שיתאימו לתהליך האספקה בפועל טרם ההשקה.",

    // Returns
    "policies.returns.title": "מדיניות החזרות, החלפות וביטולים",
    "policies.returns.metaDescription":
      "כיצד AAA מטפל בהחזרות, בהחלפות ובביטולים עבור פריטים בעבודת יד המיוצרים לפי הזמנה.",
    "policies.returns.intro":
      "ב-AAA כל מוצר מיוצר, נתפר, מעוצב ומסיים בעבודת יד, תוך הקפדה על איכות גבוהה וייחודיות בכל פריט. בשל אופיו הייחודי של תהליך היצירה, כל מוצר הוא יחיד במינו, ולכן מדיניות ההחזרות וההחלפות שלנו מפורטת להלן.",
    "policies.returns.handmade.h": "מוצרים בעבודת יד",
    "policies.returns.handmade.p":
      "כל מוצר מיוצר בעבודת יד, ולכן ייתכנו הבדלים קלים בין מוצר למוצר, לרבות בגוונים, במרקם, במיקום אלמנטים עיצוביים, בגימורים, בתפירה ובפרטים הקטנים. הבדלים אלו הם חלק טבעי מתהליך היצירה ואינם מהווים פגם.",
    "policies.returns.custom.h": "הזמנות בהתאמה אישית",
    "policies.returns.custom.p1":
      "בעת הזמנת מוצר בהתאמה אישית או בקשה לשחזור מוצר קיים, אנו עושים כל מאמץ ליצור מוצר הדומה ככל האפשר לדוגמה או לתמונה שסופקה.",
    "policies.returns.custom.p2":
      "עם זאת, מאחר שכל מוצר מיוצר בעבודת יד, לא ניתן להתחייב כי המוצר יהיה זהה לחלוטין למקור. ייתכנו שינויים קלים בפרופורציות, בגוונים, במיקום האלמנטים, בתפירה, בגימורים ובפרטים נוספים, וזאת כחלק מאופייה של עבודת יד.",
    "policies.returns.custom.p3":
      "הלקוח מאשר ומבין כי שונות קלה זו היא חלק בלתי נפרד מהמוצר ואינה מהווה פגם או עילה להחזרה, החלפה או ביטול עסקה.",
    "policies.returns.cancel.h": "ביטול הזמנה",
    "policies.returns.cancel.li1":
      "ניתן לבטל הזמנה כל עוד לא החל תהליך הייצור, התפירה או העיצוב.",
    "policies.returns.cancel.li2":
      "לאחר תחילת העבודה על המוצר, לא ניתן לבטל את ההזמנה או לקבל החזר כספי.",
    "policies.returns.exchanges.h": "החזרות והחלפות",
    "policies.returns.exchanges.p1": "ניתן להגיש בקשה להחזרה או החלפה רק במקרים הבאים:",
    "policies.returns.exchanges.li1": "התקבל מוצר עם פגם מהותי בייצור.",
    "policies.returns.exchanges.li2": "התקבל מוצר שגוי עקב טעות של AAA.",
    "policies.returns.exchanges.li3":
      "התקבל מוצר השונה באופן מהותי מההזמנה שאושרה עקב טעות של AAA.",
    "policies.returns.window":
      "יש לפנות אלינו בתוך 48 שעות ממועד קבלת המוצר, בצירוף תמונות ברורות של המוצר והבעיה.",
    "policies.returns.notDefect.h": "מקרים שאינם נחשבים כפגם",
    "policies.returns.notDefect.p1": "לא ייחשבו כפגם ייצור, בין היתר:",
    "policies.returns.notDefect.li1": "הבדלים קלים בגוון, במרקם או בגימור.",
    "policies.returns.notDefect.li2":
      "הבדלים קלים בתפירה או בפרטים הנובעים מעבודת יד.",
    "policies.returns.notDefect.li3": "סימנים טבעיים הנוצרים במהלך תהליך הייצור בעבודת יד.",
    "policies.returns.notDefect.li4":
      "שינויים קלים בין מוצר שהוזמן בהתאמה אישית לבין תמונת ההמחשה או הגרסה הקודמת.",
    "policies.returns.notDefect.li5": "בלאי טבעי משימוש רגיל.",
    "policies.returns.notDefect.li6":
      "נזק שנגרם עקב שימוש, כביסה, גיהוץ או טיפול שלא בהתאם להוראות הטיפול במוצר.",
    "policies.returns.refunds.h": "החזר כספי",
    "policies.returns.refunds.p1":
      "במידה ונמצא כי קיים פגם ייצור שבאחריות AAA, לפי שיקול דעתנו הבלעדי יינתן אחד מהפתרונות הבאים:",
    "policies.returns.refunds.li1": "תיקון המוצר.",
    "policies.returns.refunds.li2": "החלפת המוצר.",
    "policies.returns.refunds.li3": "זיכוי לחנות.",
    "policies.returns.refunds.li4": "החזר כספי, בהתאם לנסיבות המקרה ולהוראות הדין.",
    "policies.returns.shippingCosts.h": "עלויות משלוח",
    "policies.returns.shippingCosts.p1":
      "אם ההחזרה או ההחלפה אושרה עקב פגם ייצור או טעות מצד AAA, עלויות המשלוח יחולו על AAA.",
    "policies.returns.shippingCosts.p2":
      "בכל מקרה אחר, עלויות המשלוח יחולו על הלקוח.",
    "policies.returns.unique.h": "ייחודיות המוצר",
    "policies.returns.unique.p1":
      "כל מוצר של AAA הוא יצירה מקורית בעבודת יד. גם כאשר לקוח מזמין מוצר על בסיס עיצוב קיים, אין אפשרות ליצור העתק זהה לחלוטין. הבדלים קטנים הם תוצאה טבעית של תהליך העיצוב, התפירה והגימור הידני. שונות זו משקפת את האותנטיות והייחודיות של כל פריט ואינה מהווה פגם או עילה להחזרה, החלפה, ביטול או החזר כספי.",

    // Care
    "policies.care.title": "הוראות טיפול וכביסה במוצר",
    "policies.care.metaDescription":
      "כיצד לכבס ולטפל בפריטי AAA בעבודת יד כדי שיישמרו לאורך זמן.",
    "policies.care.intro":
      "ב-AAA כל מוצר מיוצר, נתפר, מעוצב ומסיים בעבודת יד. על מנת לשמור על איכות הבד, התפירה, הציור, הגימורים והעיצוב לאורך זמן, יש להקפיד על הוראות הטיפול שלהלן.",
    "policies.care.general.h": "הוראות כלליות",
    "policies.care.general.li1": "יש לכבס את המוצר ביד בלבד, במים פושרים (עד 30°C).",
    "policies.care.general.li2":
      "אין להשתמש במכונת כביסה, אלא אם צוין במפורש על גבי תווית המוצר או בדף המוצר באתר כי ניתן לכבסו במכונה.",
    "policies.care.general.li3": "אין להשתמש במייבש כביסה.",
    "policies.care.general.li4": "אין להשתמש בחומרי הלבנה, כלור או מסירי כתמים חזקים.",
    "policies.care.general.li5": "יש להשתמש בחומר ניקוי עדין בלבד.",
    "policies.care.general.li6": "אין להשרות את המוצר למשך זמן ממושך.",
    "policies.care.general.li7": "יש לייבש באופן טבעי, בצל, ללא חשיפה ישירה לשמש.",
    "policies.care.general.li8": "אין להשתמש במגהץ רגיל בשום אופן.",
    "policies.care.general.li9":
      "במידת הצורך להסרת קמטים, יש להשתמש במגהץ אדים אנכי בלבד, בעוצמת חום נמוכה, תוך שמירה על מרחק של לפחות 10 ס״מ מהמוצר. יש להימנע ממגע ישיר בבד, בתפרים, בציורים או בכל אלמנט עיצובי.",
    "policies.care.handmade.h": "מוצרים בעבודת יד",
    "policies.care.handmade.p":
      "כל מוצר של AAA מיוצר, נתפר ומעוצב בעבודת יד. בשל אופיו הייחודי של תהליך הייצור, ייתכנו הבדלים קלים בגוון, במרקם, בתפירה, בגימורים ובפרטים העיצוביים. הבדלים אלו הם חלק טבעי מתהליך העבודה ואינם מהווים פגם במוצר.",
    "policies.care.disclaimer.h": "הסתייגות בנוגע לטיפול",
    "policies.care.disclaimer.p1":
      "האחריות אינה חלה על נזקים שנגרמו כתוצאה מאי-עמידה בהוראות הטיפול, לרבות אך לא רק:",
    "policies.care.disclaimer.li1": "שימוש במכונת כביסה כאשר לא צוין במפורש שהדבר מותר.",
    "policies.care.disclaimer.li2": "שימוש במייבש כביסה.",
    "policies.care.disclaimer.li3": "שימוש במגהץ רגיל.",
    "policies.care.disclaimer.li4":
      "שימוש במגהץ אדים שאינו אנכי או הפעלתו בעוצמת חום גבוהה.",
    "policies.care.disclaimer.li5": "מגע ישיר של מגהץ האדים עם המוצר.",
    "policies.care.disclaimer.li6": "שימוש בחומרי ניקוי שאינם מתאימים.",
    "policies.care.disclaimer.li7": "כביסה בטמפרטורה גבוהה מהמומלץ.",
    "policies.care.disclaimer.li8":
      "כל טיפול או ניקוי שאינו בהתאם להוראות הטיפול המפורטות.",
    "policies.care.damage":
      "נזק שנגרם עקב טיפול או שימוש לא נכון הוא באחריות הלקוח ואינו מזכה בתיקון, החלפה, זיכוי או החזר כספי.",
    "policies.care.specific.h": "הוראות טיפול הייחודיות למוצר",
    "policies.care.specific.p":
      "אם למוצר מסוים מצורפות הוראות טיפול שונות על גבי תווית המוצר או בדף המוצר באתר, הוראות אלו יגברו על ההוראות הכלליות המפורטות כאן.",

    // Privacy
    "policies.privacy.title": "מדיניות פרטיות",
    "policies.privacy.metaDescription":
      "איזה מידע אישי AAA אוסף, כיצד נעשה בו שימוש ומהן האפשרויות שלכם.",
    "policies.privacy.intro":
      "מדיניות זו מסבירה איזה מידע אישי AAA (Amit Amar Art) אוסף כאשר אתם מבקרים באתר או מבצעים הזמנה, כיצד אנו עושים בו שימוש ואילו אפשרויות עומדות לרשותכם. תאריך תחילה: 7 ביולי 2026.",
    "policies.privacy.who.h": "מי אנחנו",
    "policies.privacy.who.p":
      "AAA הוא סטודיו עצמאי המנוהל על ידי עמית עמר. ניתן ליצור עמנו קשר באמצעות כתובת הדוא״ל ומספר הוואטסאפ המופיעים בתחתית האתר. AAA (Amit Amar Art) הוא הגורם האחראי (Controller) על המידע האישי המתואר במדיניות זו, וימסור פרטי עסק ורישום מלאים לפי בקשה.",
    "policies.privacy.collect.h": "המידע שאנו אוספים",
    "policies.privacy.collect.p1":
      "אנו אוספים אך ורק את המידע הדרוש לקבלת ההזמנה, לביצועה ולמתן מענה לפנייתכם:",
    "policies.privacy.collect.li1":
      "פרטי קשר שאתם מזינים — שם, כתובת דוא״ל ומספר טלפון/וואטסאפ.",
    "policies.privacy.collect.li2": "כתובת המשלוח וכל הערה שתוסיפו להזמנה.",
    "policies.privacy.collect.li3":
      "פרטי ההזמנה — הפריטים, המידות, הצבעים ובחירות העיצוב האישי שביצעתם.",
    "policies.privacy.collect.li4":
      "תמונות, סקיצות או טקסטים שתשלחו אלינו עבור פריט בהתאמה אישית או בהזמנה מיוחדת.",
    "policies.privacy.collect.li5":
      "נתונים טכניים בסיסיים שהדפדפן שלכם שולח (כגון כתובת IP), הדרושים לאספקת האתר באופן מאובטח.",
    "policies.privacy.payment.h": "פרטי תשלום",
    "policies.privacy.payment.p":
      "תשלומים בכרטיס אשראי מעובדים באמצעות Stripe בעמוד תשלום מאובטח המתארח אצלה. אנו לעולם איננו רואים או שומרים במערכותינו את מספר הכרטיס המלא, את קוד ה-CVV או את פרטי הכרטיס המלאים — Stripe מטפלת בכך כמעבדת התשלומים. לפרטים על אופן הטיפול בנתוני התשלום, ראו את מדיניות הפרטיות של Stripe.",
    "policies.privacy.use.h": "כיצד אנו משתמשים במידע",
    "policies.privacy.use.li1":
      "לצורך עיבוד ההזמנה, ייצורה ומשלוחה ומתן שירות לקוחות.",
    "policies.privacy.use.li2":
      "לצורך יצירת קשר עמכם בנוגע להזמנה או לבקשה בהתאמה אישית.",
    "policies.privacy.use.li3": "לצורך עמידה בחובות חוקיות, מיסויות וחשבונאיות.",
    "policies.privacy.use.li4":
      "רק אם בחרתם להצטרף: לשליחת עדכונים מזדמנים מהסטודיו. ניתן להסיר את ההרשמה בכל עת.",
    "policies.privacy.legalBases.h": "בסיס חוקי (מבקרים מהאיחוד האירופי/בריטניה)",
    "policies.privacy.legalBases.p":
      "במקום שבו חלה תקנת ה-GDPR או ה-UK GDPR, אנו מסתמכים על: קיום ההתקשרות החוזית עמכם (לצורך ביצוע ההזמנות), הסכמתכם (לדיוור שיווקי) והאינטרסים הלגיטימיים שלנו (לצורך תפעול ואבטחת הסטודיו והאתר).",
    "policies.privacy.share.h": "עם מי אנו חולקים את המידע",
    "policies.privacy.share.p1":
      "איננו מוכרים את המידע האישי שלכם. אנו חולקים אותו רק עם נותני שירות המסייעים לנו בהפעלת החנות, ורק במידת הצורך:",
    "policies.privacy.share.li1": "Stripe — לצורך גביית התשלום.",
    "policies.privacy.share.li2": "חברות שילוח ומשלוחים — לצורך מסירת ההזמנה.",
    "policies.privacy.share.li3":
      "ספקי האחסון והדוא״ל שלנו — לצורך תפעול האתר ומענה לפניותיכם.",
    "policies.privacy.share.li4": "רשויות — כאשר הדבר נדרש על פי דין.",
    "policies.privacy.transfers.h": "העברות בין-לאומיות",
    "policies.privacy.transfers.p":
      "אנו שולחים משלוחים לחו״ל ונעזרים בנותני שירות העשויים לאחסן או לעבד מידע מחוץ למדינתכם, לרבות מחוץ לאיחוד האירופי/בריטניה. במקום שנדרש, אנו מסתמכים על אמצעי הגנה מתאימים להעברות אלו, כגון סעיפים חוזיים סטנדרטיים (SCC).",
    "policies.privacy.retention.h": "משך שמירת המידע",
    "policies.privacy.retention.p":
      "אנו שומרים מידע על הזמנות ופרטי קשר למשך הזמן הדרוש לביצוע ההזמנה ולעמידה בדרישות מס, חשבונאות ודין, ולאחר מכן מוחקים אותו או הופכים אותו לאנונימי. באפשרותכם לבקש מאיתנו למחוק מידע שאיננו מחויבים לשמור על פי דין.",
    "policies.privacy.rights.h": "הזכויות שלכם",
    "policies.privacy.rights.p1":
      "בהתאם למקום מגוריכם (ובכלל זה מכוח ה-GDPR/UK GDPR ומכוח ה-CCPA/CPRA של קליפורניה), ייתכן שתעמודנה לכם הזכויות הבאות:",
    "policies.privacy.rights.li1": "לעיין במידע האישי שאנו מחזיקים אודותיכם.",
    "policies.privacy.rights.li2": "לתקן או לעדכן אותו.",
    "policies.privacy.rights.li3": "לבקש את מחיקתו.",
    "policies.privacy.rights.li4":
      "להתנגד לעיבוד מסוים או להגבילו, ולחזור בכם מהסכמה לדיוור שיווקי בכל עת.",
    "policies.privacy.rights.li5":
      "איננו מוכרים או ״חולקים״ מידע אישי לצורכי פרסום התנהגותי חוצה-הקשרים.",
    "policies.privacy.request":
      "להגשת בקשה, פנו אלינו באמצעות פרטי הקשר המופיעים בתחתית האתר. נשיב לפנייתכם בתוך פרק הזמן הקבוע בדין.",
    "policies.privacy.cookies.h": "עוגיות ומעקב",
    "policies.privacy.cookies.p":
      "אנו עושים שימוש בעוגיות חיוניות בלבד, הדרושות לתפקוד האתר ולכניסת המנהל למערכת. בשלב זה איננו עושים שימוש בכלי ניתוח (analytics) או במעקבי פרסום של צד שלישי. אם נוסיף בעתיד כלי ניתוח או פיקסלים שיווקיים, נעדכן מדיניות זו ונוסיף באנר להסכמה לעוגיות במקום שנדרש.",
    "policies.privacy.children.h": "קטינים",
    "policies.privacy.children.p":
      "האתר אינו מיועד לילדים, ואיננו אוספים ביודעין מידע אישי מילדים. אם גילכם מתחת ל-16, אנא אל תשלחו אלינו מידע אישי ללא הסכמת הורה או אפוטרופוס.",
    "policies.privacy.changes.h": "שינויים",
    "policies.privacy.changes.p":
      "אנו רשאים לעדכן מדיניות זו מעת לעת. תאריך התחילה המופיע לעיל משקף את מועד העדכון האחרון.",

    // Terms
    "policies.terms.title": "תנאי מכר",
    "policies.terms.metaDescription":
      "התנאים החלים על רכישות והזמנות בהתאמה אישית מ-AAA.",
    "policies.terms.intro":
      "תנאי מכר אלה חלים על רכישת מוצרים מ-AAA (Amit Amar Art). בביצוע הזמנה הנכם מסכימים לתנאים אלה יחד עם מדיניות ההחזרות, המשלוחים והפרטיות שלנו. תאריך תחילה: 7 ביולי 2026.",
    "policies.terms.handmade.h": "המוצרים שלנו נעשים בעבודת יד",
    "policies.terms.handmade.p":
      "כל פריט של AAA מעוצב ומסיים בעבודת יד, ורבים מהפריטים מיוצרים לפי הזמנה. הצבעים, המרקמים, מיקום האלמנטים והמראה המדויק עשויים להיות שונים מהתמונות ומהתצוגות התלת-ממדיות (3D) שאתם רואים במסך בעת ההזמנה. כל פריט הוא יחיד במינו, ושונות טבעית זו היא חלק ממלאכת היד — ואינה מהווה פגם.",
    "policies.terms.prices.h": "מחירים ותשלום",
    "policies.terms.prices.p":
      "המחירים מוצגים במטבע המופיע בעמוד התשלום, וניתנים לשינוי בכל עת עד לביצוע ההזמנה. התשלום נגבה באמצעות עמוד התשלום המאובטח של Stripe. אם מחיר שגוי באופן ברור עקב תקלה טכנית, אנו רשאים לבטל את ההזמנה ולהשיב לכם את התשלום במקום לכבד את הטעות. במקום שהדבר רלוונטי, מס מכירה או מע״מ מוצג או מתווסף בעמוד התשלום; כל מכס יבוא או מסים מקומיים בהזמנות בין-לאומיות הם באחריותכם (ראו את מדיניות המשלוחים).",
    "policies.terms.custom.h": "פריטים בהתאמה אישית ולפי הזמנה",
    "policies.terms.custom.p1":
      "בעת עיצוב פריט בכלי הסטודיו שלנו או הזמנת פריט בהתאמה אישית:",
    "policies.terms.custom.li1":
      "אנו עושים כל מאמץ להתאים את המוצר לבקשתכם, אך מאחר שכל פריט נעשה בעבודת יד לא ניתן להתחייב לתוצאה זהה לחלוטין.",
    "policies.terms.custom.li2":
      "פריטים בהתאמה אישית מיוצרים במיוחד עבורכם ומהווים מכירה סופית — לא ניתן לבטלם לאחר תחילת הייצור, והם אינם זכאים להחזרה, החלפה או החזר כספי, למעט במקרה של פגם ייצור אמיתי או טעות מצדנו (ראו את מדיניות ההחזרות).",
    "policies.terms.content.h": "תוכן שאתם מוסרים (הזמנות בהתאמה אישית)",
    "policies.terms.content.p1":
      "אם תעלו או תשלחו אלינו תמונה, יצירה, לוגו, שם או טקסט כלשהם לצורך יישומם על מוצר, הנכם מאשרים ומסכימים כי:",
    "policies.terms.content.li1":
      "התוכן בבעלותכם או שבידיכם כל הזכויות וההרשאות הדרושות לשימוש בו, והוא אינו מפר זכויות יוצרים, סימני מסחר, זכות לפרסום או זכויות אחרות של צד כלשהו.",
    "policies.terms.content.li2": "התוכן אינו בלתי חוקי, פוגעני או מעורר התנגדות באופן אחר.",
    "policies.terms.content.li3":
      "הנכם מעניקים ל-AAA רישיון להשתמש בתוכן ולשכפלו אך ורק לצורך ייצור ההזמנה שלכם.",
    "policies.terms.content.li4":
      "הנכם אחראים לתוכן שאתם מוסרים, ומסכימים לשפות את AAA ולפצותה בגין כל תביעה, נזק או הוצאה של צד שלישי (לרבות שכר טרחת עורך דין סביר) הנובעים מאותו תוכן או מהפרת תנאים אלה מצדכם.",
    "policies.terms.content.li5":
      "AAA רשאית לדחות או לבטל כל הזמנה בהתאמה אישית שלדעתנו מפרה זכויות או נוגדת מדיניות זו.",
    "policies.terms.trademarks.h": "סימני מסחר של צדדים שלישיים",
    "policies.terms.trademarks.p":
      "חלק משמות המוצרים והתיאורים מפנים למותגים, קבוצות, דמויות או עיצובים של צדדים שלישיים לצורכי זיהוי בלבד. כל סימני המסחר וזכויות היוצרים הללו הם קניינם של בעליהם בהתאמה. AAA הוא סטודיו עצמאי שאינו מזוהה עם מי מהם, אינו ממומן על ידם ואינו זוכה לחסותם. במקום שבו מבוצעת התאמה אישית להנעלה, היא מסופקת בעבודת יד על גבי מוצרים חלקים שנרכשו כדין.",
    "policies.terms.ip.h": "קניין רוחני",
    "policies.terms.ip.p":
      "השם AAA, הלוגו, תוכן האתר, התמונות והעיצובים המקוריים הם בבעלות AAA, ואין להעתיקם או להשתמש בהם ללא רשות.",
    "policies.terms.dmca.h": "תלונות בנושא קניין רוחני / DMCA",
    "policies.terms.dmca.p":
      "אם לדעתכם תוכן באתר מפר את הקניין הרוחני שלכם, פנו אלינו באמצעות פרטי הקשר שבתחתית האתר בצירוף פרטי היצירה והחומר המדובר, ואנו נבחן את הפנייה ונפעל בהתאם. נסיר או נחסום את הגישה לחומר שיוכח כמפר, ואף עשויים לבטל כל הזמנה קשורה.",
    "policies.terms.liability.h": "הסתייגויות והגבלת אחריות",
    "policies.terms.liability.p":
      "במידה המרבית המותרת על פי דין, המוצרים והאתר מסופקים כמות שהם (״as is״). אין באמור בתנאים אלה כדי לגרוע מזכויות המוקנות לכם מכוח דיני הגנת הצרכן הקוגנטיים. ככל שהדין מתיר, AAA אינה אחראית לנזק עקיף, מקרי או תוצאתי, וסך אחריותה בקשר לכל הזמנה מוגבל לסכום ששילמתם בגין אותה הזמנה.",
    "policies.terms.law.h": "הדין החל",
    "policies.terms.law.p":
      "תנאים אלה כפופים לדיני מדינת ישראל, וכל מחלוקת תתברר בבתי המשפט המוסמכים בישראל. אם אתם צרכנים במדינה אחרת, יעמדו לכם ההגנות הצרכניות הקוגנטיות של מדינת מגוריכם.",
    "policies.terms.changes.h": "שינויים",
    "policies.terms.changes.p":
      "אנו רשאים לעדכן תנאים אלה מעת לעת; הגרסה שבתוקף במועד ביצוע ההזמנה היא שתחול על אותה הזמנה.",

    // Shipping
    "policies.shipping.title": "מדיניות משלוחים",
    "policies.shipping.metaDescription":
      "זמני הכנה, אספקה ומכס עבור פריטי AAA בעבודת יד המיוצרים לפי הזמנה.",
    "policies.shipping.intro":
      "מאחר שהפריטים שלנו נעשים בעבודת יד ולעיתים קרובות מיוצרים לפי הזמנה, אנא הביאו בחשבון זמן ייצור טרם המשלוח. תאריך תחילה: 7 ביולי 2026.",
    "policies.shipping.processing.h": "זמן הכנה",
    "policies.shipping.processing.p":
      "פריטים מוכנים למשלוח נשלחים בדרך כלל בתוך 2-5 ימי עסקים. פריטים המיוצרים לפי הזמנה ובהתאמה אישית מצריכים זמן ייצור, בדרך כלל 1-4 שבועות, אשר נתאם עמכם. אם לא נוכל לשלוח בתוך פרק הזמן שצוין, נעדכן אתכם ונאפשר לכם לבחור בין המתנה לבין קבלת החזר כספי.",
    "policies.shipping.where.h": "יעדי משלוח",
    "policies.shipping.where.p":
      "אנו שולחים משלוחים בתוך ישראל ולחו״ל. אפשרויות המשלוח והעלויות מוצגות בעמוד התשלום לפני ביצוע התשלום.",
    "policies.shipping.estimates.h": "זמני אספקה משוערים",
    "policies.shipping.estimates.p":
      "זמני האספקה הם הערכות של חברת השילוח ואינם מובטחים. עם שליחת ההזמנה נשתף פרטי מעקב במקום שהדבר אפשרי.",
    "policies.shipping.customs.h": "מכס, מסים ואגרות",
    "policies.shipping.customs.p":
      "בהזמנות בין-לאומיות, כל מסי יבוא, מסים או אגרות מכס הנגבים על ידי מדינת היעד הם באחריות הנמען ואינם כלולים במחיר המוצר או המשלוח.",
    "policies.shipping.lost.h": "משלוחים אבודים או מתעכבים",
    "policies.shipping.lost.p":
      "אם ההזמנה מתעכבת באופן משמעותי או שנראה כי אבדה, פנו אלינו באמצעות פרטי הקשר שבתחתית האתר ונסייע באיתורה מול חברת השילוח.",

    // Accessibility
    "policies.accessibility.title": "הצהרת נגישות",
    "policies.accessibility.metaDescription":
      "מחויבות AAA לאתר נגיש, מה כבר עשינו וכיצד לדווח על חסם.",
    "policies.accessibility.intro":
      "AAA שואף לאפשר לכל אחת ואחד לגלוש ולקנות באתר. אנו פועלים לעמוד בהנחיות הנגישות לתוכן אינטרנטי (WCAG) 2.1 / 2.2 ברמה AA, ורואים בנגישות עבודה מתמשכת ולא משימה חד-פעמית.",
    "policies.accessibility.done.h": "מה עשינו",
    "policies.accessibility.done.li1":
      "לחצן נגישות מובנה (בפינה הימנית התחתונה של כל עמוד) המאפשר להגדיל טקסט, להפעיל ניגודיות גבוהה ולהפחית תנועה. הבחירות שלכם נשמרות.",
    "policies.accessibility.done.li2": "צבעי הטקסט והרקע נבדקו לניגודיות קריאה.",
    "policies.accessibility.done.li3":
      "תמיכה בניווט במקלדת עם סימון פוקוס נראה, וקישור ״דילוג לתוכן״.",
    "policies.accessibility.done.li4": "טקסט חלופי לתמונות המוצרים ותוויות לשדות הטפסים.",
    "policies.accessibility.done.li5":
      "התחשבות בהגדרת ״הפחתת תנועה״ של המכשיר שלכם עבור אנימציות.",
    "policies.accessibility.done.li6":
      "מבנה עמוד סמנטי ואזורי ניווט (landmarks) עבור קוראי מסך.",
    "policies.accessibility.limitations.h": "מגבלות ידועות",
    "policies.accessibility.limitations.p":
      "חלקים אינטראקטיביים ועשירים מסוימים — סטודיו העיצוב התלת-ממדי (3D) וחוויית ״הספר״ המונפשת — עשויים להיות קשים לשימוש באמצעות קורא מסך או במקלדת בלבד. אם חלק כלשהו באתר מקשה עליכם, נשמח לסייע לכם לגלוש, לבחור או לבצע הזמנה בדרך אחרת.",
    "policies.accessibility.tell.h": "ספרו לנו",
    "policies.accessibility.tell.p":
      "אם נתקלתם בחסם או שיש לכם הצעה, פנו אלינו בדוא״ל או בוואטסאפ המופיעים בתחתית האתר וציינו את העמוד ואת הבעיה. אנו שואפים להשיב בתוך 5 ימי עסקים ולתקן תקלות במהירות האפשרית.",
    "policies.accessibility.reviewed": "נבדק לאחרונה: 7 ביולי 2026.",
  },
};

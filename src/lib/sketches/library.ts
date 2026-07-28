/* The studio's sketch library — hand-authored fashion flats and atelier
 * objects, drawn as stroke paths so they can ink themselves on in real time.
 * `dashed` paths render as stitch marks and fade in after the solid strokes.
 * Complexity buckets let a slot ask for a quick doodle or a full flat. */

export interface SketchPath {
  d: string;
  /** stroke width in viewBox units (default 1.8) */
  w?: number;
  /** stitch/detail line — fades in instead of drawing on */
  dashed?: boolean;
}

export interface Sketch {
  id: string;
  complexity: "simple" | "complex";
  viewBox: string;
  paths: SketchPath[];
}

export const SKETCHES: Sketch[] = [
  /* ------------------------------ simple ------------------------------ */
  {
    id: "hanger",
    complexity: "simple",
    viewBox: "0 0 120 120",
    paths: [
      { d: "M60 30 C60 22 68 20 68 26 C68 30 63 31 60 34 L60 42" },
      { d: "M60 42 L18 74 C16 76 17 79 20 79 L100 79 C103 79 104 76 102 74 L60 42" },
      { d: "M30 79 L92 79", w: 1, dashed: true },
    ],
  },
  {
    id: "button",
    complexity: "simple",
    viewBox: "0 0 120 120",
    paths: [
      { d: "M60 24 C82 24 97 40 96 60 C95 81 80 96 60 96 C39 96 24 80 24 60 C24 39 39 24 60 24 Z" },
      { d: "M60 34 C76 34 87 45 86 60 C85 76 74 86 60 86 C45 86 34 75 34 60 C34 44 45 34 60 34 Z", w: 1.2 },
      { d: "M50 52 C52 50 55 50 56 52 C58 54 56 57 53 57 C50 57 48 54 50 52 Z", w: 1.3 },
      { d: "M64 52 C66 50 69 50 70 52 C72 54 70 57 67 57 C64 57 62 54 64 52 Z", w: 1.3 },
      { d: "M50 66 C52 64 55 64 56 66 C58 68 56 71 53 71 C50 71 48 68 50 66 Z", w: 1.3 },
      { d: "M64 66 C66 64 69 64 70 66 C72 68 70 71 67 71 C64 71 62 68 64 66 Z", w: 1.3 },
      { d: "M54 55 C58 60 63 62 68 68 M67 55 C62 60 58 63 52 68", w: 1.1 },
    ],
  },
  {
    id: "spool",
    complexity: "simple",
    viewBox: "0 0 120 120",
    paths: [
      { d: "M38 30 C38 25 82 25 82 30 C82 35 38 35 38 30 Z" },
      { d: "M40 32 L42 84 M80 32 L78 84" },
      { d: "M42 84 C42 89 78 89 78 84" },
      { d: "M44 42 L76 44 M44 50 L76 52 M44 58 L76 60 M44 66 L76 68 M44 74 L76 76", w: 1.1 },
      { d: "M78 78 C94 82 100 92 96 106 C94 112 88 114 84 110", w: 1.2 },
    ],
  },
  {
    id: "scissors",
    complexity: "simple",
    viewBox: "0 0 120 120",
    paths: [
      { d: "M96 26 C90 24 84 26 80 32 L58 62" },
      { d: "M96 44 C90 48 84 48 78 44 L36 26" },
      { d: "M58 62 L40 86 C34 94 24 94 20 88 C16 82 20 74 28 72 C36 70 42 74 44 80", w: 1.6 },
      { d: "M52 56 L74 88 C80 96 90 96 94 90 C98 84 94 76 86 74 C78 72 72 76 70 82", w: 1.6 },
      { d: "M55 58 C57 56 60 56 61 58 C63 60 61 63 58 63 C55 63 53 60 55 58 Z", w: 1.2 },
    ],
  },
  {
    id: "safety-pin",
    complexity: "simple",
    viewBox: "0 0 120 120",
    paths: [
      { d: "M34 88 L86 34 C92 28 100 34 96 42 L46 96" },
      { d: "M46 96 C40 102 30 98 30 90 C30 84 36 80 42 84" },
      { d: "M34 88 L38 78 M34 88 L44 86", w: 1.3 },
      { d: "M88 30 C92 24 98 26 98 32", w: 1.3 },
    ],
  },
  {
    id: "needle-thread",
    complexity: "simple",
    viewBox: "0 0 120 120",
    paths: [
      { d: "M30 92 L82 28 C84 25 88 27 86 31 L38 96 C36 98 32 96 30 92 Z" },
      { d: "M78 36 C80 33 83 34 82 37 C81 40 78 39 78 36 Z", w: 1.2 },
      { d: "M80 38 C96 52 102 68 92 82 C84 94 66 96 54 88 C44 82 44 70 52 66 C60 62 68 68 66 76", w: 1.3 },
    ],
  },
  {
    id: "tape-measure",
    complexity: "simple",
    viewBox: "0 0 120 120",
    paths: [
      { d: "M22 66 C22 44 40 32 60 32 C82 32 98 46 98 64 C98 80 86 90 72 90 C60 90 52 82 52 72 C52 64 58 58 66 58 C72 58 76 62 76 68" },
      { d: "M22 66 L22 78 L34 78" },
      { d: "M30 52 L36 56 M40 42 L44 48 M54 36 L56 42 M68 34 L68 40 M80 38 L78 44 M90 48 L86 52", w: 1.1 },
      { d: "M24 70 L30 70 M24 75 L28 75", w: 1.1 },
    ],
  },
  {
    id: "pocket",
    complexity: "simple",
    viewBox: "0 0 120 120",
    paths: [
      { d: "M30 34 L90 34 L88 74 C88 86 74 94 60 94 C46 94 32 86 32 74 Z" },
      { d: "M30 34 C40 40 80 40 90 34", w: 1.3 },
      { d: "M36 40 L92 40 M35 46 C46 51 76 51 87 46", w: 1, dashed: true },
      { d: "M56 62 C58 60 62 60 64 62 C66 64 64 68 60 68 C56 68 54 64 56 62 Z", w: 1.3 },
    ],
  },
  {
    id: "zipper",
    complexity: "simple",
    viewBox: "0 0 120 120",
    paths: [
      { d: "M44 18 C46 40 44 66 46 100 M76 18 C74 40 76 66 74 100" },
      { d: "M52 22 H68 M52 30 H68 M52 38 H68 M52 46 H68", w: 1.2 },
      { d: "M60 50 C52 52 48 58 50 64 C52 70 58 72 60 70 C62 72 68 70 70 64 C72 58 68 52 60 50 Z" },
      { d: "M57 70 L57 84 C57 88 63 88 63 84 L63 70" },
      { d: "M58 90 C58 94 62 94 62 90", w: 1.2 },
      { d: "M52 56 H68", w: 1, dashed: true },
    ],
  },
  {
    id: "tee-flat",
    complexity: "simple",
    viewBox: "0 0 120 120",
    paths: [
      { d: "M46 28 C50 24 70 24 74 28 L98 40 L90 60 L78 54 L80 96 C66 102 54 102 40 96 L42 54 L30 60 L22 40 Z" },
      { d: "M46 28 C50 36 70 36 74 28", w: 1.3 },
      { d: "M42 92 C56 97 64 97 78 92", w: 1, dashed: true },
      { d: "M52 46 L58 38 L63 46 L68 38 L73 46", w: 1.2 },
    ],
  },
  {
    id: "sunglasses",
    complexity: "simple",
    viewBox: "0 0 120 120",
    paths: [
      { d: "M20 52 C20 44 30 42 40 44 C50 46 54 52 52 60 C50 68 42 72 34 70 C24 68 20 60 20 52 Z" },
      { d: "M68 52 C68 44 78 42 88 44 C98 46 102 52 100 60 C98 68 90 72 82 70 C72 68 68 60 68 52 Z" },
      { d: "M52 52 C56 48 64 48 68 52" },
      { d: "M20 50 L10 44 M100 50 L110 44", w: 1.4 },
      { d: "M26 50 C28 47 33 46 36 48", w: 1, dashed: true },
    ],
  },
  /* ------------------------------ complex ----------------------------- */
  {
    id: "hoodie-flat",
    complexity: "complex",
    viewBox: "0 0 120 120",
    paths: [
      { d: "M46 26 C46 14 74 14 74 26 C68 22 52 22 46 26 Z" },
      { d: "M50 24 C51 18 69 18 70 24", w: 1.2 },
      { d: "M46 26 L26 36 L18 74 L32 79 L38 52" },
      { d: "M74 26 L94 36 L102 74 L88 79 L82 52" },
      { d: "M38 44 L36 96 C50 102 70 102 84 96 L82 44" },
      { d: "M48 70 L72 70 L69 88 L51 88 Z" },
      { d: "M56 28 C55 34 57 40 54 46 M64 28 C65 34 63 40 66 46", w: 1.3 },
      { d: "M38 92 L39 98 M46 94 L47 100 M55 95 L55 101 M65 95 L65 101 M74 94 L75 100 M82 92 L83 98", w: 1 },
      { d: "M40 48 C54 53 66 53 80 48", w: 1, dashed: true },
    ],
  },
  {
    id: "sneaker-side",
    complexity: "complex",
    viewBox: "0 0 120 120",
    paths: [
      { d: "M14 82 C16 77 22 75 34 75 L98 77 C106 77 110 82 107 87 C88 92 34 92 20 89 C16 88 13 85 14 82 Z" },
      { d: "M20 84 L102 82", w: 1, dashed: true },
      { d: "M34 75 C32 56 36 40 44 34 C52 28 62 32 66 40 C72 52 84 62 98 68 C104 70 107 73 106 77" },
      { d: "M44 34 C50 38 58 39 63 36", w: 1.3 },
      { d: "M46 42 L60 46 M45 50 L62 54 M45 58 L66 62 M47 66 L72 70", w: 1.3 },
      { d: "M74 70 L79 63 L84 70 L89 63 L94 70", w: 1.3 },
      { d: "M90 78 C96 72 103 71 107 75", w: 1.2 },
      { d: "M38 72 C42 70 48 70 52 72", w: 1, dashed: true },
    ],
  },
  {
    id: "halter-top",
    complexity: "complex",
    viewBox: "0 0 120 120",
    paths: [
      { d: "M60 22 C56 18 48 20 50 26 C52 31 58 31 60 27 C62 31 68 31 70 26 C72 20 64 18 60 22 Z", w: 1.4 },
      { d: "M56 28 L36 52 M64 28 L84 52" },
      { d: "M36 52 C30 60 32 70 36 74 L46 60 Z" },
      { d: "M84 52 C90 60 88 70 84 74 L74 60 Z" },
      { d: "M36 74 C44 80 76 80 84 74 L82 94 C68 100 52 100 38 94 Z" },
      { d: "M46 60 C52 66 68 66 74 60", w: 1.3 },
      { d: "M40 92 C42 96 44 94 44 98 M50 95 C52 99 54 97 54 101 M60 96 C62 100 64 98 64 102 M70 95 C72 99 74 97 74 101 M78 92 C80 96 82 94 82 98", w: 1 },
      { d: "M58 74 C56 80 60 84 58 90 M62 74 C64 80 60 84 62 90", w: 1.2 },
      { d: "M40 78 C52 82 68 82 80 78", w: 1, dashed: true },
    ],
  },
  {
    id: "dress-form",
    complexity: "complex",
    viewBox: "0 0 120 120",
    paths: [
      { d: "M60 14 L60 20", w: 1.4 },
      { d: "M48 22 C48 18 72 18 72 22 C72 26 48 26 48 22 Z", w: 1.3 },
      { d: "M50 24 C48 38 44 44 42 52 C40 62 46 70 52 74 C46 82 48 90 52 94 L68 94 C72 90 74 82 68 74 C74 70 80 62 78 52 C76 44 72 38 70 24" },
      { d: "M52 74 C58 78 62 78 68 74", w: 1.2 },
      { d: "M44 52 C54 58 66 58 76 52", w: 1, dashed: true },
      { d: "M60 94 L60 106", w: 1.4 },
      { d: "M44 110 C48 104 72 104 76 110", w: 1.6 },
      { d: "M46 34 L50 40 M74 34 L70 40", w: 1, dashed: true },
    ],
  },
  {
    id: "varsity-jacket",
    complexity: "complex",
    viewBox: "0 0 120 120",
    paths: [
      { d: "M48 24 C52 20 68 20 72 24 L76 28 L92 36 L100 72 L86 77 L82 54" },
      { d: "M44 28 L28 36 L20 72 L34 77 L38 54" },
      { d: "M38 46 L36 94 C50 100 70 100 84 94 L82 46" },
      { d: "M48 24 C50 30 70 30 72 24", w: 1.4 },
      { d: "M50 22 C52 27 68 27 70 22", w: 1.1 },
      { d: "M60 30 L60 94", w: 1.3 },
      { d: "M56 38 C58 36 61 38 59 40 C57 42 55 40 56 38 Z M56 52 C58 50 61 52 59 54 C57 56 55 54 56 52 Z M56 66 C58 64 61 66 59 68 C57 70 55 68 56 66 Z M56 80 C58 78 61 80 59 82 C57 84 55 82 56 80 Z", w: 1.1 },
      { d: "M22 66 L34 70 M20 70 L33 74", w: 1.1 },
      { d: "M98 66 L86 70 M100 70 L87 74", w: 1.1 },
      { d: "M38 90 L39 97 M48 93 L48 99 M72 93 L72 99 M82 90 L81 97", w: 1 },
      { d: "M44 34 L48 60", w: 1, dashed: true },
    ],
  },
  {
    id: "bucket-hat",
    complexity: "complex",
    viewBox: "0 0 120 120",
    paths: [
      { d: "M44 36 C44 26 76 26 76 36 L80 58 L40 58 Z" },
      { d: "M40 58 C24 60 16 66 18 72 C22 80 48 84 62 84 C80 84 98 80 102 72 C104 66 94 60 80 58" },
      { d: "M40 58 C50 62 70 62 80 58", w: 1.3 },
      { d: "M22 70 C40 76 80 76 98 70", w: 1, dashed: true },
      { d: "M26 66 C44 72 76 72 94 66", w: 1, dashed: true },
      { d: "M44 44 L76 44", w: 1, dashed: true },
      { d: "M52 50 L56 44 L60 50 L64 44 L68 50", w: 1.2 },
    ],
  },
  {
    id: "cargo-pants",
    complexity: "complex",
    viewBox: "0 0 120 120",
    paths: [
      { d: "M42 18 L78 18 L77 28 L43 28 Z" },
      { d: "M56 23 C58 26 62 26 64 23", w: 1.2 },
      { d: "M43 28 L38 102 L54 104 L60 52 L66 104 L82 102 L77 28" },
      { d: "M36 102 L56 105 M64 105 L84 102", w: 1.3 },
      { d: "M44 54 L54 55 L53 70 L43 69 Z", w: 1.4 },
      { d: "M44 58 L54 59", w: 1.1 },
      { d: "M66 55 L76 54 L77 69 L67 70 Z", w: 1.4 },
      { d: "M66 59 L76 58", w: 1.1 },
      { d: "M46 32 C52 35 68 35 74 32", w: 1, dashed: true },
      { d: "M45 40 L48 44 M75 40 L72 44", w: 1.1 },
    ],
  },
  {
    id: "corset",
    complexity: "complex",
    viewBox: "0 0 120 120",
    paths: [
      { d: "M40 26 C46 32 74 32 80 26 L86 44 C88 58 84 70 78 78 L80 94 C66 100 54 100 40 94 L42 78 C36 70 32 58 34 44 Z" },
      { d: "M48 30 L46 92 M72 30 L74 92", w: 1.2 },
      { d: "M60 32 L60 96", w: 1.2 },
      { d: "M52 40 L68 46 M68 40 L52 46 M52 52 L68 58 M68 52 L52 58 M52 64 L68 70 M68 64 L52 70 M52 76 L68 82 M68 76 L52 82", w: 1.1 },
      { d: "M36 48 C42 52 48 52 52 50 M84 48 C78 52 72 52 68 50", w: 1, dashed: true },
      { d: "M58 88 C56 94 58 98 56 104 M62 88 C64 94 62 98 64 104", w: 1.2 },
    ],
  },
];

/** Handwritten margin captions the studio scribbles beside a sketch. */
export const SKETCH_CAPTIONS = [
  "from the sketchbook",
  "pattern nº 07",
  "cut & sew notes",
  "fitting — v2",
  "one of one",
  "in the studio",
  "toile first",
  "chalk + pins",
  "draft — do not trace",
  "measure twice",
];

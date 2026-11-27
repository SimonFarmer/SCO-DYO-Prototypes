/**
 * Loose-diamond catalog for the Stone step (Test 3 — Stone Details).
 * Same stones in every variant. Prices come from one pricing model so carat and the 4Cs
 * stay consistent: bigger, whiter, cleaner and better-cut stones always cost more.
 */
import type { Stone } from "@/data/dyo"

export const CUT_GRADES = ["Poor", "Fair", "Good", "Very Good", "Excellent", "Shane Classic"] as const
export const COLOR_GRADES = ["M", "L", "K", "J", "I", "H", "G", "F", "E", "D"] as const
export const CLARITY_GRADES = ["I3", "I2", "I1", "SI2", "SI1", "VS2", "VS1", "VVS2", "VVS1", "IF"] as const

export type CutGrade = (typeof CUT_GRADES)[number]
export type ColorGrade = (typeof COLOR_GRADES)[number]
export type ClarityGrade = (typeof CLARITY_GRADES)[number]

export const SHAPES = [
  "Round",
  "Oval",
  "Pear",
  "Emerald",
  "Marquise",
  "Cushion",
  "Heart",
  "Princess",
  "Asscher",
  "Radiant",
] as const
export type Shape = (typeof SHAPES)[number]

/** The Figma tile photo (round brilliant). Test 3's lead stone keeps it so the PDP matches the design. */
export const DIAMOND_IMAGE = "/images/diamonds/round.png"

/**
 * Real Shane Co. natural-diamond photos (V360 face-up shots, shaneco.com loose diamonds, Nov 2026), 12 per
 * shape, saved as /images/diamonds/stones/{stoneId}.jpg. Catalog stones reuse the photos of their shape.
 */
const STONE_PHOTOS: Record<Shape, string[]> = {
  Round: ["25J16J4", "25E0J93", "25I03VU", "25F00K1", "26D0E3C", "24J1BBE", "25F0NL1", "25I02XM", "24K0GUJ", "25I003W", "25G0JAY", "25E11XT"],
  Oval: ["25D0XA6", "25E02LX", "23A0JJJ", "26B01J9", "25C0GXP", "25B0W30", "25I0LNS", "25E02JS", "25E0J3Z", "25H0WWV", "26B0BM3", "25H02C1"],
  Pear: ["26B0C37", "26C087M", "26D00E0", "26D00LX", "26D0E9K", "26D0QNE", "26D0QNG", "26D0QNH", "26D0QNU", "26D105N", "26E0NSE", "26E0YE9"],
  Emerald: ["24I0SPL", "25B0U72", "25H032X", "25H0DA9", "25H0DAP", "25H0DEB", "25H0JAD", "25L0165", "26A0LWF", "26B0C3P", "26B0E4M", "26B0E5B"],
  Marquise: ["26F0PBQ", "26F0PBS", "26H0CCB", "26H0MUV", "26H0MUZ", "26H0SGR", "26H0SKN", "26H0VLP", "26H0VMS", "26H0VMU", "26H0VNC", "26I18MP"],
  Cushion: ["24K12MV", "25F00KR", "25L0126", "25C106Q", "24L0EGE", "25F0D51", "26A0TLX", "25H02ZK", "25A0CLR", "25L138Y", "26C0G38", "25H0JHX"],
  Heart: ["26J1729", "25A0G29", "25C0MRU", "25E07M9", "25I06CT", "26F00U3", "26H0V6S", "26H184G", "26I0JEZ", "26J03JC", "22C0WTN", "22G0UUX"],
  Princess: ["25L0KTG", "25I02WB", "26B0E21", "25J16T1", "26C08VF", "25K020K", "26C08VH", "25K0WX8", "26C0JKL", "25K14NT", "26D0DRU"],
  Asscher: ["26K07L0", "22L0W93", "23C0FWR", "25D0LSD", "25H02YB", "25H0PU4", "25H0PU8", "25L03JL", "26J0AJM", "21I0UCL", "22D0YQL", "23B0L8G"],
  Radiant: ["25H12A0", "25H12A1", "25I030D", "26B0VGJ", "26D0E81", "26E12RM", "26F0879", "26F0KNB", "26F0KND", "26F0L76", "26F0L78", "26F0L7G"],
}

export const stonePhoto = (shape: Shape, n: number) => {
  const pool = STONE_PHOTOS[shape]
  return `/images/diamonds/stones/${pool[n % pool.length]}.jpg`
}

export const shapeIcon = (shape: Shape) => `/images/diamonds/shapes/${shape.toLowerCase()}.png`

export interface Diamond {
  id: string
  /** Lab-grown (IGI certified); natural (GIA) when unset. Test 2's and the full-flow study's lab-grown stock. */
  lab?: boolean
  /** GIA report / serial number */
  serial: string
  shape: Shape
  carat: number
  cut: CutGrade
  color: ColorGrade
  clarity: ClarityGrade
  price: number
  /** Table and depth as % of diameter */
  table: number
  depth: number
  girdle: string
  culet: string
  /** Face-up measurements in mm */
  lengthMm: number
  widthMm: number
  /** Length-to-width ratio (1.00 for rounds) */
  lwRatio: number
  /** Face-up photo */
  image: string
  /** Can be seen today at the shopper's store (the "Stone In-Store" chip) */
  instore: boolean
  topSeller?: boolean
}

// ---------------------------------------------------------------------------
// Pricing model: price ≈ $4,200 × carat^1.8 × color × clarity × cut, rounded to $5.
// Calibrated so a 1.00 ct H VS1 Excellent round lands near $5,000.

const COLOR_FACTOR: Record<ColorGrade, number> = {
  M: 0.62, L: 0.68, K: 0.75, J: 0.83, I: 0.91, H: 1, G: 1.1, F: 1.22, E: 1.34, D: 1.5,
}
const CLARITY_FACTOR: Record<ClarityGrade, number> = {
  I3: 0.38, I2: 0.5, I1: 0.64, SI2: 0.8, SI1: 0.9, VS2: 1, VS1: 1.1, VVS2: 1.22, VVS1: 1.32, IF: 1.5,
}
const CUT_FACTOR: Record<CutGrade, number> = {
  Poor: 0.7, Fair: 0.8, Good: 0.88, "Very Good": 0.95, Excellent: 1.05, "Shane Classic": 1.12,
}

export function priceFor(carat: number, color: ColorGrade, clarity: ClarityGrade, cut: CutGrade) {
  const raw = 4200 * carat ** 1.8 * COLOR_FACTOR[color] * CLARITY_FACTOR[clarity] * CUT_FACTOR[cut]
  return Math.round(raw / 5) * 5
}

/** Round brilliant diameter from weight (≈ 6.5 mm at 1 ct). */
const roundDiameter = (carat: number) => Math.round(6.5 * Math.cbrt(carat) * 100) / 100

type Spec = [carat: number, cut: CutGrade, color: ColorGrade, clarity: ClarityGrade, table: number, depth: number, girdle: string]

/** Grid order on the GLP (Popular). The first stone matches the Figma PDP (1.51 ct J I2 Very Good). */
const SPECS: Spec[] = [
  [1.51, "Very Good", "J", "I2", 57, 66, "Very Thick"],
  [1.01, "Excellent", "H", "VS1", 57, 61.8, "Medium"],
  [1.21, "Very Good", "G", "VS2", 58, 62.4, "Medium"],
  [0.9, "Excellent", "G", "SI1", 56, 61.5, "Thin to Medium"],
  [1.05, "Shane Classic", "F", "VS2", 56, 61.6, "Medium"],
  [1.3, "Excellent", "I", "SI1", 57, 62.1, "Medium"],
  [0.81, "Very Good", "H", "VS2", 58, 62.9, "Medium"],
  [1.11, "Excellent", "J", "VS1", 57, 61.9, "Medium"],
  [1.5, "Excellent", "H", "SI2", 57, 62.2, "Slightly Thick"],
  [0.73, "Good", "G", "VS1", 59, 63.4, "Medium to Thick"],
  [1.02, "Very Good", "E", "SI1", 58, 62.6, "Medium"],
  [1.25, "Shane Classic", "H", "VVS2", 56, 61.4, "Thin to Medium"],
  [2.01, "Excellent", "I", "SI2", 57, 62, "Medium"],
  [0.95, "Excellent", "D", "VS2", 56, 61.7, "Medium"],
  [1.18, "Good", "K", "SI1", 60, 63.8, "Thick"],
  [1.4, "Very Good", "G", "VS2", 58, 62.5, "Medium"],
  [0.78, "Excellent", "F", "VVS2", 57, 61.6, "Thin to Medium"],
  [1.07, "Very Good", "I", "I1", 59, 63.1, "Slightly Thick"],
  [1.71, "Excellent", "J", "SI1", 57, 62.3, "Medium"],
  [1, "Shane Classic", "G", "VS1", 56, 61.5, "Medium"],
  [0.71, "Very Good", "H", "SI1", 58, 62.7, "Medium"],
  [1.33, "Excellent", "F", "SI2", 57, 62.1, "Medium"],
  [1.6, "Very Good", "K", "VS2", 58, 63, "Slightly Thick"],
  [1.12, "Excellent", "H", "VS2", 57, 61.9, "Medium"],
]

/** The 24 Test 3 stones (rounds), kept with their IDs so Test 3 links and the Figma PDP stone still work. */
const LEGACY: Diamond[] = SPECS.map(([carat, cut, color, clarity, table, depth, girdle], i) => {
  const d = roundDiameter(carat)
  return {
    id: `rd-${carat.toFixed(2).replace(".", "")}-${color}-${clarity}`.toLowerCase(),
    serial: String(76894527 + i * 1379),
    shape: "Round",
    carat,
    cut,
    color,
    clarity,
    price: priceFor(carat, color, clarity, cut),
    table,
    depth,
    girdle,
    culet: "None",
    lengthMm: d,
    widthMm: Math.round((d - 0.02) * 100) / 100,
    lwRatio: 1,
    image: i === 0 ? DIAMOND_IMAGE : stonePhoto("Round", i),
    instore: i % 5 === 2,
    topSeller: i === 1 || i === 4,
  }
})

// ---------------------------------------------------------------------------
// Generated inventory. A seeded random walk over realistic distributions, so every load (and every
// tester) sees the same stones, and filters narrow the count the way a real inventory would.

/** Total stones in the (simulated) natural inventory: Figma's "Showing 24 of 5,295 Items". */
export const INVENTORY_COUNT = 5295

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(5295)
const pick = <T,>(items: readonly T[], weights: readonly number[]) => {
  let r = rand() * weights.reduce((a, b) => a + b, 0)
  for (let i = 0; i < items.length; i++) if ((r -= weights[i]) < 0) return items[i]
  return items[items.length - 1]
}
const between = (lo: number, hi: number) => lo + rand() * (hi - lo)
const round2 = (n: number) => Math.round(n * 100) / 100

const SHAPE_WEIGHT: Record<Shape, number> = {
  Round: 38, Oval: 14, Cushion: 8, Princess: 7, Emerald: 7, Pear: 6, Radiant: 6, Marquise: 5, Heart: 4, Asscher: 5,
}
/** Popular carat bands (stones cluster just above the "magic" weights). */
const CARAT_BANDS: [number, number, number][] = [
  [0.3, 0.39, 5], [0.4, 0.49, 6], [0.5, 0.59, 12], [0.6, 0.69, 5], [0.7, 0.79, 15], [0.8, 0.89, 6], [0.9, 0.99, 9],
  [1, 1.09, 18], [1.1, 1.19, 4], [1.2, 1.29, 5], [1.3, 1.49, 3], [1.5, 1.59, 7], [1.6, 1.99, 2], [2, 2.09, 5], [2.1, 2.49, 1], [2.5, 2.59, 2], [3, 3.09, 1],
]
const COLOR_WEIGHT = [3, 4, 6, 11, 15, 17, 16, 12, 9, 7] // M … D
const CLARITY_WEIGHT = [1, 4, 9, 16, 19, 18, 15, 9, 6, 3] // I3 … IF
const CUT_WEIGHT_ROUND = [1, 3, 12, 34, 38, 12] // Poor … Shane Classic
const CUT_WEIGHT_FANCY = [1, 4, 17, 55, 23, 0] // Shane Classic is a round-only cut

/** Fancy shapes trade below rounds of the same weight and grades. */
const SHAPE_PRICE: Record<Shape, number> = {
  Round: 1, Oval: 0.9, Cushion: 0.8, Princess: 0.78, Emerald: 0.84, Pear: 0.86, Radiant: 0.82, Marquise: 0.85, Heart: 0.86, Asscher: 0.83,
}
/** Typical length-to-width ratios */
const LW: Record<Shape, [number, number]> = {
  Round: [1, 1.01], Oval: [1.3, 1.5], Cushion: [1, 1.2], Princess: [1, 1.05], Emerald: [1.3, 1.5], Pear: [1.45, 1.7],
  Radiant: [1, 1.35], Marquise: [1.85, 2.1], Heart: [0.9, 1.05], Asscher: [1, 1.05],
}
/** Typical table / depth %, by shape family */
const PROPORTIONS: Record<Shape, { table: [number, number]; depth: [number, number] }> = {
  Round: { table: [54, 60], depth: [59.5, 63.5] },
  Oval: { table: [53, 63], depth: [58, 64] },
  Pear: { table: [53, 63], depth: [58, 64] },
  Marquise: { table: [53, 63], depth: [58, 64] },
  Heart: { table: [53, 63], depth: [58, 64] },
  Cushion: { table: [58, 68], depth: [61, 69] },
  Princess: { table: [65, 75], depth: [68, 75] },
  Emerald: { table: [61, 69], depth: [61, 69] },
  Asscher: { table: [61, 69], depth: [61, 69] },
  Radiant: { table: [61, 69], depth: [61, 69] },
}
const GIRDLES = ["Thin to Medium", "Medium", "Medium", "Medium to Slightly Thick", "Slightly Thick", "Thick"]

function generateStone(n: number): Diamond {
  const shape = pick(SHAPES, SHAPES.map((s) => SHAPE_WEIGHT[s]))
  const [lo, hi] = pick(CARAT_BANDS.map(([a, b]) => [a, b] as const), CARAT_BANDS.map((b) => b[2]))
  // Skew toward the bottom of each band.
  const carat = round2(lo + (hi - lo) * rand() ** 2)
  const color = pick(COLOR_GRADES, COLOR_WEIGHT)
  const clarity = pick(CLARITY_GRADES, CLARITY_WEIGHT)
  const cut = pick(CUT_GRADES, shape === "Round" ? CUT_WEIGHT_ROUND : CUT_WEIGHT_FANCY)
  const lwRatio = shape === "Round" ? 1 : round2(between(...LW[shape]))
  // Same face-up area as a round of this weight, stretched to the ratio.
  const d = roundDiameter(carat)
  const lengthMm = round2(d * Math.sqrt(lwRatio))
  const p = PROPORTIONS[shape]
  return {
    id: `nd-${String(n).padStart(4, "0")}`,
    serial: String(2201000000 + Math.floor(rand() * 98000000)),
    shape,
    carat,
    cut,
    color,
    clarity,
    price: Math.round((priceFor(carat, color, clarity, cut) * SHAPE_PRICE[shape]) / 5) * 5,
    table: Math.round(between(...p.table)),
    depth: Math.round(between(...p.depth) * 10) / 10,
    girdle: GIRDLES[Math.floor(rand() * GIRDLES.length)],
    culet: "None",
    lengthMm,
    widthMm: round2(lengthMm / lwRatio),
    lwRatio,
    image: stonePhoto(shape, Math.floor(rand() * 12)),
    instore: rand() < 0.12,
    topSeller: rand() < 0.02,
  }
}

const GENERATED = Array.from({ length: INVENTORY_COUNT - LEGACY.length }, (_, i) => generateStone(i + 1))

/**
 * Popular order (the default sort). Test 3's lead stone stays first; the rest of the first pages cycle
 * through the shapes, so the grid opens on a mix of photos rather than a wall of rounds.
 */
function popularOrder(): Diamond[] {
  const queues = new Map<Shape, Diamond[]>()
  for (const d of [...LEGACY.slice(1), ...GENERATED]) queues.set(d.shape, [...(queues.get(d.shape) ?? []), d])
  const cycle: Shape[] = ["Oval", "Round", "Emerald", "Cushion", "Pear", "Round", "Radiant", "Princess", "Marquise", "Round", "Heart", "Asscher"]
  const head: Diamond[] = [LEGACY[0]]
  for (let i = 0; head.length < 96; i++) {
    const next = queues.get(cycle[i % cycle.length])!.shift()
    if (next) head.push(next)
  }
  const rest = [...queues.values()].flat().sort((a, b) => a.id.localeCompare(b.id))
  // Interleave the remainder deterministically by serial so later pages stay mixed too.
  rest.sort((a, b) => Number(a.serial) % 997 - Number(b.serial) % 997)
  return [...head, ...rest]
}

export const DIAMONDS: Diamond[] = popularOrder()

export const findDiamond = (id: string | undefined) => DIAMONDS.find((d) => d.id === id)

// ---------------------------------------------------------------------------
// Copy

/** "Natural" or "Lab-Grown". */
export const diamondOrigin = (d: Diamond) => (d.lab ? "Lab-Grown" : "Natural")
/** Who grades it: GIA for natural diamonds, IGI for lab-grown (as shaneco.com). */
export const diamondLab = (d: Diamond) => (d.lab ? "IGI" : "GIA")
export const diamondTitle = (d: Diamond) => `${d.carat.toFixed(2)} ct ${d.shape} ${diamondOrigin(d)} Diamond`
/** PDP heading (Figma: “Brilliant Round Natural Diamond”) */
export const diamondName = (d: Diamond) => (d.shape === "Round" ? `Brilliant Round ${diamondOrigin(d)} Diamond` : `${d.shape} ${diamondOrigin(d)} Diamond`)

/** Convert to the shared ring-build Stone (stepper, price summary). */
export function toStone(d: Diamond): Stone {
  return {
    id: d.id,
    title: diamondTitle(d),
    price: d.price,
    carat: d.carat,
    shape: d.shape,
    origin: `${diamondOrigin(d)} Diamond`,
    clarity: d.clarity,
    color: d.color,
    cut: d.cut,
    diameterMm: d.lengthMm,
  }
}

/** The Four C's report card: grade, meter position and plain-language copy. */
export interface FourC {
  key: "carat" | "cut" | "clarity" | "color"
  label: string
  value: string
  /** Filled segments / total segments */
  level: number
  segments: number
  summary: string
  definition: string[]
}

const CARAT_STEPS = [0.3, 0.5, 0.75, 1, 1.5, 2, 3, 4]

const CUT_SUMMARY: Record<CutGrade, string> = {
  Poor: "Limited sparkle and brilliance.",
  Fair: "Some sparkle, with visible dark areas.",
  Good: "Balanced sparkle and value.",
  "Very Good": "Exceptional sparkle at a great value.",
  Excellent: "Magnificent sparkle and light return.",
  "Shane Classic": "Our top cut: maximum sparkle and brilliance.",
}
const COLOR_SUMMARY: Record<ColorGrade, string> = {
  M: "Noticeable warmth, best in yellow or rose gold.",
  L: "Noticeable warmth, best in yellow or rose gold.",
  K: "Faint warmth, softened in yellow gold.",
  J: "Slight warmth, softened in yellow gold.",
  I: "Near-colorless, with a hint of warmth.",
  H: "Near-colorless; looks white face-up.",
  G: "Near-colorless; looks white in any metal.",
  F: "Colorless, bright and icy white.",
  E: "Colorless, bright and icy white.",
  D: "The whitest grade there is.",
}
const CLARITY_SUMMARY: Record<ClarityGrade, string> = {
  I3: "Inclusions clearly visible to the naked eye.",
  I2: "Inclusions visible to the naked eye.",
  I1: "Inclusions may be visible on close look.",
  SI2: "Eye-clean from most angles.",
  SI1: "Eye-clean; inclusions only seen under magnification.",
  VS2: "Eye-clean; tiny inclusions under 10× magnification.",
  VS1: "Eye-clean; very slight inclusions under magnification.",
  VVS2: "Inclusions very hard to see, even magnified.",
  VVS1: "Inclusions extremely hard to see, even magnified.",
  IF: "No inclusions, even under magnification.",
}

function sizeSummary(d: Diamond) {
  const mm = d.lengthMm.toFixed(1)
  if (d.carat >= 1.5) return `A statement size, about ${mm} mm across.`
  if (d.carat >= 1) return `A classic size, about ${mm} mm across.`
  return `A delicate size, about ${mm} mm across.`
}

export function fourCs(d: Diamond): FourC[] {
  return [
    {
      key: "carat",
      label: "Carat",
      value: `${d.carat.toFixed(2)} ct`,
      level: CARAT_STEPS.filter((s) => d.carat >= s).length,
      segments: CARAT_STEPS.length,
      summary: sizeSummary(d),
      definition: [
        "Carat measures a diamond’s weight.",
        "While larger carat sizes often appear more impressive, a diamond’s cut and proportions also influence how large it looks.",
      ],
    },
    {
      key: "cut",
      label: "Cut",
      value: d.cut,
      level: CUT_GRADES.indexOf(d.cut) + 1,
      segments: CUT_GRADES.length,
      summary: CUT_SUMMARY[d.cut],
      definition: ["Cut determines how brilliantly a diamond reflects light, creating its sparkle and fire."],
    },
    {
      key: "clarity",
      label: "Clarity",
      value: d.clarity,
      level: CLARITY_GRADES.indexOf(d.clarity) + 1,
      segments: CLARITY_GRADES.length,
      summary: CLARITY_SUMMARY[d.clarity],
      definition: ["Clarity measures visible inclusions on a scale from IF (highest) to I3 (lowest)."],
    },
    {
      key: "color",
      label: "Color",
      value: d.color,
      level: COLOR_GRADES.indexOf(d.color) + 1,
      segments: COLOR_GRADES.length,
      summary: COLOR_SUMMARY[d.color],
      definition: ["Colour Grade helps compare diamonds from D (brightest white) to M (warmest tone)."],
    },
  ]
}

/** “Where it shines” / “What to know” bullets for the report card. */
export function expertTake(d: Diamond) {
  const shines: string[] = []
  const know: string[] = []
  const mm = d.lengthMm.toFixed(1)
  shines.push(`A ${d.carat >= 1.5 ? "statement" : d.carat >= 1 ? "classic" : "delicate"} ${d.carat.toFixed(2)} ct size, about ${mm} mm across`)

  const cut = CUT_GRADES.indexOf(d.cut)
  if (cut >= 3) shines.push(`${d.cut} cut returns most of the light that enters it`)
  else know.push(`${d.cut} cut returns less light than Very Good and above`)

  const clarity = CLARITY_GRADES.indexOf(d.clarity)
  if (clarity <= 2) know.push(`${d.clarity} inclusions can be visible to the naked eye`)
  else if (clarity >= 5) shines.push(`${d.clarity} clarity is eye-clean`)

  const color = COLOR_GRADES.indexOf(d.color)
  if (color <= 3) know.push(`${d.color} color shows slight warmth in white metals`)
  else if (color >= 6) shines.push(`${d.color} color looks bright white in any metal`)

  if (know.length === 0) know.push("Priced above similar stones with lower color or clarity grades")
  return { shines: shines.slice(0, 2), know: know.slice(0, 2) }
}

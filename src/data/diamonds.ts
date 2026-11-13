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

/** Every catalog stone is a round brilliant shown with the Figma tile photo. */
export const DIAMOND_IMAGE = "/images/diamonds/round.png"

export const shapeIcon = (shape: Shape) => `/images/diamonds/shapes/${shape.toLowerCase()}.png`

export interface Diamond {
  id: string
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

export const DIAMONDS: Diamond[] = SPECS.map(([carat, cut, color, clarity, table, depth, girdle], i) => {
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
    topSeller: i === 1 || i === 4,
  }
})

/** Total stones in the (simulated) natural inventory, for "Showing 24 of …". */
export const INVENTORY_COUNT = 5295

export const findDiamond = (id: string | undefined) => DIAMONDS.find((d) => d.id === id)

// ---------------------------------------------------------------------------
// Copy

export const diamondTitle = (d: Diamond) => `${d.carat.toFixed(2)} ct ${d.shape} Natural Diamond`
/** PDP heading (Figma: “Brilliant Round Natural Diamond”) */
export const diamondName = (d: Diamond) => (d.shape === "Round" ? "Brilliant Round Natural Diamond" : `${d.shape} Natural Diamond`)

/** Convert to the shared ring-build Stone (stepper, price summary). */
export function toStone(d: Diamond): Stone {
  return {
    id: d.id,
    title: diamondTitle(d),
    price: d.price,
    carat: d.carat,
    shape: d.shape,
    origin: "Natural Diamond",
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

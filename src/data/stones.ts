import { SETTING } from "@/data/dyo"

/**
 * Loose stone catalogue for Test 2 (Stone Preferences & Recommendations) and the Diamonds PLP.
 *
 * Every price comes from one pricing model (`priceOf`), so the preference simulator, the three
 * recommendations, the "View All (N)" counts and the PLP grid always agree. The catalogue is
 * generated from a fixed seed: the same stones, prices and counts on every visit.
 */

// ---------------------------------------------------------------------------------------------
// Stone types, shapes and grades
// ---------------------------------------------------------------------------------------------

export type StoneTypeId = "natural" | "lab" | "gemstone"

export interface StoneType {
  id: StoneTypeId
  /** Toggle label on the preferences form */
  label: string
  /** PLP title and filter chip */
  plpLabel: string
  /** Product name suffix: "1.21 ct Round Natural Diamond" */
  noun: string
  /** Short form for the price summary: "Center stone · 1.00 ct natural" */
  short: string
  /** Total ring budget slider range (Variant B and C). The top value reads "$25,000+". */
  budget: { min: number; max: number }
}

export const STONE_TYPES: StoneType[] = [
  { id: "natural", label: "Natural", plpLabel: "Natural Diamonds", noun: "Natural Diamond", short: "natural", budget: { min: 1500, max: 25000 } },
  { id: "lab", label: "Lab Grown", plpLabel: "Lab-Grown Diamonds", noun: "Lab-Grown Diamond", short: "lab-grown", budget: { min: 1000, max: 12000 } },
  { id: "gemstone", label: "Gemstones", plpLabel: "Gemstones", noun: "Blue Sapphire", short: "sapphire", budget: { min: 1000, max: 10000 } },
]

export const stoneType = (id: StoneTypeId) => STONE_TYPES.find((t) => t.id === id)!

export interface StoneShape {
  id: string
  label: string
  /** Pattern Library "Stone Shape" line icon */
  icon: string
  /** Price relative to a round of the same weight and grades */
  factor: number
}

/** Order of the preferences form (Figma): the first 8 show, the rest sit behind "+N". */
export const STONE_SHAPES: StoneShape[] = [
  { id: "round", label: "Round", icon: "/images/plp/shapes/round.png", factor: 1 },
  { id: "oval", label: "Oval", icon: "/images/plp/shapes/oval.png", factor: 0.86 },
  { id: "pear", label: "Pear", icon: "/images/plp/shapes/pear.png", factor: 0.8 },
  { id: "emerald", label: "Emerald", icon: "/images/plp/shapes/emerald.png", factor: 0.78 },
  { id: "princess", label: "Princess", icon: "/images/plp/shapes/princess.png", factor: 0.76 },
  { id: "cushion", label: "Cushion", icon: "/images/plp/shapes/cushion.png", factor: 0.77 },
  { id: "heart", label: "Heart", icon: "/images/plp/shapes/heart.png", factor: 0.83 },
  { id: "asscher", label: "Asscher", icon: "/images/plp/shapes/asscher.png", factor: 0.79 },
  { id: "marquise", label: "Marquise", icon: "/images/plp/shapes/marquise.png", factor: 0.8 },
  { id: "radiant", label: "Radiant", icon: "/images/plp/shapes/radiant.png", factor: 0.79 },
]

export const stoneShape = (id: string) => STONE_SHAPES.find((s) => s.id === id) ?? STONE_SHAPES[0]

/**
 * The Timeless Solitaire (14k yellow gold) rendered with each centre shape and stone size, from
 * shaneco.com's "Preview with Shape" (Scene7 `designer-ring/570/diamond-{shape}_{code}_{code}/
 * built-item_41004888_P`). The renders show a diamond whatever the stone type.
 *
 * The size code scales the stone linearly (stone width ≈ code px in a 1000 px render). Calibrated
 * by eye against the band (≈ 20.5 mm outside diameter ≈ 42.5 px/mm): code ≈ 42.5 × (stone mm + 0.5 mm
 * of prongs), with a round's diameter ≈ 6.5 mm × carat^⅓. So 1 ct ≈ 298, 0.25 ct ≈ 195, 4 ct ≈ 460.
 * Codes are stored in steps of 20 (200–460), which keeps the set to 14 sizes per shape.
 */
export const PREVIEW_CODES = { min: 200, max: 460, step: 20 }

export function previewCode(carat: number) {
  const code = 42.5 * (6.5 * Math.cbrt(Math.max(carat, 0.01)) + 0.5)
  const { min, max, step } = PREVIEW_CODES
  return Math.min(max, Math.max(min, Math.round(code / step) * step))
}

export const shapePreviewImage = (shape: string, carat: number) =>
  `/images/stone-preview/timeless-solitaire-yg/${stoneShape(shape).id}-${previewCode(carat)}.webp`

interface Grade {
  label: string
  /** Price multiplier */
  m: number
  /** Short description (cut filter rows) */
  detail?: string
}

/** Grade scales, worst first. Diamonds and sapphires are graded differently. */
const DIAMOND_GRADES = {
  color: [
    { label: "M", m: 0.55 },
    { label: "L", m: 0.6 },
    { label: "K", m: 0.68 },
    { label: "J", m: 0.78 },
    { label: "I", m: 0.88 },
    { label: "H", m: 0.94 },
    { label: "G", m: 1 },
    { label: "F", m: 1.1 },
    { label: "E", m: 1.2 },
    { label: "D", m: 1.35 },
  ],
  clarity: [
    { label: "I3", m: 0.4 },
    { label: "I2", m: 0.5 },
    { label: "I1", m: 0.62 },
    { label: "SI2", m: 0.8 },
    { label: "SI1", m: 0.9 },
    { label: "VS2", m: 1 },
    { label: "VS1", m: 1.08 },
    { label: "VVS2", m: 1.18 },
    { label: "VVS1", m: 1.28 },
    { label: "IF", m: 1.42 },
  ],
  cut: [
    { label: "Poor", m: 0.7, detail: "Limited sparkle and brilliance" },
    { label: "Fair", m: 0.8, detail: "Some sparkle with visible dark areas" },
    { label: "Good", m: 0.9, detail: "Balanced sparkle and value" },
    { label: "Very Good", m: 1, detail: "Exceptional sparkle at a great value" },
    { label: "Excellent", m: 1.08, detail: "Magnificent sparkle and light return" },
    { label: "Shane Classic", m: 1.15, detail: "Maximum sparkle and brilliance" },
  ],
} satisfies Record<string, Grade[]>

const SAPPHIRE_GRADES = {
  color: [
    { label: "Light Blue", m: 0.5 },
    { label: "Medium Blue", m: 0.8 },
    { label: "Cornflower", m: 1.1 },
    { label: "Royal Blue", m: 1.5 },
  ],
  clarity: [
    { label: "Included", m: 0.6 },
    { label: "Slightly Included", m: 0.85 },
    { label: "Eye Clean", m: 1 },
    { label: "Very Clean", m: 1.2 },
  ],
  cut: [
    { label: "Good", m: 0.9, detail: "Good brilliance" },
    { label: "Very Good", m: 1, detail: "Lively colour and brilliance" },
    { label: "Excellent", m: 1.1, detail: "Maximum colour and brilliance" },
  ],
} satisfies Record<string, Grade[]>

export const gradesFor = (type: StoneTypeId) => (type === "gemstone" ? SAPPHIRE_GRADES : DIAMOND_GRADES)

/** Grade indexes the catalogue actually stocks (worst → best), per type. */
const STOCKED = {
  natural: { color: [2, 9], clarity: [3, 9], cut: [2, 5] },
  lab: { color: [3, 9], clarity: [4, 9], cut: [3, 5] },
  gemstone: { color: [0, 3], clarity: [0, 3], cut: [0, 2] },
} as const

/** Price model per type: price = base × carat^exp × shape × color × clarity × cut. */
const MODEL: Record<StoneTypeId, { base: number; exp: number }> = {
  // Calibrated so a 1.21 ct G VS2 Very Good round lands at $5,825 (the Test 4 stone).
  natural: { base: 4134, exp: 1.8 },
  lab: { base: 1050, exp: 1.5 },
  gemstone: { base: 1500, exp: 1.6 },
}

export const CARAT = { min: 0.25, max: 4 }

const roundTo = (n: number, step: number) => Math.round(n / step) * step

function quality(type: StoneTypeId, color: number, clarity: number, cut: number) {
  const g = gradesFor(type)
  return g.color[color].m * g.clarity[clarity].m * g.cut[cut].m
}

/** Multipliers of the lowest and highest grades in stock (the ends of every simulated range). */
function qualityBounds(type: StoneTypeId) {
  const s = STOCKED[type]
  return {
    low: quality(type, s.color[0], s.clarity[0], s.cut[0]),
    top: quality(type, s.color[1], s.clarity[1], s.cut[1]),
  }
}

/** Model price of a stone (before the small per-stone variation the catalogue adds). */
export function modelPrice(type: StoneTypeId, shape: string, carat: number, q: number) {
  const { base, exp } = MODEL[type]
  return base * carat ** exp * stoneShape(shape).factor * q
}

/** Largest carat a stone budget buys at grade multiplier q (inverse of modelPrice). */
function caratFor(type: StoneTypeId, shape: string, stoneBudget: number, q: number) {
  const { base, exp } = MODEL[type]
  return (stoneBudget / (base * stoneShape(shape).factor * q)) ** (1 / exp)
}

// ---------------------------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------------------------

export interface LooseStone {
  id: string
  type: StoneTypeId
  shape: string
  carat: number
  /** Grade indexes into gradesFor(type) */
  color: number
  clarity: number
  cut: number
  price: number
  /** Deterministic "Popular" sort rank */
  popularity: number
}

/** mulberry32: small seeded PRNG so the catalogue is identical on every load. */
function rng(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Share of each type's stock by shape (round dominates, as on shaneco.com). */
const SHAPE_MIX: Record<string, number> = {
  round: 0.32, oval: 0.14, pear: 0.07, emerald: 0.08, princess: 0.08,
  cushion: 0.09, heart: 0.03, asscher: 0.04, marquise: 0.05, radiant: 0.1,
}

/** Catalogue sizes; natural matches the Figma PLP ("5,295 Items"). */
const STOCK_SIZE: Record<StoneTypeId, number> = { natural: 5295, lab: 3640, gemstone: 860 }

/** Index in [lo, hi] leaning to the middle grades (where most stock sits). */
const pickGrade = (r: () => number, [lo, hi]: readonly [number, number]) =>
  Math.min(hi, lo + Math.floor(((r() + r() + r()) / 3) * (hi - lo + 1)))

function generate(): LooseStone[] {
  const out: LooseStone[] = []
  for (const type of STONE_TYPES) {
    const r = rng(type.id.length * 7919 + 17)
    for (const shape of STONE_SHAPES) {
      const count = Math.round(STOCK_SIZE[type.id] * SHAPE_MIX[shape.id])
      for (let i = 0; i < count; i++) {
        // Weights cluster around 0.5–1.5 ct with a long tail up to 4 ct.
        const carat = Math.round((CARAT.min + (CARAT.max - CARAT.min) * r() ** 2.3) * 100) / 100
        const s = STOCKED[type.id]
        const color = pickGrade(r, s.color)
        const clarity = pickGrade(r, s.clarity)
        const cut = pickGrade(r, s.cut)
        const variation = 0.95 + r() * 0.1
        const price = Math.max(150, roundTo(modelPrice(type.id, shape.id, carat, quality(type.id, color, clarity, cut)) * variation, 5))
        out.push({ id: `${type.id}-${shape.id}-${i}`, type: type.id, shape: shape.id, carat, color, clarity, cut, price, popularity: r() })
      }
    }
  }
  return out
}

export const STONES: LooseStone[] = generate()

export const stoneTitle = (s: Pick<LooseStone, "type" | "shape" | "carat">) =>
  `${s.carat.toFixed(2)} ct ${stoneShape(s.shape).label} ${stoneType(s.type).noun}`

export function stoneSpecs(s: LooseStone) {
  const g = gradesFor(s.type)
  return { color: g.color[s.color].label, clarity: g.clarity[s.clarity].label, cut: g.cut[s.cut].label }
}

/** Product photo: we only have round diamond photography, so other shapes show their shape drawing. */
export function stoneImage(s: Pick<LooseStone, "type" | "shape">) {
  if (s.shape === "round" && s.type !== "gemstone") return { src: "/images/finishing/diamond-top.jpg", photo: true }
  return { src: stoneShape(s.shape).icon, photo: false }
}

// ---------------------------------------------------------------------------------------------
// Preferences (2a): what each variant's simulator shows
// ---------------------------------------------------------------------------------------------

/** Ranges shown on the form are rounded to $25 (Figma: $3,175 – $12,275). */
export const price25 = (n: number) => roundTo(n, 25)
export const carat2 = (n: number) => Math.round(n * 100) / 100

const clampCarat = (c: number) => Math.min(CARAT.max, Math.max(CARAT.min, c))

/** Variant A: ±0.25 ct either side of the chosen size. */
export const SIZE_WINDOW = 0.25
/** Variant C (and its picks): stones within ±0.10 ct count as "this size". */
export const SIZE_TOLERANCE = 0.1
/** Budget variants also show stones that run a little over (Figma B note). */
export const OVER_BUDGET = 1.05

/** Whole-ring price range for a carat window (Variant A). */
export function ringRangeForWindow(type: StoneTypeId, shape: string, lo: number, hi: number) {
  const q = qualityBounds(type)
  const stoneMin = price25(modelPrice(type, shape, clampCarat(lo), q.low))
  const stoneMax = price25(modelPrice(type, shape, clampCarat(hi), q.top))
  return { stoneMin, stoneMax, ringMin: stoneMin + SETTING.price, ringMax: stoneMax + SETTING.price }
}

/** Sizes a total ring budget buys (Variant B): at the top grades and at the lowest grades. */
export function caratRangeForBudget(type: StoneTypeId, shape: string, ringBudget: number) {
  const stoneBudget = ringBudget - SETTING.price
  const q = qualityBounds(type)
  const cheapest = modelPrice(type, shape, CARAT.min, q.low)
  if (stoneBudget < cheapest) return { stoneBudget, empty: true as const }
  const atTop = caratFor(type, shape, stoneBudget, q.top)
  const atLow = caratFor(type, shape, stoneBudget, q.low)
  return {
    stoneBudget,
    empty: false as const,
    /** Largest stone at the highest grades (null: top grades start above this budget) */
    topQuality: atTop >= CARAT.min ? carat2(Math.min(CARAT.max, atTop)) : null,
    /** Largest stone at the lowest grades we stock */
    lowQuality: carat2(Math.min(CARAT.max, atLow)),
  }
}

/** Sizes with at least one stone inside a budget band (Variant C carat slider highlight). */
export function availableCarats(type: StoneTypeId, shape: string, ringLo: number, ringHi: number) {
  const q = qualityBounds(type)
  const lo = Math.max(0, ringLo - SETTING.price)
  const hi = ringHi - SETTING.price
  // Smallest size whose top grades reach the bottom of the budget; largest the lowest grades can afford.
  const from = lo <= 0 ? CARAT.min : caratFor(type, shape, lo, q.top)
  const to = hi <= 0 ? 0 : caratFor(type, shape, hi, q.low)
  const a = carat2(clampCarat(from))
  const b = carat2(clampCarat(to))
  return to < CARAT.min || from > CARAT.max || a > b ? null : { from: a, to: b }
}

/** Price of one size across all grades, and the part inside a budget (Variant C). */
export function sizeInBudget(type: StoneTypeId, shape: string, carat: number, ringLo: number, ringHi: number) {
  const { ringMin, ringMax } = ringRangeForWindow(type, shape, carat, carat)
  const inLo = Math.max(ringMin, ringLo)
  const inHi = Math.min(ringMax, ringHi)
  const q = qualityBounds(type)
  // Largest size whose top grades fit under the budget ceiling.
  const topFits = caratFor(type, shape, ringHi - SETTING.price, q.top)
  return {
    ringMin,
    ringMax,
    inBudget: inLo <= inHi ? { lo: inLo, hi: inHi } : null,
    topFitsCarat: topFits >= CARAT.min ? carat2(Math.floor(Math.min(CARAT.max, topFits) * 20) / 20) : null,
  }
}

// ---------------------------------------------------------------------------------------------
// Filtering (shared by "View All (N)", recommendations and the PLP)
// ---------------------------------------------------------------------------------------------

export interface StoneFilters {
  type: StoneTypeId
  shapes: string[]
  /** Stone price (not ring price) */
  minPrice: number | null
  maxPrice: number | null
  minCarat: number | null
  maxCarat: number | null
  /** Cut grade indexes; empty = all */
  cuts: number[]
  /** Inclusive grade index ranges; null = all */
  color: [number, number] | null
  clarity: [number, number] | null
}

export const emptyStoneFilters = (type: StoneTypeId): StoneFilters => ({
  type, shapes: [], minPrice: null, maxPrice: null, minCarat: null, maxCarat: null, cuts: [], color: null, clarity: null,
})

export function matches(s: LooseStone, f: StoneFilters) {
  return (
    s.type === f.type &&
    (!f.shapes.length || f.shapes.includes(s.shape)) &&
    (f.minPrice === null || s.price >= f.minPrice) &&
    (f.maxPrice === null || s.price <= f.maxPrice) &&
    (f.minCarat === null || s.carat >= f.minCarat - 1e-9) &&
    (f.maxCarat === null || s.carat <= f.maxCarat + 1e-9) &&
    (!f.cuts.length || f.cuts.includes(s.cut)) &&
    (!f.color || (s.color >= f.color[0] && s.color <= f.color[1])) &&
    (!f.clarity || (s.clarity >= f.clarity[0] && s.clarity <= f.clarity[1]))
  )
}

export const filterStones = (f: StoneFilters) => STONES.filter((s) => matches(s, f))

/** Stone price bounds for a type (PLP price slider). */
export function stonePriceBounds(type: StoneTypeId) {
  let min = Infinity
  let max = 0
  for (const s of STONES) {
    if (s.type !== type) continue
    min = Math.min(min, s.price)
    max = Math.max(max, s.price)
  }
  return { min: Math.floor(min / 50) * 50, max: Math.ceil(max / 50) * 50 }
}

/** Stocked grade index range per type (PLP sliders start at the full range). */
export const stockedRange = (type: StoneTypeId, key: "color" | "clarity" | "cut") => STOCKED[type][key]

// ---------------------------------------------------------------------------------------------
// Recommendations (2b)
// ---------------------------------------------------------------------------------------------

export type PickKind = "best-price" | "our-pick" | "best-quality"

export interface StonePick {
  kind: PickKind
  label: string
  description: string
  stone: LooseStone
}

/** Grade score used to rank "Best Quality" (log of the price multipliers). */
const gradeScore = (s: LooseStone) => Math.log(quality(s.type, s.color, s.clarity, s.cut))

/**
 * Three curated picks from the stones that match the shopper's preferences:
 *  - Best Price: the lowest price that still meets a quality floor (J+, SI1+, Very Good cut+)
 *  - Our Pick: G–H colour, VS clarity, Excellent cut or better, closest to the target size
 *  - Best Quality: the highest grades in the set
 * Each pick is a different stone.
 */
export function recommend(candidates: LooseStone[], targetCarat: number | null): StonePick[] {
  if (!candidates.length) return []
  const diamond = candidates[0].type !== "gemstone"
  const floor = (s: LooseStone) => (diamond ? s.color >= 3 && s.clarity >= 4 && s.cut >= 3 : s.color >= 1 && s.clarity >= 1)
  const balanced = (s: LooseStone) => (diamond ? s.color >= 5 && s.color <= 6 && s.clarity >= 5 && s.clarity <= 6 && s.cut >= 4 : s.color === 2 && s.clarity >= 2 && s.cut >= 1)
  const used = new Set<string>()
  const take = (pool: LooseStone[], by: (a: LooseStone, b: LooseStone) => number) => {
    const s = pool.filter((x) => !used.has(x.id)).sort(by)[0]
    if (s) used.add(s.id)
    return s
  }
  const closeness = (s: LooseStone) => (targetCarat === null ? -s.carat : Math.abs(s.carat - targetCarat))
  // Price and quality picks range over every matching size: in A the shopper set that range themselves.
  const bestQuality = take(candidates, (a, b) => gradeScore(b) - gradeScore(a) || b.carat - a.carat || a.price - b.price)
  const ourPick =
    take(candidates.filter(balanced), (a, b) => closeness(a) - closeness(b) || a.price - b.price) ??
    take(candidates, (a, b) => closeness(a) - closeness(b) || Math.abs(gradeScore(a)) - Math.abs(gradeScore(b)))
  const bestPrice =
    take(candidates.filter(floor), (a, b) => a.price - b.price || b.carat - a.carat) ??
    take(candidates, (a, b) => a.price - b.price)

  const picks: StonePick[] = []
  if (bestPrice) picks.push({ kind: "best-price", label: "Best Price", description: "The lowest price that still meets our quality standards.", stone: bestPrice })
  if (ourPick) picks.push({ kind: "our-pick", label: "Our Pick", description: "The best balance of size, sparkle and color.", stone: ourPick })
  if (bestQuality) picks.push({ kind: "best-quality", label: "Best Quality", description: "The highest color, clarity and cut grades in your range.", stone: bestQuality })
  return picks
}

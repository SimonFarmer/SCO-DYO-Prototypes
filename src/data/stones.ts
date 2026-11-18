import { SETTING } from "@/data/dyo"
import { ringRender } from "@/data/stone-renders"

/**
 * Loose stone catalogue for Test 2 (Stone Preferences & Recommendations) and the Diamonds PLP.
 *
 * Behaviour follows the "BASIC Diamond Preferences + Recommendations (DYO Step 2)" concept:
 * shop by size, by budget, or both; a stepped budget scale capped per stone type; sizes and
 * prices read from stock in windows around a size; three picks (Best value, Largest size, Finest quality).
 * Gemstones follow shaneco.com's Timeless Solitaire page (p/41004888): Shane Co.'s 20 gemstones, sized
 * in millimetres, each with the shapes and size range Shane Co. offers for this setting.
 *
 * Every number comes from this one seeded catalogue, so the simulator, the picks, the
 * "View All (N)" counts and the PLP always agree, and they're the same on every visit.
 */

// ---------------------------------------------------------------------------------------------
// Stone types, shapes, gemstones and grades
// ---------------------------------------------------------------------------------------------

export type StoneTypeId = "natural" | "lab" | "gemstone"

export interface StoneType {
  id: StoneTypeId
  /** Toggle label on the preferences form */
  label: string
  /** PLP title and filter chip */
  plpLabel: string
  /** Product name suffix for diamonds: "1.21 ct Round Natural Diamond" (gemstones use the gem name) */
  noun: string
  /** Plural for copy: "Three natural diamonds in round…" */
  plural: string
  /** Primary action on the picks */
  cta: string
}

export const STONE_TYPES: StoneType[] = [
  { id: "natural", label: "Natural", plpLabel: "Natural Diamonds", noun: "Natural Diamond", plural: "natural diamonds", cta: "Choose This Diamond" },
  { id: "lab", label: "Lab Grown", plpLabel: "Lab-Grown Diamonds", noun: "Lab-Grown Diamond", plural: "lab-grown diamonds", cta: "Choose This Diamond" },
  { id: "gemstone", label: "Gemstones", plpLabel: "Gemstones", noun: "Gemstone", plural: "gemstones", cta: "Choose This Gemstone" },
]

export const stoneType = (id: StoneTypeId) => STONE_TYPES.find((t) => t.id === id)!

export interface StoneShape {
  id: string
  label: string
  /** Pattern Library "Stone Shape" line icon */
  icon: string
  /** Diamond price relative to a round of the same weight and grades */
  factor: number
  /** Gemstone weight relative to a round of the same millimetre size */
  volume: number
}

/** Order of the preferences form (Figma): the first 8 show, the rest sit behind "+N". */
export const STONE_SHAPES: StoneShape[] = [
  { id: "round", label: "Round", icon: "/images/plp/shapes/round.png", factor: 1, volume: 1 },
  { id: "oval", label: "Oval", icon: "/images/plp/shapes/oval.png", factor: 0.85, volume: 0.85 },
  { id: "pear", label: "Pear", icon: "/images/plp/shapes/pear.png", factor: 0.8, volume: 0.75 },
  { id: "emerald", label: "Emerald", icon: "/images/plp/shapes/emerald.png", factor: 0.78, volume: 0.95 },
  { id: "princess", label: "Princess", icon: "/images/plp/shapes/princess.png", factor: 0.82, volume: 1.2 },
  { id: "cushion", label: "Cushion", icon: "/images/plp/shapes/cushion.png", factor: 0.8, volume: 1.1 },
  { id: "heart", label: "Heart", icon: "/images/plp/shapes/heart.png", factor: 0.85, volume: 0.9 },
  { id: "asscher", label: "Asscher", icon: "/images/plp/shapes/asscher.png", factor: 0.78, volume: 1.15 },
  { id: "marquise", label: "Marquise", icon: "/images/plp/shapes/marquise.png", factor: 0.8, volume: 0.55 },
  { id: "radiant", label: "Radiant", icon: "/images/plp/shapes/radiant.png", factor: 0.8, volume: 1.05 },
]

export const stoneShape = (id: string) => STONE_SHAPES.find((s) => s.id === id) ?? STONE_SHAPES[0]

export interface Gem {
  id: string
  /** Shane Co. display name ("Preview with Gemstone") */
  label: string
  /** Shane Co. render name for the ring preview */
  render: string
  /** Shane Co. swatch icon */
  icon: string
  /** Size range Shane Co. offers on this setting, in millimetres (0.5 mm steps) */
  sizeMm: { min: number; max: number }
  /** Shapes Shane Co. offers on this setting */
  shapes: string[]
  /** Price per carat at medium grades (simulated) and specific gravity (for carat weight from mm) */
  perCarat: number
  sg: number
}

/**
 * The 20 gemstones Shane Co. offers on the Timeless Solitaire (shaneco.com p/41004888, Nov 2026),
 * in their order, with their labels, swatch icons, shapes and size ranges. Prices are simulated.
 */
export const GEMS: Gem[] = [
  { id: "white-sapphire", label: "White Sapphire", render: "white", icon: "/images/gemstones/white-sapphire.png", sizeMm: { min: 4, max: 8 }, shapes: ["round", "cushion", "oval", "emerald", "heart", "pear", "princess", "radiant", "marquise", "asscher"], perCarat: 450, sg: 4 },
  { id: "amethyst", label: "Amethyst", render: "amethyst", icon: "/images/gemstones/amethyst.png", sizeMm: { min: 5, max: 10 }, shapes: ["round", "cushion", "oval", "pear", "emerald", "heart"], perCarat: 80, sg: 2.65 },
  { id: "aquamarine", label: "Aquamarine", render: "aquamarine", icon: "/images/gemstones/aquamarine.png", sizeMm: { min: 5, max: 10 }, shapes: ["round", "oval", "cushion", "pear", "emerald", "heart"], perCarat: 300, sg: 2.7 },
  { id: "traditional-sapphire", label: "Traditional Sapphire", render: "traditional-blue", icon: "/images/gemstones/traditional-sapphire.png", sizeMm: { min: 4, max: 9 }, shapes: ["round", "oval", "heart", "cushion", "emerald", "marquise", "pear"], perCarat: 1200, sg: 4 },
  { id: "morganite", label: "Morganite", render: "morganite", icon: "/images/gemstones/morganite.png", sizeMm: { min: 5, max: 10 }, shapes: ["round", "oval", "pear", "cushion", "emerald", "heart"], perCarat: 250, sg: 2.8 },
  { id: "green-sapphire", label: "Green Sapphire", render: "green", icon: "/images/gemstones/green-sapphire.png", sizeMm: { min: 4.5, max: 9 }, shapes: ["round", "oval", "cushion", "heart", "emerald", "pear", "marquise"], perCarat: 700, sg: 4 },
  { id: "yellow-sapphire", label: "Yellow Sapphire", render: "yellow", icon: "/images/gemstones/yellow-sapphire.png", sizeMm: { min: 4, max: 8 }, shapes: ["round", "cushion", "oval", "pear", "emerald", "heart", "princess", "asscher", "radiant", "marquise"], perCarat: 800, sg: 4 },
  { id: "kentucky-blue-sapphire", label: "Kentucky Blue Sapphire", render: "kentucky-blue", icon: "/images/gemstones/kentucky-blue-sapphire.png", sizeMm: { min: 4, max: 8 }, shapes: ["round", "cushion", "oval", "heart", "pear", "emerald", "marquise"], perCarat: 1400, sg: 4 },
  { id: "black-sapphire", label: "Black Sapphire", render: "black", icon: "/images/gemstones/black-sapphire.png", sizeMm: { min: 4, max: 9 }, shapes: ["round", "cushion", "emerald", "oval", "pear", "marquise", "heart"], perCarat: 150, sg: 4 },
  { id: "ice-blue-sapphire", label: "Ice Blue Sapphire", render: "ice-blue", icon: "/images/gemstones/ice-blue-sapphire.png", sizeMm: { min: 4, max: 8 }, shapes: ["round", "oval", "cushion", "pear", "heart", "emerald"], perCarat: 750, sg: 4 },
  { id: "pink-sapphire", label: "Pink Sapphire", render: "pink", icon: "/images/gemstones/pink-sapphire.png", sizeMm: { min: 4, max: 7 }, shapes: ["round", "pear", "oval", "heart", "cushion", "emerald", "marquise", "princess"], perCarat: 1000, sg: 4 },
  { id: "ruby", label: "Ruby", render: "ruby", icon: "/images/gemstones/ruby.png", sizeMm: { min: 4, max: 7 }, shapes: ["round", "marquise", "emerald", "oval", "pear", "heart", "cushion"], perCarat: 1600, sg: 4 },
  { id: "orange-sapphire", label: "Orange Sapphire", render: "orange", icon: "/images/gemstones/orange-sapphire.png", sizeMm: { min: 4, max: 6.5 }, shapes: ["round", "heart", "marquise", "oval"], perCarat: 800, sg: 4 },
  { id: "blue-green-sapphire", label: "Blue Green Sapphire", render: "bluegreen", icon: "/images/gemstones/blue-green-sapphire.png", sizeMm: { min: 4.5, max: 8 }, shapes: ["round", "oval", "emerald", "pear", "cushion", "heart", "radiant"], perCarat: 900, sg: 4 },
  { id: "lavender-sapphire", label: "Lavender Sapphire", render: "lavender", icon: "/images/gemstones/lavender-sapphire.png", sizeMm: { min: 4, max: 6.5 }, shapes: ["round", "oval", "heart", "cushion", "pear", "emerald", "asscher"], perCarat: 850, sg: 4 },
  { id: "teal-sapphire", label: "Teal Sapphire", render: "teal", icon: "/images/gemstones/teal-sapphire.png", sizeMm: { min: 4, max: 7 }, shapes: ["round", "emerald", "pear", "cushion", "oval"], perCarat: 1000, sg: 4 },
  { id: "peach-sapphire", label: "Peach Sapphire", render: "peach", icon: "/images/gemstones/peach-sapphire.png", sizeMm: { min: 4, max: 8 }, shapes: ["heart", "cushion", "round", "oval", "pear", "emerald", "radiant", "asscher"], perCarat: 850, sg: 4 },
  { id: "raspberry-sapphire", label: "Raspberry Sapphire", render: "rasberry", icon: "/images/gemstones/raspberry-sapphire.png", sizeMm: { min: 4.5, max: 7 }, shapes: ["round", "oval", "cushion"], perCarat: 1200, sg: 4 },
  { id: "fire-sapphire", label: "Fire Sapphire", render: "fire", icon: "/images/gemstones/fire-sapphire.png", sizeMm: { min: 4.5, max: 6.5 }, shapes: ["cushion", "round", "oval", "pear", "heart"], perCarat: 1100, sg: 4 },
  { id: "cognac-sapphire", label: "Cognac Sapphire", render: "cognac", icon: "/images/gemstones/cognac-sapphire.png", sizeMm: { min: 4.5, max: 5 }, shapes: ["round", "heart", "oval", "cushion"], perCarat: 650, sg: 4 },
]

export const DEFAULT_GEM = "traditional-sapphire"
export const gemById = (id: string | undefined) => GEMS.find((g) => g.id === id) ?? GEMS[0]

/** Shapes on offer for a scope: every shape for diamonds, Shane Co.'s list for a gemstone. */
export const shapesFor = (type: StoneTypeId, gem?: string) => (type === "gemstone" ? gemById(gem).shapes : STONE_SHAPES.map((s) => s.id))

interface Grade {
  label: string
  /** Price multiplier */
  m: number
  /** Short description (cut filter rows) */
  detail?: string
}

/** Grade scales, worst first. Diamonds and coloured gemstones are graded differently. */
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

const GEMSTONE_GRADES = {
  color: [
    { label: "Light", m: 0.5 },
    { label: "Medium", m: 0.8 },
    { label: "Rich", m: 1.1 },
    { label: "Vivid", m: 1.5 },
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

export const gradesFor = (type: StoneTypeId) => (type === "gemstone" ? GEMSTONE_GRADES : DIAMOND_GRADES)

/** Grade indexes the catalogue actually stocks (worst → best), per type. */
const STOCKED = {
  natural: { color: [2, 9], clarity: [3, 9], cut: [2, 5] },
  lab: { color: [3, 9], clarity: [4, 9], cut: [3, 5] },
  gemstone: { color: [0, 3], clarity: [0, 3], cut: [0, 2] },
} as const

/** Diamond price model: price = base × carat^exp × shape × color × clarity × cut. */
const DIAMOND_MODEL: Record<"natural" | "lab", { base: number; exp: number }> = {
  // Calibrated so a 1.21 ct G VS2 Very Good round lands at $5,825 (the Test 4 stone).
  natural: { base: 4134, exp: 1.8 },
  lab: { base: 1050, exp: 1.5 },
}

/** Diamonds are stocked from 0.25 to 4 ct. */
export const CARAT = { min: 0.25, max: 4 }

const roundTo = (n: number, step: number) => Math.round(n / step) * step

function quality(type: StoneTypeId, color: number, clarity: number, cut: number) {
  const g = gradesFor(type)
  return g.color[color].m * g.clarity[clarity].m * g.cut[cut].m
}

/** Approximate carat weight of a gemstone from its millimetre size (≈ 0.0012 × mm³ × SG for a round). */
export const gemCarat = (gem: Gem, shape: string, mm: number) => Math.round(0.0012 * mm ** 3 * gem.sg * stoneShape(shape).volume * 100) / 100

// ---------------------------------------------------------------------------------------------
// Size: carats for diamonds, millimetres for gemstones (as on shaneco.com)
// ---------------------------------------------------------------------------------------------

export interface SizeScale {
  min: number
  max: number
  step: number
  /** Window either side of a size that counts as "this size" (concept: ±0.25 ct) */
  window: number
  unit: "ct" | "mm"
}

/** Diamonds: the concept's fixed 0.25–5.00 ct line. Gemstones: the gem's range on this setting, 0.5 mm steps. */
export function sizeScale(type: StoneTypeId, gem?: string): SizeScale {
  if (type !== "gemstone") return { min: 0.25, max: 5, step: 0.25, window: 0.25, unit: "ct" }
  const { min, max } = gemById(gem).sizeMm
  return { min, max, step: 0.5, window: 0.5, unit: "mm" }
}

export const formatSize = (v: number, unit: "ct" | "mm") => (unit === "ct" ? `${v.toFixed(2)} ct` : `${v.toFixed(1)} mm`)

/** Snap and clamp a size onto a scale. */
export const snapSize = (v: number, s: SizeScale) => Math.min(s.max, Math.max(s.min, Math.round(v / s.step) * s.step))

/** Default size when a scale is first used: 1.00 ct for diamonds, 6.0 mm (or the nearest offered) for gems. */
export const defaultSize = (s: SizeScale) => snapSize(s.unit === "ct" ? 1 : 6, s)

// ---------------------------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------------------------

export interface LooseStone {
  id: string
  type: StoneTypeId
  shape: string
  /** Gemstones only */
  gem?: string
  /** Size on the type's scale: carats for diamonds, millimetres for gemstones */
  size: number
  /** Carat weight (approximate for gemstones, from millimetres) */
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

/** Catalogue sizes; natural matches the Figma PLP ("5,295 Items"). Gemstones: per gem. */
const STOCK_SIZE = { natural: 5295, lab: 3640, perGem: 180 }

/** Index in [lo, hi] leaning to the middle grades (where most stock sits). */
const pickGrade = (r: () => number, [lo, hi]: readonly [number, number]) =>
  Math.min(hi, lo + Math.floor(((r() + r() + r()) / 3) * (hi - lo + 1)))

function generate(): LooseStone[] {
  const out: LooseStone[] = []
  for (const type of ["natural", "lab"] as const) {
    const r = rng(type.length * 7919 + 17)
    const { base, exp } = DIAMOND_MODEL[type]
    for (const shape of STONE_SHAPES) {
      const count = Math.round(STOCK_SIZE[type] * SHAPE_MIX[shape.id])
      for (let i = 0; i < count; i++) {
        // Weights cluster around 0.5–1.5 ct with a long tail up to 4 ct.
        const carat = Math.round((CARAT.min + (CARAT.max - CARAT.min) * r() ** 2.3) * 100) / 100
        const s = STOCKED[type]
        const color = pickGrade(r, s.color)
        const clarity = pickGrade(r, s.clarity)
        const cut = pickGrade(r, s.cut)
        const variation = 0.95 + r() * 0.1
        const price = Math.max(150, roundTo(base * carat ** exp * shape.factor * quality(type, color, clarity, cut) * variation, 5))
        out.push({ id: `${type}-${shape.id}-${i}`, type, shape: shape.id, size: carat, carat, color, clarity, cut, price, popularity: r() })
      }
    }
  }
  // Gemstones come in calibrated millimetre sizes (0.5 mm steps) within each gem's range.
  const r = rng(424242)
  for (const gem of GEMS) {
    const sizes: number[] = []
    for (let m = gem.sizeMm.min; m <= gem.sizeMm.max + 1e-9; m += 0.5) sizes.push(m)
    const weights = gem.shapes.map((sh) => SHAPE_MIX[sh] ?? 0.05)
    const total = weights.reduce((a, b) => a + b, 0)
    gem.shapes.forEach((sh, si) => {
      const count = Math.max(4, Math.round((STOCK_SIZE.perGem * weights[si]) / total))
      for (let i = 0; i < count; i++) {
        const mm = sizes[Math.min(sizes.length - 1, Math.floor(((r() + r()) / 2) * sizes.length))]
        const carat = gemCarat(gem, sh, mm)
        const s = STOCKED.gemstone
        const color = pickGrade(r, s.color)
        const clarity = pickGrade(r, s.clarity)
        const cut = pickGrade(r, s.cut)
        const variation = 0.92 + r() * 0.16
        const price = Math.max(40, roundTo(gem.perCarat * carat ** 1.3 * quality("gemstone", color, clarity, cut) * variation, 5))
        out.push({ id: `gemstone-${gem.id}-${sh}-${i}`, type: "gemstone", shape: sh, gem: gem.id, size: mm, carat, color, clarity, cut, price, popularity: r() })
      }
    })
  }
  return out
}

export const STONES: LooseStone[] = generate()

/** "1.21 ct Round Natural Diamond", "7.0 mm Oval Ruby" */
export function stoneTitle(s: Pick<LooseStone, "type" | "shape" | "size" | "gem">) {
  if (s.type === "gemstone") return `${s.size.toFixed(1)} mm ${stoneShape(s.shape).label} ${gemById(s.gem).label}`
  return `${s.size.toFixed(2)} ct ${stoneShape(s.shape).label} ${stoneType(s.type).noun}`
}

export function stoneSpecs(s: LooseStone) {
  const g = gradesFor(s.type)
  return { color: g.color[s.color].label, clarity: g.clarity[s.clarity].label, cut: g.cut[s.cut].label }
}

/** The stone's render name for ring previews: Shane Co. uses its diamond renders for lab-grown too. */
const renderName = (type: StoneTypeId, gem?: string) => (type === "gemstone" ? gemById(gem).render : "diamond")

/** Ring preview for a scope at a size: Shane Co.'s own render (shaneco.com "Preview with …"). */
export function previewImage(type: StoneTypeId, shape: string, size: number, gem?: string, width = 1000) {
  return ringRender(renderName(type, gem), shape, size, type === "gemstone" ? "mm" : "ct", width)
}

/**
 * Product image: round diamonds use our diamond photography; gemstones show Shane Co.'s render of
 * that gem, shape and size on the ring. We have no loose photography for other diamond shapes, so
 * they show their shape drawing.
 */
export function stoneImage(s: Pick<LooseStone, "type" | "shape" | "gem" | "size">) {
  if (s.type === "gemstone") return { src: previewImage(s.type, s.shape, s.size, s.gem, 600), photo: true, render: true }
  if (s.shape === "round") return { src: "/images/finishing/diamond-top.jpg", photo: true, render: false }
  return { src: stoneShape(s.shape).icon, photo: false, render: false }
}

// ---------------------------------------------------------------------------------------------
// Filtering (shared by "View All (N)", recommendations and the PLP)
// ---------------------------------------------------------------------------------------------

export interface StoneFilters {
  type: StoneTypeId
  shapes: string[]
  /** Gemstone kinds (gemstones only); empty = all */
  gems: string[]
  /** Stone price (not ring price) */
  minPrice: number | null
  maxPrice: number | null
  /** Size on the type's scale (carats for diamonds, millimetres for gemstones) */
  minSize: number | null
  maxSize: number | null
  /** Cut grade indexes; empty = all */
  cuts: number[]
  /** Inclusive grade index ranges; null = all */
  color: [number, number] | null
  clarity: [number, number] | null
}

export const emptyStoneFilters = (type: StoneTypeId): StoneFilters => ({
  type, shapes: [], gems: [], minPrice: null, maxPrice: null, minSize: null, maxSize: null, cuts: [], color: null, clarity: null,
})

export function matches(s: LooseStone, f: StoneFilters) {
  return (
    s.type === f.type &&
    (!f.shapes.length || f.shapes.includes(s.shape)) &&
    (!f.gems.length || (s.gem !== undefined && f.gems.includes(s.gem))) &&
    (f.minPrice === null || s.price >= f.minPrice) &&
    (f.maxPrice === null || s.price <= f.maxPrice) &&
    (f.minSize === null || s.size >= f.minSize - 1e-9) &&
    (f.maxSize === null || s.size <= f.maxSize + 1e-9) &&
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

/** PLP size filter range for a type: carats for diamonds, millimetres for gemstones. */
export function sizeBounds(type: StoneTypeId) {
  if (type !== "gemstone") return { min: CARAT.min, max: CARAT.max, step: 0.05, unit: "ct" as const }
  return { min: Math.min(...GEMS.map((g) => g.sizeMm.min)), max: Math.max(...GEMS.map((g) => g.sizeMm.max)), step: 0.5, unit: "mm" as const }
}

/** Stocked grade index range per type (PLP sliders start at the full range). */
export const stockedRange = (type: StoneTypeId, key: "color" | "clarity" | "cut") => STOCKED[type][key]

// ---------------------------------------------------------------------------------------------
// Preferences (2a): stock for one type + shape (+ gem), read in windows around each size
// ---------------------------------------------------------------------------------------------

/** What the shopper is shopping for: the pool every 2a number is read from. */
export interface StoneScope {
  type: StoneTypeId
  shape: string
  /** Gemstones only */
  gem?: string
}

const scopeCache = new Map<string, LooseStone[]>()
export function stockFor({ type, shape, gem }: StoneScope) {
  const key = `${type}|${shape}|${type === "gemstone" ? gem : ""}`
  let list = scopeCache.get(key)
  if (!list) {
    list = STONES.filter((s) => s.type === type && s.shape === shape && (type !== "gemstone" || s.gem === gem))
    scopeCache.set(key, list)
  }
  return list
}

export interface SizeRow {
  size: number
  /** Stones within the scale's window of this size */
  count: number
  /** Lowest and highest stone price in that window (0 when empty) */
  min: number
  max: number
}

/** Stock by size, one row per step of the scale: the same shape as the real inventory table in the concept. */
export function sizeRows(scope: StoneScope): SizeRow[] {
  const stock = stockFor(scope)
  const scale = sizeScale(scope.type, scope.gem)
  const rows: SizeRow[] = []
  for (let v = scale.min; v <= scale.max + 1e-9; v += scale.step) {
    const size = Math.round(v * 100) / 100
    let count = 0
    let min = Infinity
    let max = 0
    for (const s of stock) {
      if (Math.abs(s.size - size) > scale.window + 1e-9) continue
      count++
      min = Math.min(min, s.price)
      max = Math.max(max, s.price)
    }
    rows.push({ size, count, min: count ? min : 0, max })
  }
  return rows
}

export const rowAt = (rows: SizeRow[], size: number) => rows.find((r) => Math.abs(r.size - size) < 1e-6 && r.count > 0) ?? null

/** Largest size in stock for this scope, on the scale's grid (marked with a tick on the size line). */
export function largestSize(scope: StoneScope) {
  const scale = sizeScale(scope.type, scope.gem)
  let m = 0
  for (const s of stockFor(scope)) m = Math.max(m, s.size)
  return snapSize(m || scale.min, scale)
}

/** Lowest and highest whole-ring price for this scope (the ends of the budget scale). */
export function ringPriceBounds(scope: StoneScope) {
  let min = Infinity
  let max = 0
  for (const s of stockFor(scope)) {
    min = Math.min(min, s.price)
    max = Math.max(max, s.price)
  }
  if (!Number.isFinite(min)) return { lo: SETTING.price, hi: SETTING.price }
  return { lo: SETTING.price + min, hi: SETTING.price + max }
}

/**
 * Budget scale (concept): $100 steps to $10k, $500 steps to $30k, $1,000 above, capped at this
 * scope's lowest and highest ring price. The slider moves along these values, not linearly.
 */
export function budgetScale(scope: StoneScope) {
  const { lo, hi } = ringPriceBounds(scope)
  const values = [lo]
  for (let v = 800; v < 10000; v += 100) if (v > lo + 40 && v < hi - 40) values.push(v)
  for (let v = 10000; v < 30000; v += 500) if (v > lo + 40 && v < hi - 40) values.push(v)
  for (let v = 30000; v <= 150000; v += 1000) if (v > lo + 40 && v < hi - 40) values.push(v)
  if (hi > lo) values.push(hi)
  return values
}

/** Minimum gap between the two budget handles, in scale steps (concept GAP). */
export const BUDGET_GAP = 10

/** Nearest scale index for a value. */
export function scaleIndex(values: number[], v: number) {
  let best = 0
  for (let i = 1; i < values.length; i++) if (Math.abs(values[i] - v) < Math.abs(values[best] - v)) best = i
  return best
}

/** Position (0–100) of a ring price on the stepped scale. */
export function scalePct(values: number[], v: number) {
  if (values.length < 2 || v <= values[0]) return 0
  if (v >= values[values.length - 1]) return 100
  let i = 0
  while (values[i + 1] < v) i++
  return ((i + (v - values[i]) / (values[i + 1] - values[i])) / (values.length - 1)) * 100
}

/** Clamp a chosen budget onto this scope's scale, keeping the handles at least BUDGET_GAP apart. */
export function snapBudget(values: number[], lo: number, hi: number): [number, number] {
  let i = scaleIndex(values, lo)
  let j = scaleIndex(values, hi)
  const gap = Math.min(BUDGET_GAP, values.length - 1)
  if (j - i < gap) {
    if (j >= values.length - 1) i = Math.max(0, j - gap)
    else {
      j = Math.min(values.length - 1, i + gap)
      if (j - i < gap) i = Math.max(0, j - gap)
    }
  }
  return [values[i], values[j]]
}

/** Sizes (on the scale's grid) with at least one stone priced inside a ring budget (the green band). */
export function sizesInBudget(rows: SizeRow[], ringLo: number, ringHi: number) {
  return rows
    .filter((r) => r.count > 0 && SETTING.price + r.max >= ringLo && SETTING.price + r.min <= ringHi)
    .map((r) => r.size)
}

/** Nearest value in a list (the size handle snaps back inside the green band). */
export const nearest = (list: number[], v: number) => list.reduce((b, c) => (Math.abs(c - v) < Math.abs(b - v) ? c : b), list[0])

// ---------------------------------------------------------------------------------------------
// Recommendations (2b): Best value · Largest size · Finest quality (concept)
// ---------------------------------------------------------------------------------------------

export type PickKind = "value" | "size" | "quality"
export type SpecKey = "size" | "clarity" | "color" | "cut"

export interface StonePick {
  kind: PickKind
  label: string
  who: string
  /** "Optimized for …" */
  optimizedFor: string
  why: string
  /** Spec cells this pick optimises (highlighted on the tile) */
  highlight: SpecKey[]
  stone: LooseStone
}

interface PickRecipe {
  kind: PickKind
  label: string
  who: string
  optimizedFor: Record<"diamond" | "gemstone", string>
  highlight: SpecKey[]
  why: Record<StoneTypeId, string>
  /** Target grade indexes (color, clarity, minimum cut) per type */
  target: Record<StoneTypeId, { color: number; clarity: number; cut: number }>
}

const RECIPES: PickRecipe[] = [
  {
    kind: "value",
    label: "Best Value",
    who: "For the budget-minded",
    optimizedFor: { diamond: "balanced grades", gemstone: "color for the price" },
    highlight: ["color", "clarity"],
    why: {
      natural: "H color and VS2 clarity look white and clean to the eye, so you aren’t paying for differences you can’t see.",
      lab: "Strong grades with room to spare, so you get a larger stone at a mid-range price.",
      gemstone: "A well-saturated {gem} with a clean look, chosen for the best color per dollar.",
    },
    target: { natural: { color: 5, clarity: 5, cut: 4 }, lab: { color: 6, clarity: 6, cut: 4 }, gemstone: { color: 2, clarity: 2, cut: 1 } },
  },
  {
    kind: "size",
    label: "Largest Size",
    who: "For the size-seeker",
    optimizedFor: { diamond: "carat weight", gemstone: "size" },
    highlight: ["size"],
    why: {
      natural: "The largest stone that fits. We eased color and clarity a step to add size.",
      lab: "The largest lab-grown stone that fits, with grades kept in the near-colorless range.",
      gemstone: "The largest {gem} that fits, with good color and a clean look.",
    },
    target: { natural: { color: 4, clarity: 4, cut: 3 }, lab: { color: 5, clarity: 5, cut: 3 }, gemstone: { color: 1, clarity: 2, cut: 0 } },
  },
  {
    kind: "quality",
    label: "Finest Quality",
    who: "For the quality-minded",
    optimizedFor: { diamond: "cut, color and clarity", gemstone: "color, clarity and cut" },
    highlight: ["cut", "color", "clarity"],
    why: {
      natural: "The highest grades we have here. For buyers who put sparkle and purity first.",
      lab: "Top-tier grades: colorless, very high clarity and an ideal cut.",
      gemstone: "The most vivid, cleanest {gem} we have, cut to bring out its glow.",
    },
    target: { natural: { color: 7, clarity: 7, cut: 4 }, lab: { color: 9, clarity: 7, cut: 5 }, gemstone: { color: 3, clarity: 3, cut: 2 } },
  },
]

/** How far a stone is from a recipe's grades (0 = on target or better on cut). */
function gradeDistance(s: LooseStone, t: { color: number; clarity: number; cut: number }) {
  return Math.abs(s.color - t.color) + Math.abs(s.clarity - t.clarity) + Math.max(0, t.cut - s.cut)
}

export interface PickContext {
  scope: StoneScope
  /** Shop by: size (A), budget (B) or both (C) */
  mode: "size" | "budget" | "both"
  /** Previewed size, on the scope's scale */
  size: number
  /** Stone budget (ring budget less the setting); budget modes only */
  stoneMin: number
  stoneMax: number
}

/**
 * Three picks from real stock, following the concept's rules:
 *  - Size first: value and quality at the chosen size, largest size up to one window above it.
 *  - Budget first: solved from the stone budget (value ≈ 45% into it, size at the top of it,
 *    quality may run a little over and is flagged).
 *  - Size + Budget: solved from the budget but held within one window of the chosen size.
 * Each pick is a different stone; empty stock gives fewer picks.
 */
export function recommend(ctx: PickContext): StonePick[] {
  const stock = stockFor(ctx.scope)
  const { mode, size } = ctx
  const { window } = sizeScale(ctx.scope.type, ctx.scope.gem)
  const inSize = mode === "budget" ? () => true : (s: LooseStone) => Math.abs(s.size - size) <= window + 1e-9
  const overCap = ctx.stoneMax * 1.05
  const used = new Set<string>()
  const picks: StonePick[] = []
  const kind = ctx.scope.type === "gemstone" ? "gemstone" : "diamond"

  for (const r of RECIPES) {
    const t = r.target[ctx.scope.type]
    let pool = stock.filter((s) => !used.has(s.id) && inSize(s))
    if (mode !== "size") pool = pool.filter((s) => s.price <= (r.kind === "quality" ? overCap : ctx.stoneMax) && s.price >= ctx.stoneMin)
    if (mode !== "budget" && r.kind !== "size") pool = pool.filter((s) => s.size <= size + window / 2)
    if (!pool.length) continue

    let best: LooseStone
    if (r.kind === "size") {
      // Largest stone (on near-target grades) that fits.
      const graded = pool.filter((s) => gradeDistance(s, t) <= 2)
      best = (graded.length ? graded : pool).sort((a, b) => b.size - a.size || gradeDistance(a, t) - gradeDistance(b, t) || a.price - b.price)[0]
    } else if (r.kind === "quality") {
      // In a budget: the top-grade stone (target grades or better) that uses the most of it, so it may
      // run a little over (concept: aims ~3% over). By size, or with no top-grade stock: the highest grades.
      const top = pool.filter((s) => s.color >= t.color && s.clarity >= t.clarity && s.cut >= t.cut)
      best =
        mode !== "size" && top.length
          ? top.sort((a, b) => b.price - a.price)[0]
          : pool.sort(
              (a, b) =>
                quality(b.type, b.color, b.clarity, b.cut) - quality(a.type, a.color, a.clarity, a.cut) ||
                Math.abs(a.size - size) - Math.abs(b.size - size),
            )[0]
    } else {
      // Balanced grades; in a budget, priced about 45% into it; by size, closest to the chosen size.
      const aim = ctx.stoneMin + 0.45 * (ctx.stoneMax - ctx.stoneMin)
      best = pool.sort(
        (a, b) =>
          gradeDistance(a, t) - gradeDistance(b, t) ||
          (mode === "size" ? Math.abs(a.size - size) - Math.abs(b.size - size) : Math.abs(a.price - aim) - Math.abs(b.price - aim)) ||
          a.price - b.price,
      )[0]
    }
    used.add(best.id)
    const gem = gemById(ctx.scope.gem).label.toLowerCase()
    picks.push({
      kind: r.kind,
      label: r.label,
      who: r.who,
      optimizedFor: r.optimizedFor[kind],
      highlight: r.highlight,
      why: r.why[ctx.scope.type].replace("{gem}", gem),
      stone: best,
    })
  }
  return picks
}
